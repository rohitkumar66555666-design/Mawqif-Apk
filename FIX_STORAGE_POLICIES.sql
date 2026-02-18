-- FIX STORAGE POLICIES - Simple Solution
-- This fixes the "row-level security policy" error

-- Step 1: Make sure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'place-images',
    'place-images',
    true,  -- PUBLIC bucket
    52428800,  -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Step 2: Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Public can view prayer place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload prayer place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update prayer place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete prayer place images" ON storage.objects;

-- Step 3: Create simple, permissive policies
-- Allow anyone to view images (public read)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Allow anyone to upload images (public upload)
CREATE POLICY "Allow public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'place-images');

-- Allow anyone to update images
CREATE POLICY "Allow public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'place-images');

-- Allow anyone to delete images
CREATE POLICY "Allow public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'place-images');

-- Step 4: Verify the setup
SELECT 
    'BUCKET STATUS' as check_type,
    id,
    name,
    public,
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

SELECT '🕌 STORAGE POLICIES FIXED! Try uploading an image now.' as result;