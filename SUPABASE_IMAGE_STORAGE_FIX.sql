-- ============================================
-- SUPABASE IMAGE STORAGE CONFIGURATION FIX
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'place-images',
  'place-images',
  true,  -- IMPORTANT: Make bucket public
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,  -- Ensure it's public
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Step 2: Set up RLS policies for storage bucket
-- Allow anyone to read (view) images
CREATE POLICY IF NOT EXISTS "Public Access for Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'place-images');

-- Allow users to update their own images
CREATE POLICY IF NOT EXISTS "Users can update own images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'place-images');

-- Allow users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'place-images');

-- Step 3: Grant public access to the bucket
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;

-- Step 4: Verify bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'place-images';

-- Expected output:
-- id: place-images
-- name: place-images
-- public: true  <-- MUST BE TRUE
-- file_size_limit: 5242880
-- allowed_mime_types: {image/jpeg, image/jpg, image/png, image/webp}

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- Check existing images in bucket
SELECT 
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id = 'place-images'
ORDER BY created_at DESC
LIMIT 10;

-- Check RLS policies
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

-- ============================================
-- MANUAL BUCKET CREATION (if above fails)
-- ============================================

-- If the bucket doesn't exist and INSERT fails, create it manually:
-- 1. Go to Supabase Dashboard
-- 2. Click "Storage" in left sidebar
-- 3. Click "New bucket"
-- 4. Name: place-images
-- 5. Check "Public bucket" ✓
-- 6. Click "Create bucket"

-- Then run the RLS policies above

-- ============================================
-- TEST IMAGE URL FORMAT
-- ============================================

-- Your image URLs should look like this:
-- https://[YOUR-PROJECT-ID].supabase.co/storage/v1/object/public/place-images/[filename].jpg

-- Example:
-- https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/place_123_1234567890.jpg

-- If your URLs don't have "/public/" in them, the bucket is NOT public!

-- ============================================
-- FIX EXISTING IMAGE URLS (if needed)
-- ============================================

-- Check current image URLs in places table
SELECT 
  id,
  title,
  photo,
  CASE 
    WHEN photo LIKE '%/public/%' THEN 'Public URL ✓'
    WHEN photo LIKE '%/object/%' AND photo NOT LIKE '%/public/%' THEN 'Private URL ✗'
    ELSE 'Invalid URL ✗'
  END as url_status
FROM places
WHERE photo IS NOT NULL
LIMIT 10;

-- If you have private URLs, you need to:
-- 1. Make bucket public (run Step 1 above)
-- 2. Re-upload images OR
-- 3. Update URLs to include /public/ path

-- ============================================
-- COMPLETE RESET (use with caution)
-- ============================================

-- Only run this if you want to start fresh with storage

-- Drop all policies
DROP POLICY IF EXISTS "Public Access for Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Delete all images (CAUTION!)
-- DELETE FROM storage.objects WHERE bucket_id = 'place-images';

-- Delete bucket (CAUTION!)
-- DELETE FROM storage.buckets WHERE id = 'place-images';

-- Then re-run Step 1 and Step 2 above

-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================

-- ✓ Bucket exists
-- ✓ Bucket is public (public = true)
-- ✓ RLS policies allow SELECT for anon
-- ✓ Image URLs contain "/public/" in path
-- ✓ Images can be accessed in browser without authentication

-- Test in browser:
-- https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/[any-image-name].jpg
-- Should show image or 404, NOT 403 Forbidden
