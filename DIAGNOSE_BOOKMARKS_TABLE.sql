-- DIAGNOSE BOOKMARKS TABLE
-- Run this in your Supabase SQL Editor to check if the bookmarks table exists

-- Check if bookmarks table exists
SELECT 'CHECKING BOOKMARKS TABLE...' as status;

-- Check table existence
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'bookmarks';

-- If table exists, show its structure
SELECT 'BOOKMARKS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookmarks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any bookmarks
SELECT 'BOOKMARKS COUNT:' as info;
SELECT COUNT(*) as total_bookmarks FROM bookmarks;

-- Show sample bookmarks if any exist
SELECT 'SAMPLE BOOKMARKS:' as info;
SELECT * FROM bookmarks LIMIT 5;

-- Check RLS policies
SELECT 'RLS POLICIES:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'bookmarks';

SELECT 'DIAGNOSIS COMPLETE!' as status;