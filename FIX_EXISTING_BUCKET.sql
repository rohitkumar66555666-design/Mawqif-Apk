-- FIX EXISTING BUCKET PERMISSIONS
-- The bucket exists but app can't see it - fix permissions

-- Step 1: Check if bucket exists and its current settings
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id = 'place-images';

-- Step 2: Make sure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'place-images';

-- Step 3: Drop existing policies (they might be wrong)
DROP POLICY IF EXISTS "Public Access for Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view places" ON storage.objects;

-- Step 4: Create correct RLS policies
CREATE POLICY "Public read access for place images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

CREATE POLICY "Authenticated upload for place images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');

CREATE POLICY "Authenticated update for place images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'place-images');

CREATE POLICY "Authenticated delete for place images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place-images');

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.buckets TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- Step 6: Verify the fix
SELECT 
    'AFTER FIX:' as status,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets
WHERE id = 'place-images';

-- Step 7: Check policies
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

-- Success message
SELECT 'Bucket permissions fixed! Test the Supabase button again.' as result;