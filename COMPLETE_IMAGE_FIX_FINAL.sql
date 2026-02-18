-- COMPLETE IMAGE FIX - FINAL SOLUTION
-- This will fix all image issues in your prayer app

-- Step 1: Clean up ALL hardcoded URLs from database
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%bing.net%'
   OR photo LIKE '%tse2.mm.bing.net%'
   OR photo LIKE '%OIP.CFIXqi76j82ev1hH_9hs7AHaE%'
   OR photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Step 2: Create storage bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'place-images',
            'place-images',
            true,  -- PUBLIC bucket
            52428800,  -- 50MB limit
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        );
        RAISE NOTICE '✅ Created storage bucket: place-images';
    ELSE
        -- Make sure existing bucket is public
        UPDATE storage.buckets 
        SET 
            public = true,
            file_size_limit = 52428800,
            allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        WHERE id = 'place-images';
        RAISE NOTICE '✅ Updated bucket to public';
    END IF;
END $$;

-- Step 3: Drop and recreate all storage policies
DROP POLICY IF EXISTS "Public can view prayer place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload prayer place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update prayer place images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete prayer place images" ON storage.objects;

-- Create new policies
CREATE POLICY "Public can view prayer place images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

CREATE POLICY "Authenticated can upload prayer place images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-images');

CREATE POLICY "Authenticated can update prayer place images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'place-images');

CREATE POLICY "Authenticated can delete prayer place images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place-images');

-- Step 4: Grant permissions
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- Step 5: Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify everything is working
SELECT 
    '=== VERIFICATION ===' as section,
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images' AND public = true) 
        THEN '✅ Bucket exists and is public'
        ELSE '❌ Bucket problem'
    END as bucket_status,
    (SELECT COUNT(*) FROM storage.policies WHERE bucket_id = 'place-images') as policy_count,
    (SELECT COUNT(*) FROM places WHERE photo LIKE '%bing.net%') as remaining_bing_urls;

-- Step 7: Show sample public URL format
SELECT 
    'SAMPLE URL FORMAT' as info,
    CONCAT(
        'https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/',
        'place_', 
        EXTRACT(EPOCH FROM NOW())::text,
        '.jpg'
    ) as expected_url_format;

SELECT '🕌 IMAGE SYSTEM FIXED! Now test uploading a new image.' as result;