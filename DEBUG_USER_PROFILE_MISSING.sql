-- Debug script for missing user profile issue
-- User ID: dev-4789eaec-4789-4eae-8c-4789eaec91

-- 1. Check if user exists in users table
SELECT 
  'USERS TABLE CHECK' as check_type,
  id,
  phone_number,
  name,
  is_host,
  created_at
FROM users 
WHERE id = 'dev-4789eaec-4789-4eae-8c-4789eaec91';

-- 2. Check if profile exists for this user
SELECT 
  'PROFILES TABLE CHECK' as check_type,
  id as profile_id,
  user_id,
  phone_number,
  full_name,
  created_at,
  last_login_at
FROM profiles 
WHERE user_id = 'dev-4789eaec-4789-4eae-8c-4789eaec91';

-- 3. Check if there's a profile with similar phone number
SELECT 
  'SIMILAR PHONE CHECK' as check_type,
  id as profile_id,
  user_id,
  phone_number,
  full_name,
  created_at
FROM profiles 
WHERE phone_number IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there are places owned by this user
SELECT 
  'PLACES CHECK' as check_type,
  id as place_id,
  title,
  owner_id,
  is_active,
  created_at
FROM places 
WHERE owner_id = 'dev-4789eaec-4789-4eae-8c-4789eaec91';

-- 5. Check all users with dev- prefix (dev mode users)
SELECT 
  'DEV MODE USERS' as check_type,
  u.id,
  u.phone_number as user_phone,
  p.phone_number as profile_phone,
  p.full_name,
  u.created_at
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id LIKE 'dev-%'
ORDER BY u.created_at DESC
LIMIT 10;

-- 6. If profile is missing, create it manually
-- UNCOMMENT AND MODIFY PHONE NUMBER TO CREATE PROFILE:
/*
INSERT INTO profiles (
  user_id,
  phone_number,
  first_name,
  is_verified,
  is_active,
  created_at,
  updated_at
) VALUES (
  'dev-4789eaec-4789-4eae-8c-4789eaec91',
  '+919876543210',  -- Replace with actual phone number
  'Test User',
  false,
  true,
  NOW(),
  NOW()
);
*/

-- 7. Verify profile was created
SELECT 
  'AFTER CREATION CHECK' as check_type,
  id as profile_id,
  user_id,
  phone_number,
  full_name,
  created_at
FROM profiles 
WHERE user_id = 'dev-4789eaec-4789-4eae-8c-4789eaec91';