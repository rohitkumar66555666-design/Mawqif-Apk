-- TEST HOST RESPONSE DISPLAY
-- This verifies that host responses are properly stored and will be displayed

-- Step 1: Check current reviews with host responses
SELECT 
  'Reviews with host responses' as info,
  id,
  user_name,
  comment,
  host_response,
  host_response_date,
  created_at
FROM reviews
WHERE host_response IS NOT NULL
ORDER BY created_at DESC;

-- Step 2: Check all reviews to see which ones need host responses
SELECT 
  'All reviews (for host response testing)' as info,
  id,
  user_name,
  comment,
  host_response,
  CASE 
    WHEN host_response IS NULL THEN 'No host response yet'
    ELSE 'Has host response'
  END as response_status,
  created_at
FROM reviews
ORDER BY created_at DESC;

-- Step 3: Add a test host response if there are reviews without responses
UPDATE reviews 
SET 
  host_response = 'Thank you for your review! We appreciate your feedback.',
  host_response_date = NOW()
WHERE host_response IS NULL 
AND id = (
  SELECT id FROM reviews 
  WHERE host_response IS NULL 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Step 4: Verify the host response was added
SELECT 
  'After adding test host response' as info,
  id,
  user_name,
  comment,
  host_response,
  host_response_date,
  created_at
FROM reviews
WHERE host_response IS NOT NULL
ORDER BY created_at DESC;

-- Step 5: Show the data format that the app will receive
SELECT 
  'App data format' as info,
  json_build_object(
    'id', id,
    'user_name', user_name,
    'comment', comment,
    'rating', rating,
    'host_response', host_response,
    'host_response_date', host_response_date,
    'created_at', created_at
  ) as review_json
FROM reviews
WHERE host_response IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;

SELECT '✅ HOST RESPONSE TEST COMPLETED!' as success_message;
SELECT 'Host responses should now appear in Place Details screen.' as result;