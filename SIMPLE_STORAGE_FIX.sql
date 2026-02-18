-- SIMPLE STORAGE FIX - Avoids storage.policies errors
-- This creates the bucket without checking policies

-- Step 1: Create or update the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'place-images',
    'place-images',
    true,  -- PUBLIC bucket (very important!)
    52428800,  -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Step 2: Verify bucket was created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    CASE 
        WHEN public = true THEN '✅ PUBLIC - Images will work'
        ELSE '❌ PRIVATE - Images will NOT work'
    END as status
FROM storage.buckets
WHERE id = 'place-images';

-- Success message
SELECT 'Bucket created! Now set up policies manually through Supabase UI.' as next_step;