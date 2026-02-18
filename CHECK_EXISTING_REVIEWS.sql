-- CHECK EXISTING REVIEWS IN DATABASE
-- This will show all reviews currently in your database

-- Step 1: Check if reviews table exists and has data
SELECT 
  'Reviews table info' as info,
  COUNT(*) as total_reviews
FROM reviews;

-- Step 2: Show all existing reviews with details
SELECT 
  'All existing reviews' as info,
  id,
  place_id,
  user_id,
  user_name,
  reviewer_name,
  rating,
  comment,
  created_at,
  updated_at
FROM reviews
ORDER BY created_at DESC;

-- Step 3: Check if there are any reviews with "AAMIR" or "Behlim"
SELECT 
  'AAMIR/Behlim reviews' as search_type,
  id,
  user_name,
  reviewer_name,
  comment,
  created_at
FROM reviews 
WHERE UPPER(user_name) LIKE '%AAMIR%' 
   OR UPPER(reviewer_name) LIKE '%AAMIR%'
   OR UPPER(user_name) LIKE '%BEHLIM%' 
   OR UPPER(reviewer_name) LIKE '%BEHLIM%'
   OR UPPER(comment) LIKE '%AAMIR%'
   OR UPPER(comment) LIKE '%BEHLIM%';

-- Step 4: Check places table for any hardcoded reviews or data
SELECT 
  'Places with reviews' as info,
  p.id,
  p.title,
  p.city,
  COUNT(r.id) as review_count
FROM places p
LEFT JOIN reviews r ON p.id = r.place_id
GROUP BY p.id, p.title, p.city
HAVING COUNT(r.id) > 0
ORDER BY review_count DESC;

-- Step 5: Show sample data from places table
SELECT 
  'Sample places data' as info,
  id,
  title,
  city,
  type,
  created_at
FROM places 
ORDER BY created_at DESC
LIMIT 5;