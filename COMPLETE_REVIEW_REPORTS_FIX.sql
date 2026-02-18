-- Complete Review Reports Dashboard Fix
-- This script creates the missing review_reports_dashboard view and ensures all dependencies exist

-- Step 1: Check current state of tables
SELECT 'Checking review_reports table...' as step;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'review_reports'
) as review_reports_exists;

SELECT 'Checking reviews table...' as step;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews'
) as reviews_exists;

SELECT 'Checking places table...' as step;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'places'
) as places_exists;

SELECT 'Checking user_profiles table...' as step;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
) as user_profiles_exists;

-- Step 2: Create review_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.review_reports (
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

-- Step 3: Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key to reviews table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'review_reports_review_id_fkey'
    ) THEN
        ALTER TABLE public.review_reports 
        ADD CONSTRAINT review_reports_review_id_fkey 
        FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key to user_profiles table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'review_reports_reported_by_fkey'
    ) THEN
        ALTER TABLE public.review_reports 
        ADD CONSTRAINT review_reports_reported_by_fkey 
        FOREIGN KEY (reported_by) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON public.review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_reported_by ON public.review_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON public.review_reports(status);
CREATE INDEX IF NOT EXISTS idx_review_reports_created_at ON public.review_reports(created_at);

-- Step 5: Drop existing view if it exists
DROP VIEW IF EXISTS public.review_reports_dashboard;

-- Step 6: Create the review_reports_dashboard view
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
    r.comment as review_comment,
    r.rating as review_rating,
    r.reviewer_name,
    r.created_at as review_created_at,
    p.title as place_name,
    p.host_user_id as place_owner_id,
    COALESCE(up_reporter.full_name, up_reporter.first_name, 'Unknown User') as reporter_name,
    rr.reported_by as reporter_id
FROM public.review_reports rr
JOIN public.reviews r ON rr.review_id = r.id
JOIN public.places p ON r.place_id = p.id
LEFT JOIN public.user_profiles up_reporter ON rr.reported_by = up_reporter.user_id
ORDER BY rr.created_at DESC;

-- Step 7: Grant permissions
GRANT SELECT ON public.review_reports TO authenticated;
GRANT INSERT ON public.review_reports TO authenticated;
GRANT UPDATE ON public.review_reports TO authenticated;
GRANT DELETE ON public.review_reports TO authenticated;

GRANT SELECT ON public.review_reports_dashboard TO authenticated;
GRANT SELECT ON public.review_reports_dashboard TO anon;

-- Step 8: Enable RLS (Row Level Security)
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
DROP POLICY IF EXISTS "Users can report reviews" ON public.review_reports;
CREATE POLICY "Users can report reviews" ON public.review_reports
    FOR INSERT WITH CHECK (auth.uid()::text = reported_by);

DROP POLICY IF EXISTS "Users can view their own reports" ON public.review_reports;
CREATE POLICY "Users can view their own reports" ON public.review_reports
    FOR SELECT USING (auth.uid()::text = reported_by);

DROP POLICY IF EXISTS "Hosts can view reports on their places" ON public.review_reports;
CREATE POLICY "Hosts can view reports on their places" ON public.review_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews r
            JOIN public.places p ON r.place_id = p.id
            WHERE r.id = review_id AND p.host_user_id = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Hosts can update reports on their places" ON public.review_reports;
CREATE POLICY "Hosts can update reports on their places" ON public.review_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.reviews r
            JOIN public.places p ON r.place_id = p.id
            WHERE r.id = review_id AND p.host_user_id = auth.uid()::text
        )
    );

-- Step 10: Verify the setup
SELECT 'Verification Results:' as step;

SELECT 'Tables exist:' as check;
SELECT 
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_reports')) as review_reports_table,
    (SELECT EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'review_reports_dashboard')) as dashboard_view;

SELECT 'Sample data count:' as check;
SELECT 
    (SELECT COUNT(*) FROM public.review_reports) as total_reports,
    (SELECT COUNT(*) FROM public.review_reports_dashboard) as dashboard_view_count;

SELECT 'Foreign key constraints:' as check;
SELECT 
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.referential_constraints rc ON kcu.constraint_name = rc.constraint_name
WHERE kcu.table_name = 'review_reports'
AND kcu.table_schema = 'public';

-- Step 11: Test the view with sample queries
SELECT 'Testing dashboard view...' as step;

-- Test basic functionality
SELECT COUNT(*) as total_reports_in_view FROM public.review_reports_dashboard;

-- Test grouping by status
SELECT 
    status,
    COUNT(*) as count
FROM public.review_reports_dashboard 
GROUP BY status
ORDER BY status;

-- Test grouping by category
SELECT 
    report_category,
    COUNT(*) as count
FROM public.review_reports_dashboard 
GROUP BY report_category
ORDER BY report_category;

SELECT 'Setup completed successfully!' as result;