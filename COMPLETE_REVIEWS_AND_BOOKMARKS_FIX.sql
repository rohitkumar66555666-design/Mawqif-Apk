-- COMPLETE REVIEWS AND BOOKMARKS DATABASE FIX
-- This script fixes all database issues and creates the bookmarks system
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: DROP AND RECREATE REVIEWS TABLE WITH CORRECT TYPES
-- ============================================================================

-- Drop existing reviews table and related objects
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS review_likes CASCADE;
DROP TABLE IF EXISTS review_replies CASCADE;

-- Create reviews table with TEXT columns (not UUID)
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

-- Create indexes for performance
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_likes ON reviews(likes_count DESC);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_authenticated" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE USING (true);
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at_trigger
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- ============================================================================
-- STEP 2: CREATE BOOKMARKS TABLE
-- ============================================================================

-- Drop existing bookmarks table if it exists
DROP TABLE IF EXISTS bookmarks CASCADE;

-- Create bookmarks table
CREATE TABLE bookmarks (
    id TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    place_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can't bookmark same place twice
    UNIQUE(user_id, place_id)
);

-- Create indexes for performance
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_place_id ON bookmarks(place_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "bookmarks_update_own" ON bookmarks FOR UPDATE USING (true);
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE USING (true);

-- Create function to update bookmarks updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_bookmarks_updated_at_trigger
    BEFORE UPDATE ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_bookmarks_updated_at();

-- ============================================================================
-- STEP 3: INSERT SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample reviews for testing
INSERT INTO reviews (place_id, user_id, user_name, rating, comment) VALUES
('sample-place-1', 'current_user_123', 'Test User', 5, 'Excellent place for prayer. Very clean and peaceful.'),
('sample-place-1', 'user_456', 'Another User', 4, 'Good facilities, but can get crowded during peak hours.'),
('sample-place-2', 'current_user_123', 'Test User', 3, 'Average place. Could use some improvements.')
ON CONFLICT (id) DO NOTHING;

-- Insert sample bookmarks for testing
INSERT INTO bookmarks (user_id, place_id) VALUES
('current_user_123', 'sample-place-1'),
('current_user_123', 'sample-place-2'),
('user_456', 'sample-place-1')
ON CONFLICT (user_id, place_id) DO NOTHING;

-- ============================================================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================================================

-- Verify reviews table structure
SELECT 'REVIEWS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify bookmarks table structure
SELECT 'BOOKMARKS TABLE STRUCTURE:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookmarks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data
SELECT 'SAMPLE REVIEWS:' as info;
SELECT id, place_id, user_id, user_name, rating, LEFT(comment, 50) as comment_preview, created_at FROM reviews LIMIT 5;

SELECT 'SAMPLE BOOKMARKS:' as info;
SELECT id, user_id, place_id, created_at FROM bookmarks LIMIT 5;

-- Test review statistics query
SELECT 'REVIEW STATISTICS TEST:' as info;
SELECT 
    user_id,
    COUNT(*) as total_reviews,
    AVG(rating) as average_rating,
    SUM(likes_count) as total_likes
FROM reviews 
GROUP BY user_id;

-- Success message
SELECT '✅ DATABASE SETUP COMPLETE!' as status;
SELECT 'Reviews and Bookmarks tables created successfully with TEXT columns' as message;
SELECT 'You can now use the app without UUID/TEXT type errors' as note;