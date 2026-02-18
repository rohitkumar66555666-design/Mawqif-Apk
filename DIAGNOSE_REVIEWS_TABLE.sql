-- Diagnose Reviews Table Structure
-- Run this in your Supabase SQL Editor to see what's wrong

-- Check if reviews table exists
SELECT 'Reviews table exists: ' || CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'reviews' AND table_schema = 'public'
) THEN 'YES' ELSE 'NO' END as table_status;

-- Check current column structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'reviews' 
AND schemaname = 'public';

-- Check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'reviews' 
AND table_schema = 'public';

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'reviews' 
AND schemaname = 'public';

-- Sample data to see current format
SELECT 
    id,
    user_id,
    place_id,
    user_name,
    rating,
    comment,
    created_at
FROM reviews 
LIMIT 3;