-- DELETE UNWANTED REVIEWS
-- This will actually remove the reviews from your database

-- Step 1: Show what reviews exist before deletion
SELECT 
  'Reviews BEFORE deletion' as info,
  id,
  user_name,
  reviewer_name,
  comment,
  rating,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- Step 2: Delete the AAMIR Behlim review (sample data)
DELETE FROM reviews 
WHERE UPPER(user_name) LIKE '%AAMIR%' 
   OR UPPER(reviewer_name) LIKE '%AAMIR%'
   OR UPPER(user_name) LIKE '%BEHLIM%' 
   OR UPPER(reviewer_name) LIKE '%BEHLIM%';

-- Step 3: Delete other sample reviews from setup scripts
DELETE FROM reviews 
WHERE user_name IN ('Ahmed Khan', 'Mohammad Rahman', 'Aisha Begum', 'Masjid Admin', 'Fatima Ali');

-- Step 4: Delete any test reviews
DELETE FROM reviews 
WHERE comment LIKE '%test%' 
   OR comment LIKE '%Test%'
   OR comment LIKE '%sample%'
   OR comment LIKE '%Sample%'
   OR comment LIKE '%excellent place for prayer%'
   OR comment LIKE '%Good facilities overall%'
   OR comment LIKE '%Wonderful place with excellent facilities%';

-- Step 5: Show what reviews remain after deletion
SELECT 
  'Reviews AFTER deletion' as info,
  id,
  user_name,
  reviewer_name,
  comment,
  rating,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- Step 6: Show count of remaining reviews
SELECT 
  'Total reviews remaining' as info,
  COUNT(*) as review_count
FROM reviews;

SELECT '✅ UNWANTED REVIEWS DELETED!' as success_message;
SELECT 'Refresh your app to see the updated reviews.' as instruction;