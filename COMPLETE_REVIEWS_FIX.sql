-- COMPLETE REVIEWS FIX - Handles all UUID/TEXT issues
-- Run this in your Supabase SQL Editor

-- Step 1: Drop everything related to reviews
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS review_likes CASCADE;
DROP TABLE IF EXISTS review_replies CASCADE;

-- Step 2: Create new reviews table with ALL TEXT columns
CREATE TABLE reviews (
    id TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
    place_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Step 4: Enable RLS with public access
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_all_access" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Test with actual data format from your app
INSERT INTO reviews (place_id, user_id, user_name, rating, comment) VALUES
('6a77d271-8479-4cf0-84a6-ed65dca56fc7', 'current_user_123', 'Test User', 5, 'Test review'),
('sample-place-2', 'user456', 'Jane Smith', 4, 'Another test review');

-- Step 6: Test queries that your app will use
SELECT 'Testing place_id query:' as test;
SELECT * FROM reviews WHERE place_id = '6a77d271-8479-4cf0-84a6-ed65dca56fc7';

SELECT 'Testing user_id query:' as test;
SELECT * FROM reviews WHERE user_id = 'current_user_123';

-- Step 7: Clean up test data
DELETE FROM reviews WHERE user_name = 'Test User';
DELETE FROM reviews WHERE user_name = 'Jane Smith';

-- Step 8: Verify final structure
SELECT 'FINAL TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'SUCCESS: Reviews table ready with ALL TEXT columns!' as status;