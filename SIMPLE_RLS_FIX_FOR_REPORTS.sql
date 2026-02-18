-- Simple RLS Fix for Review Reports - No Testing
-- This just fixes the RLS policies to allow mock users

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can report reviews" ON public.review_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.review_reports;
DROP POLICY IF EXISTS "Hosts can view reports on their places" ON public.review_reports;
DROP POLICY IF EXISTS "Hosts can update reports on their places" ON public.review_reports;

-- Step 2: Create permissive policies for development
-- Allow authenticated users OR mock users to create reports
CREATE POLICY "Users can report reviews" ON public.review_reports
    FOR INSERT WITH CHECK (
        auth.uid()::text = reported_by 
        OR reported_by LIKE 'mock_user_%'
        OR auth.uid() IS NULL
    );

-- Allow users to view their own reports OR mock user reports
CREATE POLICY "Users can view their own reports" ON public.review_reports
    FOR SELECT USING (
        auth.uid()::text = reported_by 
        OR reported_by LIKE 'mock_user_%'
        OR auth.uid() IS NULL
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
                OR auth.uid() IS NULL
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
                OR auth.uid() IS NULL
            )
        )
    );

-- Step 3: Verify policies are created
SELECT 'Checking RLS policies...' as step;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'review_reports'
ORDER BY policyname;

SELECT 'RLS policies updated successfully! Mock users can now create reports.' as result;