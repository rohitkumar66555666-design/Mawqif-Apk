-- SIMPLE IMAGE FIX - Safe for Project Owners
-- This version avoids permission issues

-- Step 1: Clean up ALL hardcoded URLs from database
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%bing.net%'
   OR photo LIKE '%tse2.mm.bing.net%'
   OR photo LIKE '%OIP.CFIXqi76j82ev1hH_9hs7AHaE%'
   OR photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Step 2: Check if storage bucket exists
SELECT 
    id,
    name,
    public,
    'Current bucket status' as info
FROM storage.buckets
WHERE id = 'place-images';

-- Step 3: Show current storage policies
SELECT 
    id,
    bucket_id,
    name,
    'Current policies' as info
FROM storage.policies
WHERE bucket_id = 'place-images';

-- Step 4: Verify cleanup
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) as still_has_bing_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' THEN 1 END) as valid_supabase_urls
FROM places;

-- Success message
SELECT 'Database cleanup completed. Check Storage settings manually if bucket does not exist.' as result;