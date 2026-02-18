-- Simple Review Reports Fix - Without User Profiles Dependency
-- This creates the review reports system without requiring user_profiles table

-- Step 1: Check what tables exist
SELECT 'Checking existing tables...' as step;
SELECT 
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews')) as reviews_exists,
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'places')) as places_exists,
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')) as user_profiles_exists;

-- Step 2: Create review_reports table without user_profiles dependency
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

-- Step 3: Add only the foreign key constraints that we can (reviews table)
DO $$ 
BEGIN
    -- Add foreign key to reviews table if reviews table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
        ALTER TABLE public.review_reports 
        ADD CONSTRAINT review_reports_review_id_fkey 
        FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint to reviews table';
    ELSE
        RAISE NOTICE 'Reviews table does not exist - skipping foreign key constraint';
    END IF;
END $$;

-- Step 4: Create indexes for better performance
CREATE INDEX idx_review_reports_review_id ON public.review_reports(review_id);
CREATE INDEX idx_review_reports_reported_by ON public.review_reports(reported_by);
CREATE INDEX idx_review_reports_status ON public.review_reports(status);
CREATE INDEX idx_review_reports_created_at ON public.review_reports(created_at);

-- Step 5: Drop existing view if it exists
DROP VIEW IF EXISTS public.review_reports_dashboard;

-- Step 6: Create simplified dashboard view without user_profiles dependency
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
    COALESCE(p.host_user_id, 'unknown') as place_owner_id,
    'Unknown Reporter' as reporter_name,  -- Default since no user_profiles
    rr.reported_by as reporter_id
FROM public.review_reports rr
LEFT JOIN public.reviews r ON rr.review_id = r.id
LEFT JOIN public.places p ON r.place_id = p.id
ORDER BY rr.created_at DESC;

-- Step 7: Grant permissions
GRANT ALL ON public.review_reports TO authenticated;
GRANT SELECT ON public.review_reports_dashboard TO authenticated;
GRANT SELECT ON public.review_reports_dashboard TO anon;

-- Step 8: Enable RLS (Row Level Security)
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Step 9: Create simplified RLS policies
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

-- Step 10: Insert some test data to verify functionality
INSERT INTO public.review_reports (review_id, reported_by, report_reason, report_category, additional_details)
SELECT 
    r.id,
    'test-user-123',
    'This is a test report',
    'spam',
    'Testing the reports system'
FROM public.reviews r
LIMIT 1
ON CONFLICT DO NOTHING;

-- Step 11: Verify the setup
SELECT 'Verification Results:' as step;

SELECT 'Tables and views created:' as check;
SELECT 
    (SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_reports')) as review_reports_table,
    (SELECT EXISTS (SELECT FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'review_reports_dashboard')) as dashboard_view;

SELECT 'Sample data count:' as check;
SELECT 
    (SELECT COUNT(*) FROM public.review_reports) as total_reports,
    (SELECT COUNT(*) FROM public.review_reports_dashboard) as dashboard_view_count;

-- Step 12: Test the view functionality
SELECT 'Testing dashboard view...' as step;

-- Test basic functionality
SELECT COUNT(*) as total_reports_in_view FROM public.review_reports_dashboard;

-- Test sample data
SELECT 
    report_id,
    report_category,
    status,
    place_name,
    reporter_name
FROM public.review_reports_dashboard 
LIMIT 5;

SELECT 'Setup completed successfully without user_profiles dependency!' as result;