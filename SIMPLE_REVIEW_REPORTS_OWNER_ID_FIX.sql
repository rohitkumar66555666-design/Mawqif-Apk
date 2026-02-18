-- Simple Review Reports Fix - Using owner_id column
-- This creates the review reports system using the correct column name (owner_id)

-- Step 1: Create review_reports table
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

-- Step 2: Add foreign key to reviews if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
        ALTER TABLE public.review_reports 
        ADD CONSTRAINT review_reports_review_id_fkey 
        FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to reviews table';
    END IF;
END $$;

-- Step 3: Create indexes
CREATE INDEX idx_review_reports_review_id ON public.review_reports(review_id);
CREATE INDEX idx_review_reports_reported_by ON public.review_reports(reported_by);
CREATE INDEX idx_review_reports_status ON public.review_reports(status);
CREATE INDEX idx_review_reports_created_at ON public.review_reports(created_at);

-- Step 4: Drop existing view
DROP VIEW IF EXISTS public.review_reports_dashboard;

-- Step 5: Create dashboard view using owner_id column
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
    COALESCE(p.title, 'Unknown Place') as place_name,
    COALESCE(p.owner_id, 'unknown') as place_owner_id,
    'Unknown Reporter' as reporter_name,
    rr.reported_by as reporter_id
FROM public.review_reports rr
LEFT JOIN public.reviews r ON rr.review_id = r.id
LEFT JOIN public.places p ON r.place_id = p.id
ORDER BY rr.created_at DESC;

-- Step 6: Grant permissions
GRANT ALL ON public.review_reports TO authenticated;
GRANT SELECT ON public.review_reports_dashboard TO authenticated;
GRANT SELECT ON public.review_reports_dashboard TO anon;

-- Step 7: Enable RLS
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
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
            WHERE r.id = review_id AND p.owner_id = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Hosts can update reports on their places" ON public.review_reports;
CREATE POLICY "Hosts can update reports on their places" ON public.review_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.reviews r
            JOIN public.places p ON r.place_id = p.id
            WHERE r.id = review_id AND p.owner_id = auth.uid()::text
        )
    );

-- Step 9: Verification
SELECT 'Verification Results:' as step;

SELECT 'Tables and views created:' as check;
SELECT 
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_reports')) as review_reports_table,
    (SELECT EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'review_reports_dashboard')) as dashboard_view;

-- Test the view
SELECT 'Testing dashboard view...' as step;
SELECT COUNT(*) as total_reports_in_view FROM public.review_reports_dashboard;

-- Show sample data structure
SELECT 'Sample view structure:' as info;
SELECT 
    report_id,
    report_category,
    status,
    place_name,
    place_owner_id
FROM public.review_reports_dashboard 
LIMIT 3;

SELECT 'Setup completed successfully using owner_id column!' as result;