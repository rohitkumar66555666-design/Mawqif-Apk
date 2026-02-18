-- CHECK HOST RESPONSES (READ-ONLY)
-- This only shows existing data without modifying anything

-- Step 1: Show all reviews with their host response status
SELECT 
  'All reviews with response status' as info,
  id,
  user_name,
  comment,
  host_response,
  CASE 
    WHEN host_response IS NULL THEN '❌ No host response'
    ELSE '✅ Has host response'
  END as response_status,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- Step 2: Show only reviews that have host responses
SELECT 
  'Reviews WITH host responses' as info,
  id,
  user_name,
  comment,
  host_response,
  host_response_date,
  created_at
FROM reviews
WHERE host_response IS NOT NULL
ORDER BY created_at DESC;

-- Step 3: Show only reviews that DON'T have host responses
SELECT 
  'Reviews WITHOUT host responses' as info,
  id,
  user_name,
  comment,
  created_at
FROM reviews
WHERE host_response IS NULL
ORDER BY created_at DESC;

-- Step 4: Count statistics
SELECT 
  'Response statistics' as info,
  COUNT(CASE WHEN host_response IS NOT NULL THEN 1 END) as reviews_with_response,
  COUNT(CASE WHEN host_response IS NULL THEN 1 END) as reviews_without_response,
  COUNT(*) as total_reviews
FROM reviews;

SELECT '✅ HOST RESPONSE CHECK COMPLETED!' as success_message;
SELECT 'Only showing existing data - nothing was modified.' as result;