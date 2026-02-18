-- DEBUG DUPLICATE REVIEWS
-- This will show you exactly what reviews exist and why you're seeing two

-- Step 1: Show ALL reviews in the database
SELECT 
  'All reviews in database' as info,
  id,
  place_id,
  user_id,
  user_name,
  reviewer_name,
  rating,
  comment,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- Step 2: Count reviews per place
SELECT 
  'Reviews per place' as info,
  place_id,
  COUNT(*) as review_count
FROM reviews
GROUP BY place_id
ORDER BY review_count DESC;

-- Step 3: Show reviews for the specific place you're looking at
-- (Replace 'your_place_id' with the actual place ID you're viewing)
SELECT 
  'Reviews for current place' as info,
  r.id,
  r.user_id,
  r.user_name,
  r.reviewer_name,
  r.rating,
  r.comment,
  r.created_at,
  p.title as place_title
FROM reviews r
LEFT JOIN places p ON r.place_id = p.id
WHERE r.place_id IN (
  SELECT id FROM places 
  WHERE owner_id LIKE 'mock_user_%' 
  OR title LIKE '%test%'
  OR title LIKE '%Test%'
)
ORDER BY r.created_at DESC;

-- Step 4: Check for duplicate reviews (same user, same place)
SELECT 
  'Potential duplicate reviews' as info,
  place_id,
  user_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(id, ', ') as review_ids
FROM reviews
GROUP BY place_id, user_id
HAVING COUNT(*) > 1;

-- Step 5: Show sample data that might have been inserted
SELECT 
  'Sample/test reviews' as info,
  id,
  user_name,
  reviewer_name,
  comment,
  created_at
FROM reviews
WHERE user_name LIKE '%Test%' 
   OR user_name LIKE '%Sample%'
   OR user_name LIKE '%Ahmed%'
   OR user_name LIKE '%Mohammad%'
   OR user_name LIKE '%AAMIR%'
   OR comment LIKE '%test%'
   OR comment LIKE '%Test%'
   OR comment LIKE '%sample%'
ORDER BY created_at DESC;

-- Step 6: Show reviews by creation date to see the pattern
SELECT 
  'Reviews by date' as info,
  DATE(created_at) as review_date,
  COUNT(*) as reviews_on_date,
  STRING_AGG(user_name, ', ') as reviewers
FROM reviews
GROUP BY DATE(created_at)
ORDER BY review_date DESC;

SELECT 'Review analysis complete!' as status;
SELECT 'Check the results above to see why you have multiple reviews.' as instruction;