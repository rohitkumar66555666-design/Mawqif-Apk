-- DEBUG MY REVIEWS - Find why reviews aren't showing in profile
-- Run this in your Supabase SQL Editor

-- Step 1: Check all reviews in the database
SELECT 'ALL REVIEWS IN DATABASE:' as info;
SELECT 
    id,
    place_id,
    user_id,
    user_name,
    rating,
    comment,
    created_at
FROM reviews 
ORDER BY created_at DESC;

-- Step 2: Check what user_id values are being stored
SELECT 'UNIQUE USER_IDs IN REVIEWS:' as info;
SELECT DISTINCT user_id, user_name, COUNT(*) as review_count
FROM reviews 
GROUP BY user_id, user_name
ORDER BY review_count DESC;

-- Step 3: Check if there are any reviews with 'current_user_123'
SELECT 'REVIEWS FOR current_user_123:' as info;
SELECT * FROM reviews WHERE user_id = 'current_user_123';

-- Step 4: Check if there are any reviews with similar user IDs
SELECT 'REVIEWS WITH SIMILAR USER_IDs:' as info;
SELECT * FROM reviews WHERE user_id LIKE '%current%' OR user_id LIKE '%user%';

-- Step 5: Show the most recent reviews
SELECT 'MOST RECENT REVIEWS:' as info;
SELECT 
    user_id,
    user_name,
    rating,
    comment,
    created_at
FROM reviews 
ORDER BY created_at DESC 
LIMIT 5;