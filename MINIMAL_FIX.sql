-- MINIMAL FIX - Only clean database
-- This avoids all storage-related queries that cause errors

-- Step 1: Clean up ALL hardcoded URLs from database
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%bing.net%'
   OR photo LIKE '%tse2.mm.bing.net%'
   OR photo LIKE '%OIP.CFIXqi76j82ev1hH_9hs7AHaE%'
   OR photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Step 2: Verify cleanup worked
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as places_without_photo,
    COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) as remaining_bing_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' THEN 1 END) as valid_supabase_urls,
    CASE 
        WHEN COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) = 0 
        THEN '✅ SUCCESS: All hardcoded URLs removed!'
        ELSE '❌ Some hardcoded URLs still remain'
    END as cleanup_result
FROM places;

-- Step 3: Show what photos remain
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '✅ No photo (clean)'
        WHEN photo LIKE '%supabase.co%' THEN '✅ Valid Supabase URL'
        WHEN photo LIKE '%bing.net%' THEN '❌ Still has Bing URL'
        ELSE '⚠️ Unknown URL format'
    END as photo_status
FROM places
ORDER BY created_at DESC
LIMIT 10;

SELECT 'Database cleanup completed! Now set up storage manually through Supabase UI.' as next_step;