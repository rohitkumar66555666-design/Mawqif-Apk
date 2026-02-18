-- REMOVE AAMIR BEHLIM REVIEW
-- This script will find and remove the AAMIR Behlim review if it exists

-- Step 1: Check if the AAMIR review exists
SELECT 
  'Searching for AAMIR review' as search_type,
  id,
  user_name,
  reviewer_name,
  comment,
  rating,
  created_at
FROM reviews 
WHERE UPPER(user_name) LIKE '%AAMIR%' 
   OR UPPER(reviewer_name) LIKE '%AAMIR%'
   OR UPPER(user_name) LIKE '%BEHLIM%' 
   OR UPPER(reviewer_name) LIKE '%BEHLIM%';

-- Step 2: Show all reviews to see what's there
SELECT 
  'All current reviews' as info,
  id,
  user_name,
  reviewer_name,
  comment,
  rating,
  created_at
FROM reviews 
ORDER BY created_at DESC;

-- Step 3: Delete AAMIR review if it exists
DELETE FROM reviews 
WHERE UPPER(user_name) LIKE '%AAMIR%' 
   OR UPPER(reviewer_name) LIKE '%AAMIR%'
   OR UPPER(user_name) LIKE '%BEHLIM%' 
   OR UPPER(reviewer_name) LIKE '%BEHLIM%';

-- Step 4: Verify deletion
SELECT 
  'After deletion - remaining reviews' as info,
  COUNT(*) as total_reviews
FROM reviews;

-- Step 5: Show remaining reviews
SELECT 
  'Remaining reviews' as info,
  id,
  user_name,
  reviewer_name,
  comment,
  rating,
  created_at
FROM reviews 
ORDER BY created_at DESC;

SELECT '✅ AAMIR BEHLIM REVIEW REMOVED!' as success_message;
SELECT 'The review should no longer appear in your app.' as result;