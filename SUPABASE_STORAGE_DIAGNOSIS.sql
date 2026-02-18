-- COMPLETE SUPABASE STORAGE DIAGNOSIS
-- Check all aspects of storage configuration for prayer place images

-- Step 1: Check if storage bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets
WHERE id = 'place-images';

-- Step 2: Check storage policies
SELECT 
    id,
    bucket_id,
    name,
    definition,
    check_expression,
    roles
FROM storage.policies
WHERE bucket_id = 'place-images';

-- Step 3: Check RLS (Row Level Security) on storage.objects
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Step 4: Check if any images exist in storage
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'place-images'
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check storage permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'storage' 
AND table_name = 'objects';

-- Step 6: Test public URL format
SELECT 
    CONCAT(
        'https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/',
        'test-image.jpg'
    ) as expected_public_url_format;

-- Step 7: Check if bucket is properly configured for public access
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images' AND public = true) 
        THEN '✅ Bucket exists and is public'
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images' AND public = false) 
        THEN '❌ Bucket exists but is NOT public'
        ELSE '❌ Bucket does not exist'
    END as bucket_status;

-- Step 8: Check authentication settings
SELECT 
    setting_name,
    setting_value
FROM pg_settings
WHERE setting_name IN ('shared_preload_libraries', 'session_preload_libraries');

-- Step 9: Comprehensive diagnosis
SELECT 
    'DIAGNOSIS SUMMARY' as section,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images') 
        THEN '❌ CRITICAL: Bucket "place-images" does not exist - CREATE IT FIRST'
        
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images' AND public = false) 
        THEN '❌ CRITICAL: Bucket exists but is PRIVATE - MAKE IT PUBLIC'
        
        WHEN NOT EXISTS (SELECT 1 FROM storage.policies WHERE bucket_id = 'place-images') 
        THEN '❌ WARNING: No storage policies found - ADD PUBLIC READ POLICY'
        
        ELSE '✅ Basic configuration looks correct'
    END as diagnosis;

-- Step 10: Show what needs to be fixed
SELECT 
    'REQUIRED FIXES' as section,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images') 
        THEN 'RUN: CREATE BUCKET SCRIPT'
        
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images' AND public = false) 
        THEN 'RUN: UPDATE storage.buckets SET public = true WHERE id = ''place-images'';'
        
        ELSE 'Configuration appears correct - check app code'
    END as required_action;