-- ===============================================
-- MINIMAL STORAGE SETUP (No RLS Policies)
-- ===============================================
-- Try this minimal approach if you're getting permission errors

-- Step 1: Just create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('place-images', 'place-images', true, 52428800)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- Step 2: Verify the bucket was created
SELECT 
    'BUCKET CREATED' as status,
    id,
    name,
    public,
    file_size_limit / 1024 / 1024 as size_limit_mb
FROM storage.buckets 
WHERE id = 'place-images';

-- That's it! 
-- The app should work with just a public bucket.
-- Supabase will handle the basic permissions automatically.