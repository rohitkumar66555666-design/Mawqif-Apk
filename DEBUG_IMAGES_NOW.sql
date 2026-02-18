-- DEBUG: Check current state of images after running the fix

-- Step 1: Show all places with their photo URLs
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '❌ No photo (was cleaned up or never had one)'
        WHEN photo LIKE 'file://%' THEN '❌ Still has local file path - FIX FAILED'
        WHEN photo LIKE '%/cache/%' THEN '❌ Still has cache path - FIX FAILED'
        WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN '✅ Valid Supabase public URL'
        WHEN photo LIKE '%supabase.co%' AND photo NOT LIKE '%/public/%' THEN '⚠️ Supabase URL but missing /public/'
        ELSE '❓ Unknown format'
    END as status,
    created_at
FROM places
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Count the different types
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo LIKE 'file://%' THEN 1 END) as local_file_paths,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN 1 END) as valid_supabase_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo NOT LIKE '%/public/%' THEN 1 END) as invalid_supabase_urls
FROM places;

-- Step 3: Check if bucket exists and is public
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'place-images';

-- Step 4: Check if there are any images in storage
SELECT 
    name,
    bucket_id,
    created_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'place-images'
ORDER BY created_at DESC
LIMIT 5;

-- Step 5: Test a sample public URL format
SELECT 
    CONCAT(
        'https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/',
        (SELECT name FROM storage.objects WHERE bucket_id = 'place-images' LIMIT 1)
    ) as test_url_format
WHERE EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'place-images');

-- Instructions
SELECT 
    'NEXT STEPS:' as instruction,
    '1. Check the results above' as step1,
    '2. If you see valid Supabase URLs, test one in your browser' as step2,
    '3. If no valid URLs, you need to upload new images' as step3,
    '4. Use the app debug buttons to test configuration' as step4;