-- Fix Place Rating System - Ensure ratings are calculated and displayed correctly
-- This script checks and fixes the automatic rating calculation system

-- Step 1: Check if rating columns exist in places table
SELECT 'Checking places table structure...' as step;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'places' 
AND column_name IN ('avg_rating', 'review_count')
ORDER BY column_name;

-- Step 2: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add avg_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'places' 
        AND column_name = 'avg_rating'
    ) THEN
        ALTER TABLE public.places ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.0;
        RAISE NOTICE 'Added avg_rating column to places table';
    ELSE
        RAISE NOTICE 'avg_rating column already exists';
    END IF;

    -- Add review_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'places' 
        AND column_name = 'review_count'
    ) THEN
        ALTER TABLE public.places ADD COLUMN review_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added review_count column to places table';
    ELSE
        RAISE NOTICE 'review_count column already exists';
    END IF;
END $$;

-- Step 3: Check if trigger function exists
SELECT 'Checking trigger function...' as step;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_place_rating';

-- Step 4: Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the place's rating and review count
    UPDATE places 
    SET 
        avg_rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0.0) 
            FROM reviews 
            WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.place_id, OLD.place_id);
    
    RAISE NOTICE 'Updated rating for place: %', COALESCE(NEW.place_id, OLD.place_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE 'plpgsql';

-- Step 5: Check existing triggers
SELECT 'Checking existing triggers...' as step;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'reviews'
AND trigger_name LIKE '%rating%';

-- Step 6: Drop existing triggers (if any) and recreate them
DROP TRIGGER IF EXISTS update_place_rating_on_insert ON reviews;
DROP TRIGGER IF EXISTS update_place_rating_on_update ON reviews;
DROP TRIGGER IF EXISTS update_place_rating_on_delete ON reviews;

-- Create the triggers
CREATE TRIGGER update_place_rating_on_insert 
    AFTER INSERT ON reviews
    FOR EACH ROW 
    EXECUTE FUNCTION update_place_rating();

CREATE TRIGGER update_place_rating_on_update 
    AFTER UPDATE ON reviews
    FOR EACH ROW 
    EXECUTE FUNCTION update_place_rating();

CREATE TRIGGER update_place_rating_on_delete 
    AFTER DELETE ON reviews
    FOR EACH ROW 
    EXECUTE FUNCTION update_place_rating();

-- Step 7: Manually calculate and update all existing place ratings
SELECT 'Updating all existing place ratings...' as step;

UPDATE places 
SET 
    avg_rating = COALESCE(review_stats.avg_rating, 0.0),
    review_count = COALESCE(review_stats.review_count, 0),
    updated_at = NOW()
FROM (
    SELECT 
        place_id,
        AVG(rating::DECIMAL) as avg_rating,
        COUNT(*) as review_count
    FROM reviews 
    GROUP BY place_id
) as review_stats
WHERE places.id = review_stats.place_id;

-- Also update places with no reviews to have 0 rating and 0 count
UPDATE places 
SET 
    avg_rating = 0.0,
    review_count = 0,
    updated_at = NOW()
WHERE id NOT IN (
    SELECT DISTINCT place_id 
    FROM reviews 
    WHERE place_id IS NOT NULL
);

-- Step 8: Test the trigger by showing current ratings
SELECT 'Current place ratings:' as step;

SELECT 
    p.id,
    p.title,
    p.avg_rating,
    p.review_count,
    COUNT(r.id) as actual_review_count,
    AVG(r.rating::DECIMAL) as actual_avg_rating
FROM places p
LEFT JOIN reviews r ON p.id = r.place_id
GROUP BY p.id, p.title, p.avg_rating, p.review_count
ORDER BY p.review_count DESC
LIMIT 10;

-- Step 9: Verify triggers are working
SELECT 'Verifying triggers are active...' as step;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'reviews'
AND trigger_name LIKE '%rating%';

SELECT 'Place rating system fixed! Ratings should now update automatically when reviews are added.' as result;