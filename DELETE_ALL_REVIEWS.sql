-- DELETE ALL REVIEWS (NUCLEAR OPTION)
-- This will remove ALL reviews from your database

-- Step 1: Show what will be deleted
SELECT 
  'All reviews that will be deleted' as warning,
  COUNT(*) as total_reviews_to_delete
FROM reviews;

SELECT 
  'Review details' as info,
  id,
  user_name,
  reviewer_name,
  comment,
  rating,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- Step 2: Delete ALL reviews
DELETE FROM reviews;

-- Step 3: Verify all reviews are gone
SELECT 
  'Reviews after deletion' as info,
  COUNT(*) as remaining_reviews
FROM reviews;

-- Step 4: Reset any auto-increment sequences if they exist
-- This ensures new reviews start with clean IDs
DO $$
BEGIN
  -- Reset sequence if it exists
  IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename LIKE '%reviews%') THEN
    ALTER SEQUENCE reviews_id_seq RESTART WITH 1;
    RAISE NOTICE '✅ Reset reviews ID sequence';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ℹ️ No sequence to reset (this is normal)';
END $$;

SELECT '🧹 ALL REVIEWS DELETED!' as success_message;
SELECT 'Your app will now show no reviews. You can add new ones.' as result;