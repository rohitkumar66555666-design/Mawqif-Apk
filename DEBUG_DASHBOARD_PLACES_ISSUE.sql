-- Debug script for dashboard places not showing issue
-- Run this to check user ID consistency between login sessions

-- 1. Check all users and their phone numbers
SELECT 
  id as user_id,
  phone_number,
  name,
  is_host,
  total_places_added,
  created_at
FROM users 
ORDER BY created_at DESC;

-- 2. Check all profiles and their associated user IDs
SELECT 
  id as profile_id,
  user_id,
  phone_number,
  full_name,
  last_login_at,
  created_at
FROM profiles 
ORDER BY last_login_at DESC NULLS LAST;

-- 3. Check places and their owner IDs
SELECT 
  id as place_id,
  owner_id,
  title,
  is_active,
  created_at,
  updated_at
FROM places 
ORDER BY created_at DESC;

-- 4. Check for phone number consistency issues
-- This shows if same phone number has multiple user IDs
SELECT 
  phone_number,
  COUNT(DISTINCT user_id) as user_id_count,
  array_agg(DISTINCT user_id) as user_ids,
  array_agg(DISTINCT full_name) as names
FROM profiles 
WHERE phone_number IS NOT NULL
GROUP BY phone_number
HAVING COUNT(DISTINCT user_id) > 1;

-- 5. Check places that should be visible but might not be showing in dashboard
-- Replace 'YOUR_PHONE_NUMBER' with the actual phone number having issues
SELECT 
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  pr.phone_number,
  pr.full_name,
  pr.user_id as profile_user_id
FROM places p
LEFT JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number = '+919876543210'  -- Replace with actual phone number
ORDER BY p.created_at DESC;

-- 6. Check if there are orphaned places (places with owner_id not in users table)
SELECT 
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  u.id as user_exists
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE u.id IS NULL;

-- 7. Check recent login activity and user ID changes
SELECT 
  phone_number,
  user_id,
  full_name,
  last_login_at,
  created_at,
  updated_at
FROM profiles 
WHERE phone_number IS NOT NULL
ORDER BY last_login_at DESC NULLS LAST
LIMIT 10;

-- 8. Fix script: Update places to use the latest user_id for a phone number
-- ONLY RUN THIS IF YOU IDENTIFY THE ISSUE
-- Replace 'YOUR_PHONE_NUMBER' with the actual phone number
/*
UPDATE places 
SET owner_id = (
  SELECT user_id 
  FROM profiles 
  WHERE phone_number = '+919876543210'  -- Replace with actual phone number
  ORDER BY last_login_at DESC NULLS LAST
  LIMIT 1
)
WHERE owner_id IN (
  SELECT user_id 
  FROM profiles 
  WHERE phone_number = '+919876543210'  -- Replace with actual phone number
);
*/

-- 9. Verify the fix worked
-- Replace 'YOUR_PHONE_NUMBER' with the actual phone number
SELECT 
  'After Fix Check' as status,
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  pr.phone_number,
  pr.full_name,
  pr.last_login_at
FROM places p
JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number = '+919876543210'  -- Replace with actual phone number
ORDER BY p.created_at DESC;