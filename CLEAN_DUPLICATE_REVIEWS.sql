-- CLEAN DUPLICATE REVIEWS
-- This will help you remove unwanted reviews

-- Step 1: Show what we're about to clean
SELECT 
  'Reviews to be cleaned' as info,
  id,
  user_name,
  reviewer_name,
  comment,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- Step 2: Remove sample/test reviews (be careful with this!)
-- Uncomment the DELETE statements below after reviewing what will be deleted

-- Delete AAMIR Behlim review
-- DELETE FROM reviews 
-- WHERE UPPER(user_name) LIKE '%AAMIR%' 
--    OR UPPER(reviewer_name) LIKE '%AAMIR%'
--    OR UPPER(user_name) LIKE '%BEHLIM%' 
--    OR UPPER(reviewer_name) LIKE '%BEHLIM%';

-- Delete sample reviews from setup scripts
-- DELETE FROM reviews 
-- WHERE user_name IN ('Ahmed Khan', 'Mohammad Rahman', 'Aisha Begum', 'Test User', 'Sample User');

-- Delete test reviews
-- DELETE FROM reviews 
-- WHERE comment LIKE '%test%' 
--    OR comment LIKE '%Test%'
--    OR comment LIKE '%sample%'
--    OR comment LIKE '%Sample%';

-- Step 3: Keep only the most recent review per user per place
-- This removes duplicates but keeps the latest one
-- DELETE FROM reviews 
-- WHERE id NOT IN (
--   SELECT DISTINCT ON (place_id, user_id) id
--   FROM reviews
--   ORDER BY place_id, user_id, created_at DESC
-- );

-- Step 4: Show remaining reviews after cleanup
SELECT 
  'Remaining reviews after cleanup' as info,
  COUNT(*) as total_reviews
FROM reviews;

SELECT 
  'Final review list' as info,
  id,
  place_id,
  user_name,
  reviewer_name,
  rating,
  comment,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- Instructions for manual cleanup:
SELECT '⚠️ INSTRUCTIONS:' as notice;
SELECT '1. First run DEBUG_DUPLICATE_REVIEWS.sql to see what reviews exist' as step1;
SELECT '2. Uncomment the DELETE statements above for the reviews you want to remove' as step2;
SELECT '3. Run this script again to clean up the reviews' as step3;
SELECT '4. Refresh your app to see the updated reviews' as step4;