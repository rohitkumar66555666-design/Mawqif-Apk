-- Add multiple images support to places table
-- This allows users to upload up to 5 images per place

-- Step 1: Add images array column to places table
DO $$
BEGIN
    -- Check if images column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' 
        AND column_name = 'images'
    ) THEN
        -- Add images column as JSON array
        ALTER TABLE places ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added images column to places table';
    ELSE
        RAISE NOTICE 'Images column already exists in places table';
    END IF;
END $$;

-- Step 2: Migrate existing photo data to images array
DO $$
DECLARE
    place_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Migrating existing photo data to images array...';
    
    -- Update places that have a photo but empty images array
    FOR place_record IN
        SELECT id, title, photo
        FROM places 
        WHERE photo IS NOT NULL 
          AND photo != ''
          AND (images IS NULL OR images = '[]'::jsonb)
    LOOP
        -- Move existing photo to images array as first image
        UPDATE places 
        SET images = jsonb_build_array(
            jsonb_build_object(
                'id', 1,
                'url', place_record.photo,
                'is_primary', true,
                'uploaded_at', NOW()
            )
        )
        WHERE id = place_record.id;
        
        updated_count := updated_count + 1;
        
        RAISE NOTICE 'Migrated photo for place: % (%) - %', 
                     place_record.title, 
                     place_record.id, 
                     place_record.photo;
    END LOOP;
    
    RAISE NOTICE 'Migration complete: % places updated', updated_count;
END $$;

-- Step 3: Add helpful functions for image management
CREATE OR REPLACE FUNCTION get_place_primary_image(place_id TEXT)
RETURNS TEXT AS $$
DECLARE
    primary_image_url TEXT;
BEGIN
    -- Get the primary image URL from images array
    SELECT (image->>'url')::TEXT INTO primary_image_url
    FROM places p,
         jsonb_array_elements(p.images) AS image
    WHERE p.id = place_id
      AND (image->>'is_primary')::boolean = true
    LIMIT 1;
    
    -- If no primary image, get the first image
    IF primary_image_url IS NULL THEN
        SELECT (image->>'url')::TEXT INTO primary_image_url
        FROM places p,
             jsonb_array_elements(p.images) AS image
        WHERE p.id = place_id
        LIMIT 1;
    END IF;
    
    -- Fallback to legacy photo column
    IF primary_image_url IS NULL THEN
        SELECT photo INTO primary_image_url
        FROM places
        WHERE id = place_id
          AND photo IS NOT NULL
          AND photo != '';
    END IF;
    
    RETURN primary_image_url;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_place_all_images(place_id TEXT)
RETURNS JSONB AS $$
DECLARE
    all_images JSONB;
BEGIN
    -- Get all images for a place, ordered by primary first, then by id
    SELECT jsonb_agg(
        image ORDER BY 
        CASE WHEN (image->>'is_primary')::boolean THEN 0 ELSE 1 END,
        (image->>'id')::integer
    ) INTO all_images
    FROM places p,
         jsonb_array_elements(p.images) AS image
    WHERE p.id = place_id;
    
    -- If no images in array, check legacy photo column
    IF all_images IS NULL OR all_images = '[]'::jsonb THEN
        SELECT CASE 
            WHEN photo IS NOT NULL AND photo != '' THEN
                jsonb_build_array(
                    jsonb_build_object(
                        'id', 1,
                        'url', photo,
                        'is_primary', true,
                        'uploaded_at', created_at
                    )
                )
            ELSE '[]'::jsonb
        END INTO all_images
        FROM places
        WHERE id = place_id;
    END IF;
    
    RETURN COALESCE(all_images, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_places_images_gin ON places USING GIN (images);

-- Step 5: Add constraints to ensure data quality
DO $$
BEGIN
    -- Add check constraint to limit maximum 5 images
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'places_max_images_check'
    ) THEN
        ALTER TABLE places ADD CONSTRAINT places_max_images_check 
        CHECK (jsonb_array_length(images) <= 5);
        RAISE NOTICE 'Added constraint to limit maximum 5 images per place';
    END IF;
END $$;

-- Step 6: Update existing places to ensure they have valid images array
UPDATE places 
SET images = '[]'::jsonb 
WHERE images IS NULL;

-- Verification queries
SELECT 
    '=== MULTIPLE IMAGES SETUP VERIFICATION ===' as section,
    COUNT(*) as total_places,
    COUNT(CASE WHEN images != '[]'::jsonb THEN 1 END) as places_with_images,
    COUNT(CASE WHEN photo IS NOT NULL AND photo != '' THEN 1 END) as places_with_legacy_photo
FROM places;

-- Show sample of migrated data
SELECT 
    '=== SAMPLE MIGRATED DATA ===' as section,
    id,
    title,
    CASE 
        WHEN photo IS NOT NULL AND photo != '' THEN 'HAS LEGACY PHOTO'
        ELSE 'NO LEGACY PHOTO'
    END as legacy_photo_status,
    jsonb_array_length(images) as image_count,
    get_place_primary_image(id) as primary_image_url
FROM places 
WHERE images != '[]'::jsonb
ORDER BY created_at DESC
LIMIT 5;

-- Test the helper functions
SELECT 
    '=== HELPER FUNCTIONS TEST ===' as section,
    id,
    title,
    get_place_primary_image(id) as primary_image,
    jsonb_array_length(get_place_all_images(id)) as total_images
FROM places 
LIMIT 3;

SELECT 'SUCCESS: Multiple images support added to places table' as result;