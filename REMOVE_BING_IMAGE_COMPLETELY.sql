-- COMPLETELY REMOVE BING IMAGE FROM EVERYWHERE
-- This Bing URL is appearing automatically and needs to be eliminated

-- Step 1: Find all places with this specific Bing URL
SELECT 
    id,
    title,
    photo,
    created_at
FROM places
WHERE photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Step 2: Count how many places have this exact URL
SELECT 
    COUNT(*) as places_with_bing_image,
    'This many places have the unwanted Bing image' as description
FROM places
WHERE photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Step 3: Remove this specific Bing URL from ALL places
UPDATE places 
SET photo = NULL
WHERE photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Step 4: Remove ANY Bing URLs (in case there are variations)
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%tse2.mm.bing.net%'
   OR photo LIKE '%bing.net%'
   OR photo LIKE '%mm.bing.net%'
   OR photo LIKE '%OIP.CFIXqi76j82ev1hH_9hs7AHaE%';

-- Step 5: Remove any other common fallback image URLs
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%placeholder%'
   OR photo LIKE '%default%'
   OR photo LIKE '%fallback%'
   OR photo LIKE '%example.com%'
   OR photo LIKE '%test%';

-- Step 6: Verify cleanup - should show NO Bing URLs
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '✅ No photo - clean'
        WHEN photo LIKE '%bing.net%' THEN '❌ Still has Bing URL'
        WHEN photo LIKE '%supabase.co%' THEN '✅ Valid Supabase URL'
        ELSE '⚠️ Unknown URL format'
    END as status
FROM places
ORDER BY created_at DESC;

-- Step 7: Final count
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) as still_has_bing_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' THEN 1 END) as valid_supabase_urls
FROM places;

-- Success message
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM places WHERE photo LIKE '%bing.net%') 
        THEN '❌ Some Bing URLs still remain - check the results above'
        ELSE '✅ All Bing URLs removed successfully!'
    END as result;