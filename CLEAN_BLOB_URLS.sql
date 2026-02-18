-- CLEAN BLOB URLs - Fix the unsupported URI scheme error
-- This removes blob: URLs that cause image loading errors

-- Step 1: Find all places with blob URLs
SELECT 
    id,
    title,
    photo,
    'Has blob URL - will be cleaned' as status
FROM places
WHERE photo LIKE 'blob:%'
ORDER BY created_at DESC;

-- Step 2: Remove all blob URLs (they don't work after app restart)
UPDATE places 
SET photo = NULL
WHERE photo LIKE 'blob:%'
   OR photo LIKE 'blob:http://localhost:%'
   OR photo LIKE 'blob:https://localhost:%';

-- Step 3: Also clean any other invalid URLs
UPDATE places 
SET photo = NULL
WHERE photo LIKE 'file://%'
   OR photo LIKE 'content://%'
   OR photo LIKE 'ph://%'
   OR photo LIKE 'assets-library://%';

-- Step 4: Verify cleanup
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '✅ Clean - no photo'
        WHEN photo LIKE 'blob:%' THEN '❌ Still has blob URL'
        WHEN photo LIKE '%supabase.co%' THEN '✅ Valid Supabase URL'
        ELSE '⚠️ Unknown URL format'
    END as status
FROM places
ORDER BY created_at DESC;

-- Step 5: Summary
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo LIKE 'blob:%' THEN 1 END) as remaining_blob_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' THEN 1 END) as valid_supabase_urls,
    CASE 
        WHEN COUNT(CASE WHEN photo LIKE 'blob:%' THEN 1 END) = 0 
        THEN '✅ SUCCESS: All blob URLs removed!'
        ELSE '❌ PROBLEM: Some blob URLs still remain'
    END as cleanup_result
FROM places;

SELECT 'Blob URLs cleaned! Now upload new images - they will get proper Supabase URLs.' as next_step;