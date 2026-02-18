-- ============================================
-- DIAGNOSE IMAGE LOADING ISSUE
-- Run this first to see what's wrong
-- ============================================

-- Check 1: Does the bucket exist and is it public?
SELECT 
    'BUCKET STATUS:' as check_type,
    id as bucket_name,
    CASE 
        WHEN public = true THEN '✅ PUBLIC (Good)'
        WHEN public = false THEN '❌ PRIVATE (This is the problem!)'
        ELSE '⚠️ Unknown status'
    END as status,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'place-images';

-- Check 2: Are there images in the bucket?
SELECT 
    'IMAGES IN BUCKET:' as check_type,
    COUNT(*) as total_images,
    MIN(created_at) as oldest_image,
    MAX(created_at) as newest_image
FROM storage.objects
WHERE bucket_id = 'place-images';

-- Check 3: What do the image URLs look like in your database?
SELECT 
    'IMAGE URLS IN DATABASE:' as check_type,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '❌ NO URL'
        WHEN photo LIKE '%/public/%' THEN '✅ PUBLIC URL (Good)'
        WHEN photo LIKE '%/object/%' AND photo NOT LIKE '%/public/%' THEN '❌ PRIVATE URL (Problem!)'
        ELSE '⚠️ UNKNOWN FORMAT'
    END as url_status
FROM places
WHERE photo IS NOT NULL
LIMIT 5;

-- Check 4: Sample image URLs to test
SELECT 
    'TEST THESE URLS IN BROWSER:' as instruction,
    photo as url_to_test,
    CASE 
        WHEN photo LIKE '%/public/%' THEN 'Should load image'
        ELSE 'Will show 403 Forbidden'
    END as expected_result
FROM places
WHERE photo IS NOT NULL
LIMIT 3;

-- Check 5: Summary of issues
SELECT 
    'SUMMARY:' as summary,
    (SELECT COUNT(*) FROM places WHERE photo IS NOT NULL) as places_with_photos,
    (SELECT COUNT(*) FROM places WHERE photo LIKE '%/public/%') as public_urls,
    (SELECT COUNT(*) FROM places WHERE photo IS NOT NULL AND photo NOT LIKE '%/public/%') as private_urls,
    (SELECT public FROM storage.buckets WHERE id = 'place-images') as bucket_is_public;

-- What to do next:
SELECT 
    'NEXT STEPS:' as action,
    CASE 
        WHEN (SELECT public FROM storage.buckets WHERE id = 'place-images') = false 
        THEN '1. Make bucket public in Supabase Dashboard'
        ELSE '1. Bucket is already public ✅'
    END as step_1,
    CASE 
        WHEN (SELECT COUNT(*) FROM places WHERE photo IS NOT NULL AND photo NOT LIKE '%/public/%') > 0
        THEN '2. Fix image URLs in database (run FIX_IMAGE_LOADING.sql)'
        ELSE '2. Image URLs are correct ✅'
    END as step_2,
    '3. Test in app with Supabase debug button' as step_3;