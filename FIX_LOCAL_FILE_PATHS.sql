-- ============================================
-- FIX LOCAL FILE PATHS IN PHOTO URLS
-- Remove local file paths and fix image URLs
-- ============================================

-- Step 1: Identify places with local file paths
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo LIKE 'file://%' THEN '❌ Local file path'
        WHEN photo LIKE '%/cache/%' THEN '❌ Cache file path'
        WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN '✅ Valid Supabase URL'
        WHEN photo LIKE '%supabase.co%' AND photo NOT LIKE '%/public/%' THEN '⚠️ Supabase URL but not public'
        WHEN photo IS NULL THEN '⚪ No photo'
        ELSE '❓ Unknown format'
    END as url_status
FROM places
WHERE photo IS NOT NULL
ORDER BY 
    CASE 
        WHEN photo LIKE 'file://%' THEN 1
        WHEN photo LIKE '%/cache/%' THEN 2
        ELSE 3
    END;

-- Step 2: Count issues
SELECT 
    'Summary of photo URL issues:' as analysis,
    COUNT(*) as total_places_with_photos,
    COUNT(CASE WHEN photo LIKE 'file://%' THEN 1 END) as local_file_paths,
    COUNT(CASE WHEN photo LIKE '%/cache/%' THEN 1 END) as cache_file_paths,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN 1 END) as valid_supabase_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo NOT LIKE '%/public/%' THEN 1 END) as invalid_supabase_urls
FROM places
WHERE photo IS NOT NULL;

-- Step 3: Remove local file paths (they're useless)
-- These are local device paths that won't work on other devices
UPDATE places 
SET photo = NULL
WHERE photo LIKE 'file://%' 
   OR photo LIKE '%/cache/%'
   OR photo LIKE '%ImagePicker%'
   OR photo LIKE '%/data/user/%';

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

-- Step 5: Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'place-images';

-- Step 6: Create public access policy
DROP POLICY IF EXISTS "Public Access for Images" ON storage.objects;
CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Step 7: Grant public access
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;

-- Step 8: Verify the cleanup
SELECT 
    'After cleanup:' as status,
    COUNT(*) as total_places_with_photos,
    COUNT(CASE WHEN photo LIKE 'file://%' THEN 1 END) as remaining_local_paths,
    COUNT(CASE WHEN photo LIKE '%/cache/%' THEN 1 END) as remaining_cache_paths,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN 1 END) as valid_urls,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo
FROM places;

-- Step 9: Show sample of cleaned URLs
SELECT 
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '⚪ No photo (cleaned up)'
        WHEN photo LIKE '%/public/%' THEN '✅ Valid public URL'
        ELSE '❌ Still needs fixing'
    END as status
FROM places
ORDER BY 
    CASE 
        WHEN photo IS NULL THEN 1
        WHEN photo LIKE '%/public/%' THEN 2
        ELSE 3
    END
LIMIT 10;

-- Step 10: Instructions for users
SELECT 
    '🎯 NEXT STEPS FOR USERS:' as instruction,
    '1. Places with local file paths have been cleaned (photo set to NULL)' as step1,
    '2. Users need to re-upload images for those places' as step2,
    '3. New uploads will use proper Supabase URLs' as step3,
    '4. Bucket is now public so images will load correctly' as step4;

-- Success message
SELECT 
    '✅ Local file path cleanup completed!' as result,
    'Places with local file paths now have photo = NULL' as note,
    'Users can re-upload images and they will work correctly' as action_needed;