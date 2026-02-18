-- Simple Rating Fix - Add columns and triggers for place ratings
-- Run this script to fix the rating system

-- Step 1: Add rating columns to places table (ignore errors if they exist)
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Step 2: Create the trigger function
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
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE 'plpgsql';

-- Step 3: Drop existing triggers (ignore errors if they don't exist)
DROP TRIGGER IF EXISTS update_place_rating_on_insert ON reviews;
DROP TRIGGER IF EXISTS update_place_rating_on_update ON reviews;
DROP TRIGGER IF EXISTS update_place_rating_on_delete ON reviews;

-- Step 4: Create the triggers
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

-- Step 5: Update all existing place ratings
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

-- Step 6: Set places with no reviews to 0 rating
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

-- Step 7: Show current ratings to verify
SELECT 
    'Place ratings updated successfully!' as message,
    COUNT(*) as total_places_updated
FROM places 
WHERE avg_rating IS NOT NULL;

-- Show sample of updated ratings
SELECT 
    title,
    avg_rating,
    review_count
FROM places 
WHERE review_count > 0
ORDER BY review_count DESC
LIMIT 5;