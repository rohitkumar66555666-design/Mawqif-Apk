-- ============================================
-- SUPABASE STORAGE SETUP FOR PLACE IMAGES
-- Run this in your Supabase SQL Editor to set up image storage
-- ============================================

-- Step 1: Create storage bucket for place images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'place-images',
  'place-images', 
  true,  -- Make bucket public so images can be viewed by all users
  73400320,  -- 70MB file size limit (enough for 7+ high-quality images)
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- Allowed image types
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify the bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'place-images';

-- Success message
SELECT '✅ Supabase Storage setup complete! You can now upload and share images.' as status;