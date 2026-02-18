-- CLEAN UP BAD IMAGE URLS
-- Remove local file paths and invalid URLs

-- Step 1: Check what we have now
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '⚪ No photo'
        WHEN photo LIKE 'file://%' THEN '❌ Local file path'
        WHEN photo LIKE '%/cache/%' THEN '❌ Cache path'
        WHEN photo LIKE '%ImagePicker%' THEN '❌ ImagePicker path'
        WHEN photo LIKE '%/data/user/%' THEN '❌ Android data path'
        WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN '✅ Valid Supabase URL'
        WHEN photo LIKE '%supabase.co%' AND photo NOT LIKE '%/public/%' THEN '⚠️ Supabase URL but not public'
        ELSE '❓ Unknown format'
    END as status
FROM places
WHERE photo IS NOT NULL
ORDER BY created_at DESC;

-- Step 2: Count the issues
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo LIKE 'file://%' OR photo LIKE '%/cache/%' OR photo LIKE '%ImagePicker%' OR photo LIKE '%/data/user/%' THEN 1 END) as bad_local_paths,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN 1 END) as valid_supabase_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo NOT LIKE '%/public/%' THEN 1 END) as invalid_supabase_urls
FROM places;

-- Step 3: Remove all local file paths (they're useless)
UPDATE places 
SET photo = NULL
WHERE photo LIKE 'file://%' 
   OR photo LIKE '%/cache/%'
   OR photo LIKE '%ImagePicker%'
   OR photo LIKE '%/data/user/%'
   OR photo LIKE '%content://%'
   OR photo LIKE '%android_asset%';

-- Step 4: Fix Supabase URLs that are missing /public/
UPDATE places 
SET photo = REPLACE(
    photo, 
    '/storage/v1/object/place-images/', 
    '/storage/v1/object/public/place-images/'
)
WHERE photo IS NOT NULL 
AND photo LIKE '%supabase.co%'
AND photo NOT LIKE '%/public/%'
AND photo LIKE '%/object/place-images/%';

-- Step 5: Show results after cleanup
SELECT 
    'AFTER CLEANUP:' as status,
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo LIKE 'file://%' OR photo LIKE '%/cache/%' THEN 1 END) as remaining_bad_paths,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN 1 END) as valid_urls
FROM places;

-- Step 6: Show sample of cleaned data
SELECT 
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '⚪ No photo (cleaned up - needs re-upload)'
        WHEN photo LIKE '%/public/%' THEN '✅ Valid URL'
        ELSE '❌ Still needs fixing'
    END as status
FROM places
ORDER BY created_at DESC
LIMIT 10;

-- Success message
SELECT 'Bad image URLs cleaned up! Places with local paths now have photo = NULL and need re-upload.' as result;