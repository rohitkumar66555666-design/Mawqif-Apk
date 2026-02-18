-- COMPLETE STORAGE BUCKET SETUP FOR PRAYER PLACE IMAGES
-- This will create everything needed for image uploads

-- Step 1: Create the storage bucket (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'place-images',
            'place-images',
            true,  -- PUBLIC bucket for prayer place images
            52428800,  -- 50MB limit
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        );
        RAISE NOTICE '✅ Created storage bucket: place-images';
    ELSE
        RAISE NOTICE '⚠️ Bucket already exists, updating settings...';
        
        -- Make sure existing bucket is public
        UPDATE storage.buckets 
        SET 
            public = true,
            file_size_limit = 52428800,
            allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        WHERE id = 'place-images';
        
        RAISE NOTICE '✅ Updated bucket settings to public';
    END IF;
END $$;

-- Step 2: Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Public Access for Images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload for place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view places" ON storage.objects;

-- Step 3: Create comprehensive RLS policies
-- Public read access (anyone can view prayer place images)
CREATE POLICY "Public can view prayer place images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Authenticated users can upload prayer place images
CREATE POLICY "Authenticated can upload prayer place images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');

-- Authenticated users can update their uploaded images
CREATE POLICY "Authenticated can update prayer place images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'place-images');

-- Authenticated users can delete their uploaded images
CREATE POLICY "Authenticated can delete prayer place images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place-images');

-- Step 4: Grant necessary permissions
-- Grant schema usage
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Grant bucket access
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.buckets TO authenticated;

-- Grant object access
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- Step 5: Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify the setup
SELECT 
    '=== VERIFICATION RESULTS ===' as section;

-- Check bucket
SELECT 
    'BUCKET STATUS' as check_type,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    CASE 
        WHEN public = true THEN '✅ PUBLIC - Images will be accessible'
        ELSE '❌ PRIVATE - Images will NOT be accessible'
    END as status
FROM storage.buckets
WHERE id = 'place-images';

-- Check policies
SELECT 
    'POLICIES STATUS' as check_type,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ All policies created'
        ELSE '❌ Missing policies'
    END as status
FROM storage.policies
WHERE bucket_id = 'place-images';

-- Test URL format
SELECT 
    'URL FORMAT TEST' as check_type,
    CONCAT(
        'https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/',
        'test-prayer-place.jpg'
    ) as sample_public_url,
    '✅ This is how prayer place image URLs should look' as status;

-- Final success message
SELECT 
    '🕌 PRAYER PLACE IMAGE STORAGE SETUP COMPLETE! 🕌' as result,
    'Users can now upload and view prayer place images' as description;