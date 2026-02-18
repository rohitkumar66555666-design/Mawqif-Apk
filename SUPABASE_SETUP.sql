-- ============================================
-- SUPABASE DATABASE SETUP FOR LOGIN SYSTEM
-- ============================================

-- 1. Create users table for storing user information
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_places table for places added by users
CREATE TABLE IF NOT EXISTS user_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create bookmarks table for user bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- 4. Create user_reviews table for user reviews
CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- 5. Create place_images table for user uploaded images
CREATE TABLE IF NOT EXISTS place_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create otp_verifications table for OTP management
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(4) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_place ON user_reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_place_images_place ON place_images(place_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone_number);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own reviews
CREATE POLICY "Users can manage own reviews" ON user_reviews FOR ALL USING (auth.uid() = user_id);

-- Users can view all reviews (for displaying on place details)
CREATE POLICY "Anyone can view reviews" ON user_reviews FOR SELECT USING (true);

-- Users can upload images for places
CREATE POLICY "Users can upload images" ON place_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view approved images" ON place_images FOR SELECT USING (is_approved = true);

-- ============================================
-- ENHANCED REVIEWS SYSTEM TABLES
-- ============================================

-- Enhanced reviews table with likes/dislikes and replies
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Using string for now since no auth system
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    is_owner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review replies table
CREATE TABLE IF NOT EXISTS review_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    comment TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    is_owner BOOLEAN DEFAULT false,
    parent_reply_id UUID REFERENCES review_replies(id), -- For nested replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review likes/dislikes table
CREATE TABLE IF NOT EXISTS review_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    is_like BOOLEAN NOT NULL, -- true for like, false for dislike
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id) -- One vote per user per review
);

-- Reply likes/dislikes table
CREATE TABLE IF NOT EXISTS reply_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID NOT NULL REFERENCES review_replies(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    is_like BOOLEAN NOT NULL, -- true for like, false for dislike
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reply_id, user_id) -- One vote per user per reply
);

-- Review reports table
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR ENHANCED REVIEWS SYSTEM
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_likes_count ON reviews(likes_count);
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_reply_id ON reply_likes(reply_id);

-- ============================================
-- TRIGGERS FOR ENHANCED REVIEWS SYSTEM
-- ============================================

-- Trigger to update updated_at for reviews
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for review replies
CREATE TRIGGER update_review_replies_updated_at BEFORE UPDATE ON review_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update place rating when reviews change
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE places 
    SET 
        avg_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
        )
    WHERE id = COALESCE(NEW.place_id, OLD.place_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update place rating
CREATE TRIGGER update_place_rating_on_insert AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_place_rating();

CREATE TRIGGER update_place_rating_on_update AFTER UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_place_rating();

CREATE TRIGGER update_place_rating_on_delete AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_place_rating();

-- ============================================
-- RLS POLICIES FOR ENHANCED REVIEWS SYSTEM
-- ============================================

-- Enable RLS on new tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (since no auth system)
CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations on review_replies" ON review_replies FOR ALL USING (true);
CREATE POLICY "Allow all operations on review_likes" ON review_likes FOR ALL USING (true);
CREATE POLICY "Allow all operations on reply_likes" ON reply_likes FOR ALL USING (true);
CREATE POLICY "Allow all operations on review_reports" ON review_reports FOR ALL USING (true);

-- ============================================
-- SAMPLE DATA FOR ENHANCED REVIEWS SYSTEM
-- ============================================

-- Insert sample reviews (assuming places table exists)
INSERT INTO reviews (place_id, user_id, user_name, rating, comment, likes_count, dislikes_count, replies_count, is_owner) 
SELECT 
    p.id,
    'user1',
    'Ahmed Khan',
    5,
    'Excellent place for prayer! Very clean and peaceful environment. The facilities are well maintained and the staff is very helpful.',
    12,
    1,
    2,
    false
FROM places p 
WHERE p.title LIKE '%Masjid%' OR p.title LIKE '%Islamic%'
LIMIT 1;

INSERT INTO reviews (place_id, user_id, user_name, rating, comment, likes_count, dislikes_count, replies_count, is_owner) 
SELECT 
    p.id,
    'user2',
    'Mohammad Rahman',
    4,
    'Good facilities overall. The prayer hall is spacious and clean. However, parking can be challenging during peak hours.',
    8,
    2,
    1,
    false
FROM places p 
WHERE p.title LIKE '%Masjid%' OR p.title LIKE '%Islamic%'
LIMIT 1;

INSERT INTO reviews (place_id, user_id, user_name, rating, comment, likes_count, dislikes_count, replies_count, is_owner) 
SELECT 
    p.id,
    'user3',
    'Aisha Begum',
    5,
    'Wonderful place with excellent facilities for women. The separate prayer area is very well organized and comfortable.',
    15,
    0,
    0,
    false
FROM places p 
WHERE p.title LIKE '%Masjid%' OR p.title LIKE '%Islamic%'
LIMIT 1;

-- Insert sample replies
INSERT INTO review_replies (review_id, user_id, user_name, comment, likes_count, dislikes_count, is_owner) 
SELECT 
    r.id,
    'owner1',
    'Masjid Admin',
    'Thank you for your kind words! We strive to maintain the best facilities for our community.',
    8,
    0,
    true
FROM reviews r 
WHERE r.user_name = 'Ahmed Khan'
LIMIT 1;

INSERT INTO review_replies (review_id, user_id, user_name, comment, likes_count, dislikes_count, is_owner) 
SELECT 
    r.id,
    'user4',
    'Fatima Ali',
    'I completely agree! This place has been a blessing for our family.',
    5,
    0,
    false
FROM reviews r 
WHERE r.user_name = 'Ahmed Khan'
LIMIT 1;

INSERT INTO review_replies (review_id, user_id, user_name, comment, likes_count, dislikes_count, is_owner) 
SELECT 
    r.id,
    'owner1',
    'Masjid Admin',
    'Thank you for the feedback. We are working on expanding our parking facilities to better serve the community.',
    3,
    0,
    true
FROM reviews r 
WHERE r.user_name = 'Mohammad Rahman'
LIMIT 1;