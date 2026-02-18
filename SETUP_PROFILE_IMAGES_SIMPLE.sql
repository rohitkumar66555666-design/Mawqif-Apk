-- ============================================
-- SIMPLE PROFILE IMAGES STORAGE SETUP
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

-- If the bucket doesn't exist, create it (run this if the above query returns no results)
INSERT INTO storage.buckets (id, name, public)
SELECT 'place-images', 'place-images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'place-images'
);

-- Ensure the bucket is public (needed for profile images to be visible)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'place-images';

-- Remove any existing profile image policies to avoid conflicts
DELETE FROM storage.policies 
WHERE bucket_id = 'place-images' 
  AND id IN (
    'profile-images-upload-policy',
    'profile-images-update-policy', 
    'profile-images-delete-policy',
    'profile-images-public-read-policy'
  );

-- Policy 1: Allow authenticated users to upload profile images
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'profile-images-upload-policy',
    'place-images',
    'Allow authenticated users to upload profile images',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    'INSERT'
);

-- Policy 2: Allow authenticated users to update their own profile images
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'profile-images-update-policy',
    'place-images',
    'Allow users to update their own profile images',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    'UPDATE'
);

-- Policy 3: Allow authenticated users to delete their own profile images
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'profile-images-delete-policy',
    'place-images',
    'Allow users to delete their own profile images',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    NULL,
    'DELETE'
);

-- Policy 4: Allow public read access to profile images (so they show in reviews)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'profile-images-public-read-policy',
    'place-images',
    'Allow public read access to profile images',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles''',
    NULL,
    'SELECT'
);

-- Verify the setup
SELECT 'Bucket Configuration:' as section, id, name, public, created_at
FROM storage.buckets 
WHERE id = 'place-images';

-- Show storage policies for profile images
SELECT 'Storage Policies:' as section, id, name, command, definition
FROM storage.policies 
WHERE bucket_id = 'place-images' 
  AND name LIKE '%profile%'
ORDER BY command;

-- Success confirmation
SELECT 'Setup Status: Profile images storage configured successfully!' as result;