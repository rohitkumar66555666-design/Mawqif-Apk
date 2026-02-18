-- CREATE REVIEW LIKES/DISLIKES SYSTEM
-- This creates a proper system where each user can like/dislike a review only once

-- Step 1: Create review_likes table to track user interactions
CREATE TABLE IF NOT EXISTS review_likes (
  id TEXT PRIMARY KEY DEFAULT ('like_' || EXTRACT(EPOCH FROM NOW()) || '_' || RANDOM()),
  review_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  like_type TEXT NOT NULL CHECK (like_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one user can only have one interaction per review
  UNIQUE(review_id, user_id)
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON review_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_type ON review_likes(like_type);

-- Step 3: Create function to update review counts
CREATE OR REPLACE FUNCTION update_review_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update likes_count and dislikes_count in reviews table
  UPDATE reviews 
  SET 
    likes_count = (
      SELECT COUNT(*) 
      FROM review_likes 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND like_type = 'like'
    ),
    dislikes_count = (
      SELECT COUNT(*) 
      FROM review_likes 
      WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
      AND like_type = 'dislike'
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create triggers to automatically update counts
DROP TRIGGER IF EXISTS trigger_update_review_like_counts ON review_likes;
CREATE TRIGGER trigger_update_review_like_counts
  AFTER INSERT OR UPDATE OR DELETE ON review_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_like_counts();

-- Step 5: Initialize counts for existing reviews
UPDATE reviews 
SET 
  likes_count = 0,
  dislikes_count = 0
WHERE likes_count IS NULL OR dislikes_count IS NULL;

-- Step 6: Show the created table structure
SELECT 
  'Review likes table structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'review_likes'
ORDER BY ordinal_position;

-- Step 7: Test the system with sample data (optional)
-- Uncomment to test:
-- INSERT INTO review_likes (review_id, user_id, like_type) 
-- VALUES ('test_review_1', 'test_user_1', 'like');

SELECT '✅ REVIEW LIKES SYSTEM CREATED!' as success_message;
SELECT 'Users can now like/dislike reviews only once per review.' as result;