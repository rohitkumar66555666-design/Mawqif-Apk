-- DELETE OLD TABLE AND CREATE NEW REVIEWS TABLE
-- This will completely fix the UUID/TEXT error
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the old reviews table completely
DROP TABLE IF EXISTS reviews CASCADE;

-- Step 2: Create brand new reviews table with correct structure
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Step 3: Create indexes for performance
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Step 4: Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple policy that allows all operations
CREATE POLICY "reviews_public_access" ON reviews 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Step 6: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at_trigger
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Step 8: Insert some sample data to test
INSERT INTO reviews (place_id, user_id, user_name, rating, comment) VALUES
('sample-place-1', 'user123', 'John Doe', 5, 'Great place for prayer!'),
('sample-place-1', 'user456', 'Jane Smith', 4, 'Very peaceful and clean.'),
('sample-place-2', 'user123', 'John Doe', 3, 'Good but could be better.');

-- Step 9: Verify the new table structure
SELECT 'NEW REVIEWS TABLE CREATED SUCCESSFULLY!' as status;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 10: Show sample data
SELECT 'SAMPLE DATA:' as info;
SELECT id, place_id, user_id, user_name, rating, comment, created_at FROM reviews;

-- Step 11: Test that TEXT user_id works
SELECT 'TESTING TEXT USER_ID:' as test;
SELECT COUNT(*) as total_reviews FROM reviews WHERE user_id = 'user123';

SELECT 'SUCCESS: Reviews table is ready with TEXT columns!' as final_status;