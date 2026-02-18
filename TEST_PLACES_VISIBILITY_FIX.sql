-- Test script for places visibility fix
-- This tests the phone number lookup functionality

-- 1. Check current places for phone number +916299798907
SELECT 
  'CURRENT PLACES FOR PHONE +916299798907' as info,
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  pr.phone_number,
  pr.user_id as profile_user_id
FROM places p
JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number = '+916299798907'
ORDER BY p.created_at DESC;

-- 2. Check all profiles with this phone number
SELECT 
  'PROFILES WITH PHONE +916299798907' as info,
  id as profile_id,
  user_id,
  phone_number,
  full_name,
  created_at,
  last_login_at
FROM profiles 
WHERE phone_number = '+916299798907'
ORDER BY last_login_at DESC NULLS LAST;

-- 3. Check users table for this phone number
SELECT 
  'USERS WITH PHONE +916299798907' as info,
  id,
  phone_number,
  name,
  is_host,
  created_at
FROM users 
WHERE phone_number = '+916299798907'
ORDER BY created_at DESC;

-- 4. Simulate the phone number lookup process
-- Get all user IDs with this phone number
WITH phone_users AS (
  SELECT user_id 
  FROM profiles 
  WHERE phone_number = '+916299798907'
)
SELECT 
  'PLACES OWNED BY USERS WITH THIS PHONE' as info,
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  pu.user_id as phone_user_id
FROM places p
JOIN phone_users pu ON p.owner_id = pu.user_id
ORDER BY p.created_at DESC;

-- 5. Test update query (similar to what the app does)
-- UNCOMMENT TO TEST THE UPDATE:
/*
WITH phone_users AS (
  SELECT user_id 
  FROM profiles 
  WHERE phone_number = '+916299798907'
)
UPDATE places 
SET owner_id = 'NEW_USER_ID_HERE',  -- Replace with actual new user ID
    is_active = true,
    updated_at = NOW()
WHERE owner_id IN (SELECT user_id FROM phone_users);
*/

-- 6. Check for any orphaned places (places without valid owner)
SELECT 
  'ORPHANED PLACES CHECK' as info,
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  CASE 
    WHEN u.id IS NULL THEN 'ORPHANED (no user)'
    WHEN pr.id IS NULL THEN 'ORPHANED (no profile)'
    ELSE 'OK'
  END as status
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN profiles pr ON p.owner_id = pr.user_id
WHERE u.id IS NULL OR pr.id IS NULL
ORDER BY p.created_at DESC;