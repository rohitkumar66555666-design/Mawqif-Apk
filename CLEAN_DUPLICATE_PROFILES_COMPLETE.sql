-- ============================================
-- COMPLETE DUPLICATE PROFILES CLEANUP
-- ============================================
-- This script will clean up all duplicate profiles and users
-- Run this in Supabase SQL Editor

-- Step 1: Check current duplicate issues
SELECT 'DUPLICATE USER_IDS IN PROFILES' as issue_type, user_id, COUNT(*) as count
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1
UNION ALL
SELECT 'DUPLICATE PHONE_NUMBERS IN PROFILES' as issue_type, phone_number, COUNT(*) as count
FROM profiles 
GROUP BY phone_number 
HAVING COUNT(*) > 1
UNION ALL
SELECT 'DUPLICATE USER_IDS IN USERS' as issue_type, id, COUNT(*) as count
FROM users 
GROUP BY id 
HAVING COUNT(*) > 1;

-- Step 2: Clean up duplicate profiles (keep the most recent one)
WITH duplicate_user_ids AS (
  SELECT user_id, COUNT(*) as count
  FROM profiles 
  GROUP BY user_id 
  HAVING COUNT(*) > 1
),
profiles_to_delete AS (
  SELECT p.id
  FROM profiles p
  INNER JOIN duplicate_user_ids d ON p.user_id = d.user_id
  WHERE p.id NOT IN (
    -- Keep the most recent profile for each user_id
    SELECT DISTINCT ON (user_id) id
    FROM profiles
    WHERE user_id IN (SELECT user_id FROM duplicate_user_ids)
    ORDER BY user_id, created_at DESC
  )
)
DELETE FROM profiles 
WHERE id IN (SELECT id FROM profiles_to_delete);

-- Step 3: Clean up duplicate phone number profiles (keep the most recent one)
WITH duplicate_phones AS (
  SELECT phone_number, COUNT(*) as count
  FROM profiles 
  GROUP BY phone_number 
  HAVING COUNT(*) > 1
),
phone_profiles_to_delete AS (
  SELECT p.id
  FROM profiles p
  INNER JOIN duplicate_phones d ON p.phone_number = d.phone_number
  WHERE p.id NOT IN (
    -- Keep the most recent profile for each phone number
    SELECT DISTINCT ON (phone_number) id
    FROM profiles
    WHERE phone_number IN (SELECT phone_number FROM duplicate_phones)
    ORDER BY phone_number, created_at DESC
  )
)
DELETE FROM profiles 
WHERE id IN (SELECT id FROM phone_profiles_to_delete);

-- Step 4: Clean up duplicate users table entries
WITH duplicate_users AS (
  SELECT id, COUNT(*) as count
  FROM users 
  GROUP BY id 
  HAVING COUNT(*) > 1
),
users_to_delete AS (
  SELECT u.id, u.created_at
  FROM users u
  INNER JOIN duplicate_users d ON u.id = d.id
  WHERE (u.id, u.created_at) NOT IN (
    -- Keep the most recent user for each id
    SELECT DISTINCT ON (id) id, created_at
    FROM users
    WHERE id IN (SELECT id FROM duplicate_users)
    ORDER BY id, created_at DESC
  )
)
DELETE FROM users 
WHERE (id, created_at) IN (SELECT id, created_at FROM users_to_delete);

-- Step 5: Fix any orphaned profiles (profiles without corresponding users)
INSERT INTO users (id, phone_number, is_host, host_since, total_places_added, host_rating)
SELECT DISTINCT 
  p.user_id,
  p.phone_number,
  false,
  NULL::timestamp with time zone,
  0,
  0.0
FROM profiles p
LEFT JOIN users u ON p.user_id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 6: Sync phone numbers from profiles to users
UPDATE users 
SET phone_number = p.phone_number
FROM profiles p
WHERE users.id = p.user_id 
AND (users.phone_number IS NULL OR users.phone_number != p.phone_number);

-- Step 7: Verify cleanup results
SELECT 'REMAINING DUPLICATE USER_IDS IN PROFILES' as check_type, user_id, COUNT(*) as count
FROM profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1
UNION ALL
SELECT 'REMAINING DUPLICATE PHONE_NUMBERS IN PROFILES' as check_type, phone_number, COUNT(*) as count
FROM profiles 
GROUP BY phone_number 
HAVING COUNT(*) > 1
UNION ALL
SELECT 'REMAINING DUPLICATE USER_IDS IN USERS' as check_type, id, COUNT(*) as count
FROM users 
GROUP BY id 
HAVING COUNT(*) > 1
UNION ALL
SELECT 'ORPHANED PROFILES (NO USER RECORD)' as check_type, p.user_id, 1 as count
FROM profiles p
LEFT JOIN users u ON p.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 'TOTAL PROFILES' as check_type, 'count', COUNT(*)::text::int as count
FROM profiles
UNION ALL
SELECT 'TOTAL USERS' as check_type, 'count', COUNT(*)::text::int as count
FROM users;

-- Step 8: Show sample of cleaned data
SELECT 'SAMPLE PROFILES' as data_type, user_id, phone_number, created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;