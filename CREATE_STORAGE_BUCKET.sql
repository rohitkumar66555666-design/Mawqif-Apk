-- CREATE STORAGE BUCKET FOR IMAGES
-- This will create the missing "place-images" bucket

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'place-images',
    'place-images', 
    true,
    52428800,  -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Step 2: Create RLS policy for public access
CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Step 3: Create policy for authenticated uploads
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'place-images');

-- Step 4: Create policy for authenticated updates
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'place-images');

-- Step 5: Create policy for authenticated deletes
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'place-images');

-- Step 6: Grant permissions
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- Step 7: Verify bucket was created
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
SELECT 'Storage bucket "place-images" created successfully!' as result;