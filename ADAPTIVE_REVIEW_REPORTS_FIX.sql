-- Adaptive Review Reports Fix - Works with any places table structure
-- This script adapts to whatever column names exist in your places table

-- Step 1: Check what tables and columns exist
SELECT 'Checking database structure...' as step;

-- Check tables
SELECT 
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews')) as reviews_exists,
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'places')) as places_exists;

-- Step 2: Create review_reports table (simple, no foreign keys initially)
DROP TABLE IF EXISTS public.review_reports CASCADE;

CREATE TABLE public.review_reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    review_id TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    report_reason TEXT NOT NULL,
    report_category TEXT NOT NULL CHECK (report_category IN ('spam', 'abuse', 'harassment', 'fake', 'inappropriate', 'off-topic', 'other')),
    additional_details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    resolution_notes TEXT
);

-- Step 3: Add foreign key to reviews if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
        ALTER TABLE public.review_reports 
        ADD CONSTRAINT review_reports_review_id_fkey 
        FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to reviews table';
    END IF;
END $$;

-- Step 4: Create indexes
CREATE INDEX idx_review_reports_review_id ON public.review_reports(review_id);
CREATE INDEX idx_review_reports_reported_by ON public.review_reports(reported_by);
CREATE INDEX idx_review_reports_status ON public.review_reports(status);
CREATE INDEX idx_review_reports_created_at ON public.review_reports(created_at);

-- Step 5: Drop existing view
DROP VIEW IF EXISTS public.review_reports_dashboard;

-- Step 6: Create adaptive dashboard view
-- This will work with different column names in places table
DO $$
DECLARE
    host_column_name TEXT;
    view_sql TEXT;
BEGIN
    -- Determine the correct column name for host/owner in places table
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'host_user_id') THEN 'host_user_id'
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'owner_id') THEN 'owner_id'
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'user_id') THEN 'user_id'
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'created_by') THEN 'created_by'
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'host_id') THEN 'host_id'
            ELSE NULL
        END INTO host_column_name;

    IF host_column_name IS NOT NULL THEN
        -- Create view with the correct column name
        view_sql := 'CREATE VIEW public.review_reports_dashboard AS
        SELECT 
            rr.id as report_id,
            rr.review_id,
            rr.report_reason,
            rr.report_category,
            rr.status,
            rr.created_at as reported_at,
            rr.additional_details,
            rr.reviewed_at,
            rr.reviewed_by,
            rr.resolution_notes,
            COALESCE(r.comment, ''No comment'') as review_comment,
            COALESCE(r.rating, 0) as review_rating,
            COALESCE(r.reviewer_name, ''Unknown Reviewer'') as reviewer_name,
            r.created_at as review_created_at,
            COALESCE(p.title, ''Unknown Place'') as place_name,
            COALESCE(p.' || host_column_name || ', ''unknown'') as place_owner_id,
            ''Unknown Reporter'' as reporter_name,
            rr.reported_by as reporter_id
        FROM public.review_reports rr
        LEFT JOIN public.reviews r ON rr.review_id = r.id
        LEFT JOIN public.places p ON r.place_id = p.id
        ORDER BY rr.created_at DESC';
        
        EXECUTE view_sql;
        RAISE NOTICE 'Created dashboard view using column: %', host_column_name;
    ELSE
        -- Create simplified view without places table
        CREATE VIEW public.review_reports_dashboard AS
        SELECT 
            rr.id as report_id,
            rr.review_id,
            rr.report_reason,
            rr.report_category,
            rr.status,
            rr.created_at as reported_at,
            rr.additional_details,
            rr.reviewed_at,
            rr.reviewed_by,
            rr.resolution_notes,
            COALESCE(r.comment, 'No comment') as review_comment,
            COALESCE(r.rating, 0) as review_rating,
            COALESCE(r.reviewer_name, 'Unknown Reviewer') as reviewer_name,
            r.created_at as review_created_at,
            'Unknown Place' as place_name,
            'unknown' as place_owner_id,
            'Unknown Reporter' as reporter_name,
            rr.reported_by as reporter_id
        FROM public.review_reports rr
        LEFT JOIN public.reviews r ON rr.review_id = r.id
        ORDER BY rr.created_at DESC;
        
        RAISE NOTICE 'Created simplified dashboard view without places table';
    END IF;
END $$;

-- Step 7: Grant permissions
GRANT ALL ON public.review_reports TO authenticated;
GRANT SELECT ON public.review_reports_dashboard TO authenticated;
GRANT SELECT ON public.review_reports_dashboard TO anon;

-- Step 8: Enable RLS
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
DROP POLICY IF EXISTS "Users can report reviews" ON public.review_reports;
CREATE POLICY "Users can report reviews" ON public.review_reports
    FOR INSERT WITH CHECK (auth.uid()::text = reported_by);

DROP POLICY IF EXISTS "Users can view their own reports" ON public.review_reports;
CREATE POLICY "Users can view their own reports" ON public.review_reports
    FOR SELECT USING (auth.uid()::text = reported_by);

-- Create host policy only if we can determine the host column
DO $$
DECLARE
    host_column_name TEXT;
BEGIN
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'host_user_id') THEN 'host_user_id'
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'owner_id') THEN 'owner_id'
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'user_id') THEN 'user_id'
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'created_by') THEN 'created_by'
            WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'host_id') THEN 'host_id'
            ELSE NULL
        END INTO host_column_name;

    IF host_column_name IS NOT NULL THEN
        EXECUTE 'DROP POLICY IF EXISTS "Hosts can view reports on their places" ON public.review_reports';
        EXECUTE 'CREATE POLICY "Hosts can view reports on their places" ON public.review_reports
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.reviews r
                    JOIN public.places p ON r.place_id = p.id
                    WHERE r.id = review_id AND p.' || host_column_name || ' = auth.uid()::text
                )
            )';

        EXECUTE 'DROP POLICY IF EXISTS "Hosts can update reports on their places" ON public.review_reports';
        EXECUTE 'CREATE POLICY "Hosts can update reports on their places" ON public.review_reports
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.reviews r
                    JOIN public.places p ON r.place_id = p.id
                    WHERE r.id = review_id AND p.' || host_column_name || ' = auth.uid()::text
                )
            )';
        
        RAISE NOTICE 'Created host policies using column: %', host_column_name;
    ELSE
        RAISE NOTICE 'Skipped host policies - no suitable host column found';
    END IF;
END $$;

-- Step 10: Verification
SELECT 'Verification Results:' as step;

SELECT 'Tables and views created:' as check;
SELECT 
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_reports')) as review_reports_table,
    (SELECT EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'review_reports_dashboard')) as dashboard_view;

-- Test the view
SELECT 'Testing dashboard view...' as step;
SELECT COUNT(*) as total_reports_in_view FROM public.review_reports_dashboard;

-- Show the actual column used for host identification
SELECT 'Host column detection result:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'host_user_id') THEN 'host_user_id'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'owner_id') THEN 'owner_id'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'user_id') THEN 'user_id'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'created_by') THEN 'created_by'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'host_id') THEN 'host_id'
        ELSE 'NOT_FOUND'
    END as detected_host_column;

SELECT 'Setup completed successfully with adaptive column detection!' as result;