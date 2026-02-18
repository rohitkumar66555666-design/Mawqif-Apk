`-- Fix bookmark user ID mismatch
-- Step 1: Find what user_id the bookmark is currently stored with

-- Show the current bookmark and its user_id
SELECT 
    id,
    user_id as current_user_id,
    place_id,
    created_at,
    'Current bookmark' as status
FROM bookmarks 
ORDER BY created_at DESC 
LIMIT 5;

-- Step 2: Update the bookmark to use the correct user ID
-- Replace 'CORRECT_USER_ID_HERE' with the actual user ID from your app logs

-- First, let's see what user IDs might be correct
-- Check if there are any patterns that match phone number formats
SELECT DISTINCT user_id FROM bookmarks;

-- If your app is using phone number as user ID, update the bookmark:
-- UPDATE bookmarks 
-- SET user_id = '+918655102089' 
-- WHERE user_id != '+918655102089';

-- If your app is using a UUID, you'll need to get the correct UUID from the app logs
-- and then run:
-- UPDATE bookmarks 
-- SET user_id = 'YOUR_ACTUAL_USER_ID_FROM_LOGS' 
-- WHERE user_id != 'YOUR_ACTUAL_USER_ID_FROM_LOGS';

-- Step 3: Verify the fix
-- SELECT 
--     user_id,
--     COUNT(*) as bookmark_count
-- FROM bookmarks 
-- GROUP BY user_id;`