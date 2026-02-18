-- ============================================
-- SIMPLE STORAGE BUCKET SETUP ONLY
-- Run this in Supabase SQL Editor
-- ============================================

-- Check if place-images bucket exists
SELECT 
    id, 
    name, 
    public,
    created_at
FROM storage.buckets 
WHERE id = 'place-images';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
SELECT 'place-images', 'place-images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'place-images'
);

-- Ensure the bucket is public (needed for images to be visible)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'place-images';

-- Verify the bucket is now configured
SELECT 
    'Bucket Status:' as info,
    id, 
    name, 
    public,
    created_at
FROM storage.buckets 
WHERE id = 'place-images';

-- Success message
SELECT 'Storage bucket setup complete! Now configure policies in Supabase Dashboard.' as result;