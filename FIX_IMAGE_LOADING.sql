-- ============================================
-- FIX IMAGE LOADING ISSUE
-- Images uploaded but not showing in app
-- ============================================

-- Step 1: Check if images exist in storage
SELECT 
    name,
    bucket_id,
    created_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'place-images'
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Check if bucket is public
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'place-images';

-- Step 3: Check image URLs in places table
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '❌ No photo URL'
        WHEN photo LIKE '%/public/%' THEN '✅ Public URL'
        WHEN photo LIKE '%/object/%' AND photo NOT LIKE '%/public/%' THEN '❌ Private URL'
        ELSE '⚠️ Unknown URL format'
    END as url_status
FROM places
WHERE photo IS NOT NULL
LIMIT 10;

-- Step 4: Make bucket public if it's not
UPDATE storage.buckets 
SET public = true 
WHERE id = 'place-images';

-- Step 5: Create RLS policies for public access
DROP POLICY IF EXISTS "Public Access for Images" ON storage.objects;
CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Step 6: Grant public access
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;

-- Step 7: Fix image URLs if they're private
-- This will update URLs to public format
UPDATE places 
SET photo = REPLACE(
    photo, 
    '/storage/v1/object/place-images/', 
    '/storage/v1/object/public/place-images/'
)
WHERE photo IS NOT NULL 
AND photo NOT LIKE '%/public/%'
AND photo LIKE '%/object/place-images/%';

-- Step 8: Verify the fixes
SELECT 
    'After fixes:' as status,
    COUNT(*) as total_places_with_photos,
    COUNT(CASE WHEN photo LIKE '%/public/%' THEN 1 END) as public_urls,
    COUNT(CASE WHEN photo NOT LIKE '%/public/%' THEN 1 END) as private_urls
FROM places
WHERE photo IS NOT NULL;

-- Step 9: Show sample URLs to test
SELECT 
    title,
    photo as image_url,
    CASE 
        WHEN photo LIKE '%/public/%' THEN '✅ Should work'
        ELSE '❌ Needs fixing'
    END as status
FROM places
WHERE photo IS NOT NULL
LIMIT 5;

-- Step 10: Test URL format
SELECT 
    'Test this URL in browser:' as instruction,
    CONCAT(
        'https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/',
        (SELECT name FROM storage.objects WHERE bucket_id = 'place-images' LIMIT 1)
    ) as test_url
WHERE EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'place-images');

-- Success message
SELECT '🎉 Image loading should now be fixed!' as result;