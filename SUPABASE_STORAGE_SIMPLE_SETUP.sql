-- ===============================================
-- SIMPLE SUPABASE STORAGE SETUP FOR MULTIPLE IMAGES
-- ===============================================
-- Run these commands one by one in your Supabase SQL Editor

-- Step 1: Create storage bucket for multiple place images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'place-images',
    'place-images', 
    true,  -- Public bucket so users can view images
    52428800,  -- 50MB file size limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']  -- Allowed image types
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Step 2: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for place images storage

-- Policy 1: Allow authenticated users to upload images
DROP POLICY IF EXISTS "Allow authenticated users to upload place images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload place images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'place-images' 
    AND auth.role() = 'authenticated'
);

-- Policy 2: Allow public read access to all place images
DROP POLICY IF EXISTS "Allow public read access to place images" ON storage.objects;
CREATE POLICY "Allow public read access to place images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Policy 3: Allow users to update their own uploaded images
DROP POLICY IF EXISTS "Allow users to update their place images" ON storage.objects;
CREATE POLICY "Allow users to update their place images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'place-images' 
    AND auth.role() = 'authenticated'
);

-- Policy 4: Allow users to delete their own uploaded images
DROP POLICY IF EXISTS "Allow users to delete their place images" ON storage.objects;
CREATE POLICY "Allow users to delete their place images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'place-images' 
    AND auth.role() = 'authenticated'
);

-- Step 4: Create helper function to get storage statistics
CREATE OR REPLACE FUNCTION get_place_images_storage_stats()
RETURNS TABLE(
    total_images INTEGER,
    total_size_mb NUMERIC,
    profile_images INTEGER,
    place_images INTEGER,
    bucket_limit_mb INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_images,
        ROUND((SUM(COALESCE((metadata->>'size')::BIGINT, 0)) / 1024.0 / 1024.0)::NUMERIC, 2) as total_size_mb,
        COUNT(CASE WHEN name LIKE 'profiles/%' THEN 1 END)::INTEGER as profile_images,
        COUNT(CASE WHEN name NOT LIKE 'profiles/%' THEN 1 END)::INTEGER as place_images,
        50 as bucket_limit_mb  -- 50MB limit
    FROM storage.objects
    WHERE bucket_id = 'place-images';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name 
ON storage.objects(bucket_id, name);

CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at 
ON storage.objects(created_at) 
WHERE bucket_id = 'place-images';

-- Step 6: Verify the setup
SELECT 
    'STORAGE SETUP VERIFICATION' as section,
    id as bucket_id,
    name as bucket_name,
    public as is_public,
    file_size_limit / 1024 / 1024 as size_limit_mb,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'place-images';

-- Step 7: Check RLS policies
SELECT 
    'RLS POLICIES' as section,
    policyname as policy_name,
    cmd as command_type,
    qual as condition
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%place images%';

-- Step 8: Show current storage statistics
SELECT 
    'CURRENT STORAGE STATISTICS' as section,
    total_images,
    total_size_mb || ' MB' as used_space,
    bucket_limit_mb || ' MB' as total_limit,
    CASE 
        WHEN bucket_limit_mb > 0 THEN 
            ROUND((total_size_mb / bucket_limit_mb * 100)::NUMERIC, 1) || '%'
        ELSE '0%'
    END as usage_percentage
FROM get_place_images_storage_stats();

-- Step 9: Show sample of existing images
SELECT 
    'EXISTING IMAGES SAMPLE' as section,
    name as filename,
    ROUND(COALESCE((metadata->>'size')::BIGINT, 0) / 1024.0, 1) || ' KB' as file_size,
    created_at,
    CASE 
        WHEN name LIKE 'profiles/%' THEN 'Profile Image'
        ELSE 'Place Image'
    END as image_type
FROM storage.objects
WHERE bucket_id = 'place-images'
ORDER BY created_at DESC
LIMIT 10;

-- Final success message
SELECT 
    '🎉 MULTIPLE IMAGES STORAGE SETUP COMPLETE!' as result,
    'Your Supabase Storage is now ready for multiple place images' as message;