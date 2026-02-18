-- ===============================================
-- SUPABASE STORAGE SETUP FOR MULTIPLE IMAGES
-- ===============================================
-- This script sets up complete Supabase Storage for multiple place images
-- Run this in your Supabase SQL Editor

-- Step 1: Create storage bucket for multiple place images
DO $
BEGIN
    -- Check if bucket already exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'place-images'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'place-images',
            'place-images', 
            true,  -- Public bucket so users can view images
            52428800,  -- 50MB file size limit
            ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']  -- Allowed image types
        );
        RAISE NOTICE '✅ Created place-images storage bucket';
    ELSE
        -- Update existing bucket to ensure it's properly configured
        UPDATE storage.buckets 
        SET 
            public = true,
            file_size_limit = 52428800,
            allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        WHERE id = 'place-images';
        RAISE NOTICE '✅ Updated existing place-images bucket configuration';
    END IF;
END $;

-- Step 2: Create RLS policies for place images storage
-- Policy 1: Allow authenticated users to upload images
DO $
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Allow authenticated users to upload place images" ON storage.objects;
    
    -- Create upload policy
    CREATE POLICY "Allow authenticated users to upload place images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'place-images' 
        AND auth.role() = 'authenticated'
    );
    
    RAISE NOTICE '✅ Created upload policy for place images';
END $;

-- Policy 2: Allow public read access to all place images
DO $
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Allow public read access to place images" ON storage.objects;
    
    -- Create public read policy
    CREATE POLICY "Allow public read access to place images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'place-images');
    
    RAISE NOTICE '✅ Created public read policy for place images';
END $;

-- Policy 3: Allow users to update their own uploaded images
DO $
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Allow users to update their place images" ON storage.objects;
    
    -- Create update policy
    CREATE POLICY "Allow users to update their place images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'place-images' 
        AND auth.role() = 'authenticated'
    );
    
    RAISE NOTICE '✅ Created update policy for place images';
END $;

-- Policy 4: Allow users to delete their own uploaded images
DO $
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Allow users to delete their place images" ON storage.objects;
    
    -- Create delete policy
    CREATE POLICY "Allow users to delete their place images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'place-images' 
        AND auth.role() = 'authenticated'
    );
    
    RAISE NOTICE '✅ Created delete policy for place images';
END $;

-- Step 3: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 4: Create helper function to generate image URLs
CREATE OR REPLACE FUNCTION get_place_image_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $
DECLARE
    base_url TEXT;
    project_url TEXT;
BEGIN
    -- Get the project URL from auth.jwt()
    SELECT COALESCE(
        current_setting('app.settings.supabase_url', true),
        'https://your-project.supabase.co'
    ) INTO project_url;
    
    -- Construct the public URL
    base_url := project_url || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
    
    RETURN base_url;
END;
$ LANGUAGE plpgsql;

-- Step 5: Create function to validate image file types
CREATE OR REPLACE FUNCTION validate_image_file(file_name TEXT)
RETURNS BOOLEAN AS $
DECLARE
    file_extension TEXT;
    allowed_extensions TEXT[] := ARRAY['jpg', 'jpeg', 'png', 'webp'];
BEGIN
    -- Extract file extension
    file_extension := lower(split_part(file_name, '.', -1));
    
    -- Check if extension is allowed
    RETURN file_extension = ANY(allowed_extensions);
END;
$ LANGUAGE plpgsql;

-- Step 6: Create function to clean up orphaned images
CREATE OR REPLACE FUNCTION cleanup_orphaned_place_images()
RETURNS INTEGER AS $
DECLARE
    deleted_count INTEGER := 0;
    image_record RECORD;
BEGIN
    -- Find images in storage that are not referenced in any place
    FOR image_record IN
        SELECT name
        FROM storage.objects
        WHERE bucket_id = 'place-images'
          AND name NOT LIKE 'profiles/%'  -- Exclude profile images
          AND NOT EXISTS (
              SELECT 1 FROM places p
              WHERE p.photo LIKE '%' || name || '%'
                 OR p.images::text LIKE '%' || name || '%'
          )
    LOOP
        -- Delete the orphaned image
        DELETE FROM storage.objects
        WHERE bucket_id = 'place-images' AND name = image_record.name;
        
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Cleaned up % orphaned place images', deleted_count;
    RETURN deleted_count;
END;
$ LANGUAGE plpgsql;

-- Step 7: Create function to get storage statistics
CREATE OR REPLACE FUNCTION get_place_images_storage_stats()
RETURNS TABLE(
    total_images INTEGER,
    total_size_mb NUMERIC,
    profile_images INTEGER,
    place_images INTEGER,
    bucket_limit_mb INTEGER
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_images,
        ROUND((SUM(metadata->>'size')::BIGINT / 1024.0 / 1024.0)::NUMERIC, 2) as total_size_mb,
        COUNT(CASE WHEN name LIKE 'profiles/%' THEN 1 END)::INTEGER as profile_images,
        COUNT(CASE WHEN name NOT LIKE 'profiles/%' THEN 1 END)::INTEGER as place_images,
        50 as bucket_limit_mb  -- 50MB limit
    FROM storage.objects
    WHERE bucket_id = 'place-images';
END;
$ LANGUAGE plpgsql;

-- Step 8: Test the storage setup
DO $
DECLARE
    bucket_exists BOOLEAN;
    bucket_public BOOLEAN;
    policies_count INTEGER;
BEGIN
    -- Check if bucket exists and is public
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets 
        WHERE id = 'place-images'
    ) INTO bucket_exists;
    
    SELECT public FROM storage.buckets 
    WHERE id = 'place-images' 
    INTO bucket_public;
    
    -- Count RLS policies
    SELECT COUNT(*) FROM pg_policies 
    WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%place images%'
    INTO policies_count;
    
    -- Report results
    RAISE NOTICE '=== STORAGE SETUP VERIFICATION ===';
    RAISE NOTICE 'Bucket exists: %', COALESCE(bucket_exists, false);
    RAISE NOTICE 'Bucket is public: %', COALESCE(bucket_public, false);
    RAISE NOTICE 'RLS policies created: %', policies_count;
    
    IF bucket_exists AND bucket_public AND policies_count >= 4 THEN
        RAISE NOTICE '✅ SUCCESS: Multiple images storage is properly configured!';
    ELSE
        RAISE NOTICE '❌ WARNING: Storage setup may have issues. Check the configuration.';
    END IF;
END $;

-- Step 9: Show current storage statistics
SELECT 
    '=== CURRENT STORAGE STATISTICS ===' as section,
    total_images,
    total_size_mb || ' MB' as used_space,
    bucket_limit_mb || ' MB' as total_limit,
    ROUND((total_size_mb / bucket_limit_mb * 100)::NUMERIC, 1) || '%' as usage_percentage
FROM get_place_images_storage_stats();

-- Step 10: Show sample of existing images
SELECT 
    '=== EXISTING IMAGES SAMPLE ===' as section,
    name as filename,
    ROUND((metadata->>'size')::BIGINT / 1024.0, 1) || ' KB' as file_size,
    created_at,
    CASE 
        WHEN name LIKE 'profiles/%' THEN 'Profile Image'
        ELSE 'Place Image'
    END as image_type
FROM storage.objects
WHERE bucket_id = 'place-images'
ORDER BY created_at DESC
LIMIT 10;

-- Step 11: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name 
ON storage.objects(bucket_id, name);

CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at 
ON storage.objects(created_at) 
WHERE bucket_id = 'place-images';

-- Final success message
SELECT 
    '🎉 MULTIPLE IMAGES STORAGE SETUP COMPLETE!' as result,
    'Your Supabase Storage is now ready for multiple place images' as message,
    'Users can upload up to 5 images per place' as feature,
    'All images are publicly accessible via URLs' as access_info;

-- Instructions for testing
SELECT 
    '=== TESTING INSTRUCTIONS ===' as section,
    '1. Add a new place with multiple images in your app' as step_1,
    '2. Check Storage > Files > place-images bucket in Supabase Dashboard' as step_2,
    '3. Verify images appear and are publicly accessible' as step_3,
    '4. Test viewing place details to see image gallery' as step_4;