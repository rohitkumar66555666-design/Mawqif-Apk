-- Fix Review Reports Dashboard View
-- This creates the missing review_reports_dashboard view that the service is trying to access

-- First, check if the view exists
SELECT EXISTS (
    SELECT FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'review_reports_dashboard'
);

-- Drop the view if it exists (to recreate it)
DROP VIEW IF EXISTS public.review_reports_dashboard;

-- Create the review_reports_dashboard view
CREATE VIEW public.review_reports_dashboard AS
SELECT 
    rr.id as report_id,
    rr.review_id,
    rr.report_reason,
    rr.report_category,
    rr.status,
    rr.created_at as reported_at,
    rr.additional_details,
    r.comment as review_comment,
    r.rating as review_rating,
    r.reviewer_name,
    r.created_at as review_created_at,
    p.title as place_name,
    p.host_user_id as place_owner_id,
    up_reporter.full_name as reporter_name,
    rr.reported_by as reporter_id
FROM review_reports rr
JOIN reviews r ON rr.review_id = r.id
JOIN places p ON r.place_id = p.id
LEFT JOIN user_profiles up_reporter ON rr.reported_by = up_reporter.user_id
ORDER BY rr.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON public.review_reports_dashboard TO authenticated;
GRANT SELECT ON public.review_reports_dashboard TO anon;

-- Verify the view was created
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'review_reports_dashboard';

-- Test the view with a sample query
SELECT COUNT(*) as total_reports FROM public.review_reports_dashboard;

SELECT 
    report_category,
    status,
    COUNT(*) as count
FROM public.review_reports_dashboard 
GROUP BY report_category, status
ORDER BY report_category, status;