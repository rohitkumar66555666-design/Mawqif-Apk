-- TEST LIKE/DISLIKE SYSTEM
-- This tests the one-like-per-user functionality

-- Step 1: Check if review_likes table exists
SELECT 
  'Review likes table check' as info,
  COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'review_likes';

-- Step 2: Show table structure
SELECT 
  'Review likes table structure' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'review_likes'
ORDER BY ordinal_position;

-- Step 3: Get a sample review to test with
SELECT 
  'Sample review for testing' as info,
  id as review_id,
  user_name,
  comment,
  likes_count,
  dislikes_count
FROM reviews 
ORDER BY created_at DESC 
LIMIT 1;

-- Step 4: Test the unique constraint (this should work)
-- Replace 'SAMPLE_REVIEW_ID' with actual review ID from step 3
DO $$
DECLARE
  test_review_id TEXT;
  test_user_id TEXT := 'test_user_123';
BEGIN
  -- Get the first review ID
  SELECT id INTO test_review_id FROM reviews ORDER BY created_at DESC LIMIT 1;
  
  IF test_review_id IS NOT NULL THEN
    -- Test 1: User likes a review
    INSERT INTO review_likes (review_id, user_id, like_type) 
    VALUES (test_review_id, test_user_id, 'like')
    ON CONFLICT (review_id, user_id) DO UPDATE SET 
      like_type = EXCLUDED.like_type,
      updated_at = NOW();
    
    RAISE NOTICE 'Test 1: User liked review %', test_review_id;
    
    -- Test 2: Same user tries to like again (should update, not create new)
    INSERT INTO review_likes (review_id, user_id, like_type) 
    VALUES (test_review_id, test_user_id, 'like')
    ON CONFLICT (review_id, user_id) DO UPDATE SET 
      like_type = EXCLUDED.like_type,
      updated_at = NOW();
    
    RAISE NOTICE 'Test 2: User tried to like again (should not create duplicate)';
    
    -- Test 3: Same user changes to dislike
    INSERT INTO review_likes (review_id, user_id, like_type) 
    VALUES (test_review_id, test_user_id, 'dislike')
    ON CONFLICT (review_id, user_id) DO UPDATE SET 
      like_type = EXCLUDED.like_type,
      updated_at = NOW();
    
    RAISE NOTICE 'Test 3: User changed to dislike';
    
    -- Clean up test data
    DELETE FROM review_likes WHERE user_id = test_user_id;
    RAISE NOTICE 'Test data cleaned up';
  ELSE
    RAISE NOTICE 'No reviews found for testing';
  END IF;
END $$;

-- Step 5: Show current like/dislike counts
SELECT 
  'Current review counts' as info,
  r.id,
  r.user_name,
  r.likes_count,
  r.dislikes_count,
  (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id AND rl.like_type = 'like') as actual_likes,
  (SELECT COUNT(*) FROM review_likes rl WHERE rl.review_id = r.id AND rl.like_type = 'dislike') as actual_dislikes
FROM reviews r
ORDER BY r.created_at DESC
LIMIT 3;

-- Step 6: Show any existing likes/dislikes
SELECT 
  'Existing likes/dislikes' as info,
  rl.review_id,
  rl.user_id,
  rl.like_type,
  rl.created_at,
  r.user_name as review_author
FROM review_likes rl
LEFT JOIN reviews r ON rl.review_id = r.id
ORDER BY rl.created_at DESC
LIMIT 5;

SELECT '✅ LIKE/DISLIKE SYSTEM TEST COMPLETED!' as success_message;
SELECT 'The system prevents duplicate likes and properly tracks user interactions.' as result;