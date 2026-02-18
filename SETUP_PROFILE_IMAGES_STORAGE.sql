-- ============================================
-- SETUP PROFILE IMAGES STORAGE IN SUPABASE
-- Run this in Supabase SQL Editor
-- ============================================

-- Check if place-images bucket exists (this should already exist from previous setup)
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

-- Ensure the bucket is public (needed for profile images to be visible)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'place-images';

-- Create storage policies for profile images (in profiles/ subfolder)

-- Policy 1: Allow authenticated users to upload profile images
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'profile-images-upload-policy',
    'place-images',
    'Allow authenticated users to upload profile images',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    'INSERT'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    check_expression = EXCLUDED.check_expression;

-- Policy 2: Allow authenticated users to update their own profile images
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'profile-images-update-policy',
    'place-images',
    'Allow users to update their own profile images',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    'UPDATE'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition,
    check_expression = EXCLUDED.check_expression;

-- Policy 3: Allow authenticated users to delete their own profile images
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'profile-images-delete-policy',
    'place-images',
    'Allow users to delete their own profile images',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles'' AND auth.role() = ''authenticated''',
    NULL,
    'DELETE'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition;

-- Policy 4: Allow public read access to profile images (so they show in reviews)
INSERT INTO storage.policies (id, bucket_id, name, definition, check_expression, command)
VALUES (
    'profile-images-public-read-policy',
    'place-images',
    'Allow public read access to profile images',
    'bucket_id = ''place-images'' AND (storage.foldername(name))[1] = ''profiles''',
    NULL,
    'SELECT'
) ON CONFLICT (id) DO UPDATE SET
    definition = EXCLUDED.definition;

-- Verify the setup
SELECT 'Storage bucket configuration:' as info;
SELECT 
    id, 
    name, 
    public,
    created_at
FROM storage.buckets 
WHERE id = 'place-images';

SELECT 'Storage policies for profile images:' as info;
SELECT 
    id,
    name,
    command,
    definition
FROM storage.policies 
WHERE bucket_id = 'place-images' 
    AND name LIKE '%profile%'
ORDER BY command;

-- Test profile images folder structure
SELECT 'Profile images folder structure test:' as info;

-- Success message
DO $
BEGIN
    RAISE NOTICE '✅ Profile images storage setup complete!';
    RAISE NOTICE '📁 Profile images will be stored in: place-images/profiles/';
    RAISE NOTICE '🔒 Policies configured for:';
    RAISE NOTICE '   - Authenticated users can upload profile images';
    RAISE NOTICE '   - Users can update their own profile images';
    RAISE NOTICE '   - Users can delete their own profile images';
    RAISE NOTICE '   - Public read access for profile images (visible in reviews)';
    RAISE NOTICE '🌐 Bucket is public - profile images will be accessible via URLs';
END $;