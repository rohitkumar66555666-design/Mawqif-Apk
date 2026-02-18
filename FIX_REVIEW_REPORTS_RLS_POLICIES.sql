-- Fix Review Reports RLS Policies for Mock Users
-- This allows mock users to create and view reports during development

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Users can report reviews" ON public.review_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.review_reports;
DROP POLICY IF EXISTS "Hosts can view reports on their places" ON public.review_reports;
DROP POLICY IF EXISTS "Hosts can update reports on their places" ON public.review_reports;

-- Step 2: Create more permissive policies for development
-- Allow any authenticated user OR mock users to create reports
CREATE POLICY "Users can report reviews" ON public.review_reports
    FOR INSERT WITH CHECK (
        auth.uid()::text = reported_by 
        OR reported_by LIKE 'mock_user_%'
        OR auth.uid() IS NULL  -- Allow for testing without auth
    );

-- Allow users to view their own reports OR mock user reports
CREATE POLICY "Users can view their own reports" ON public.review_reports
    FOR SELECT USING (
        auth.uid()::text = reported_by 
        OR reported_by LIKE 'mock_user_%'
        OR auth.uid() IS NULL  -- Allow for testing without auth
    );

-- Allow hosts to view reports on their places (with mock user support)
CREATE POLICY "Hosts can view reports on their places" ON public.review_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews r
            JOIN public.places p ON r.place_id = p.id
            WHERE r.id = review_id 
            AND (
                p.owner_id = auth.uid()::text 
                OR p.owner_id LIKE 'mock_user_%'
                OR auth.uid() IS NULL  -- Allow for testing without auth
            )
        )
    );

-- Allow hosts to update reports on their places (with mock user support)
CREATE POLICY "Hosts can update reports on their places" ON public.review_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.reviews r
            JOIN public.places p ON r.place_id = p.id
            WHERE r.id = review_id 
            AND (
                p.owner_id = auth.uid()::text 
                OR p.owner_id LIKE 'mock_user_%'
                OR auth.uid() IS NULL  -- Allow for testing without auth
            )
        )
    );

-- Step 3: Test the policies (using existing review if available)
SELECT 'Testing RLS policies...' as step;

-- Check if we have any existing reviews to test with
DO $
DECLARE
    test_review_id TEXT;
BEGIN
    -- Get the first available review ID for testing
    SELECT id INTO test_review_id FROM public.reviews LIMIT 1;
    
    IF test_review_id IS NOT NULL THEN
        -- Try to insert a test report with real review ID
        INSERT INTO public.review_reports (
            review_id,
            reported_by,
            report_reason,
            report_category,
            additional_details
        ) VALUES (
            test_review_id,
            'mock_user_test',
            'Test report',
            'spam',
            'This is a test report to verify RLS policies'
        ) ON CONFLICT DO NOTHING;
        
        -- Check if the insert worked
        IF EXISTS (SELECT 1 FROM public.review_reports WHERE reported_by = 'mock_user_test') THEN
            RAISE NOTICE 'SUCCESS: Mock user can create reports';
        ELSE
            RAISE NOTICE 'FAILED: Mock user cannot create reports';
        END IF;
        
        -- Clean up test data
        DELETE FROM public.review_reports WHERE reported_by = 'mock_user_test';
    ELSE
        RAISE NOTICE 'SKIPPED: No existing reviews found for testing';
    END IF;
END $;

SELECT 'RLS policies updated to support mock users during development!' as result;