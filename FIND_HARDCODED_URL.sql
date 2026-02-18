-- FIND AND REMOVE HARDCODED BING URL FROM DATABASE
-- The URL is still in database records even after deleting from Storage

-- Step 1: Find all places with the hardcoded Bing URL
SELECT 
    id,
    title,
    photo,
    created_at,
    'This place has the hardcoded Bing URL' as issue
FROM places
WHERE photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3'
ORDER BY created_at DESC;

-- Step 2: Count how many places have this exact hardcoded URL
SELECT 
    COUNT(*) as places_with_hardcoded_url,
    'Total places with the hardcoded Bing URL' as description
FROM places
WHERE photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Step 3: Show ALL photo URLs to see what's in the database
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '✅ No photo'
        WHEN photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3' THEN '❌ HARDCODED BING URL'
        WHEN photo LIKE '%bing.net%' THEN '❌ Other Bing URL'
        WHEN photo LIKE '%supabase.co%' THEN '✅ Valid Supabase URL'
        ELSE '⚠️ Unknown URL format'
    END as url_type
FROM places
ORDER BY created_at DESC;

-- Step 4: REMOVE the hardcoded Bing URL from ALL places
UPDATE places 
SET photo = NULL
WHERE photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Step 5: Remove ANY Bing URLs (in case there are variations)
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%tse2.mm.bing.net%'
   OR photo LIKE '%bing.net%'
   OR photo LIKE '%mm.bing.net%'
   OR photo LIKE '%OIP.CFIXqi76j82ev1hH_9hs7AHaE%';

-- Step 6: Verify cleanup - should show NO Bing URLs
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '✅ Clean - no photo'
        WHEN photo LIKE '%bing.net%' THEN '❌ STILL HAS BING URL - PROBLEM!'
        WHEN photo LIKE '%supabase.co%' THEN '✅ Valid Supabase URL'
        ELSE '⚠️ Unknown URL format'
    END as status
FROM places
ORDER BY created_at DESC;

-- Step 7: Final verification count
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) as still_has_bing_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' THEN 1 END) as valid_supabase_urls,
    CASE 
        WHEN COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) = 0 
        THEN '✅ SUCCESS: All Bing URLs removed!'
        ELSE '❌ PROBLEM: Some Bing URLs still remain'
    END as cleanup_result
FROM places;

-- Success message
SELECT 'Database cleanup completed. Check the results above.' as result;