-- ===============================================
-- STEP-BY-STEP SUPABASE STORAGE SETUP
-- ===============================================
-- Copy and paste each section separately into Supabase SQL Editor

-- ===== STEP 1: CREATE STORAGE BUCKET =====
-- Copy and run this first:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'place-images',
    'place-images', 
    true,
    52428800,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ===== STEP 2: ENABLE RLS =====
-- Copy and run this second:

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===== STEP 3: CREATE UPLOAD POLICY =====
-- Copy and run this third:

DROP POLICY IF EXISTS "Allow authenticated users to upload place images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload place images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'place-images' 
    AND auth.role() = 'authenticated'
);

-- ===== STEP 4: CREATE READ POLICY =====
-- Copy and run this fourth:

DROP POLICY IF EXISTS "Allow public read access to place images" ON storage.objects;
CREATE POLICY "Allow public read access to place images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- ===== STEP 5: CREATE UPDATE POLICY =====
-- Copy and run this fifth:

DROP POLICY IF EXISTS "Allow users to update their place images" ON storage.objects;
CREATE POLICY "Allow users to update their place images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'place-images' 
    AND auth.role() = 'authenticated'
);

-- ===== STEP 6: CREATE DELETE POLICY =====
-- Copy and run this sixth:

DROP POLICY IF EXISTS "Allow users to delete their place images" ON storage.objects;
CREATE POLICY "Allow users to delete their place images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'place-images' 
    AND auth.role() = 'authenticated'
);

-- ===== STEP 7: VERIFY SETUP =====
-- Copy and run this last to verify everything worked:

SELECT 
    'BUCKET VERIFICATION' as check_type,
    id as bucket_id,
    public as is_public,
    file_size_limit / 1024 / 1024 as size_limit_mb
FROM storage.buckets 
WHERE id = 'place-images';

-- ===== DONE! =====
-- If you see a row with:
-- - bucket_id: place-images
-- - is_public: true  
-- - size_limit_mb: 50
-- Then your storage is ready for multiple images!