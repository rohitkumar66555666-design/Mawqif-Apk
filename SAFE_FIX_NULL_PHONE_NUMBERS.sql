-- Safe Fix for NULL Phone Numbers - Handles Duplicates
-- This script safely fixes NULL phone numbers without violating unique constraints

-- 1. First, let's see what we're dealing with
SELECT 
  'CURRENT SITUATION' as status,
  u.id,
  u.phone_number as user_phone,
  p.phone_number as profile_phone,
  u.is_host,
  u.host_since
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.phone_number NULLS LAST, u.host_since DESC;

-- 2. Check for potential duplicate phone numbers before fixing
SELECT 
  'DUPLICATE CHECK' as status,
  p.phone_number,
  COUNT(*) as profile_count,
  STRING_AGG(u.id, ', ') as user_ids_with_this_phone
FROM profiles p
LEFT JOIN users u ON p.phone_number = u.phone_number
WHERE p.phone_number IS NOT NULL
GROUP BY p.phone_number
HAVING COUNT(u.id) > 0;

-- 3. Safe approach: Only update users where the phone number doesn't already exist
UPDATE users 
SET phone_number = profiles.phone_number
FROM profiles 
WHERE users.id = profiles.user_id 
  AND users.phone_number IS NULL 
  AND profiles.phone_number IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u2 
    WHERE u2.phone_number = profiles.phone_number 
    AND u2.id != users.id
  );

-- 4. For users that couldn't be updated due to duplicates, let's see what happened
SELECT 
  'REMAINING NULL PHONES' as status,
  u.id,
  u.phone_number as user_phone,
  p.phone_number as profile_phone,
  u.is_host,
  'Phone already exists in users table' as reason
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.phone_number IS NULL 
  AND p.phone_number IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM users u2 
    WHERE u2.phone_number = p.phone_number 
    AND u2.id != u.id
  );

-- 5. Alternative approach for duplicates: Use a different strategy
-- For users with duplicate phone numbers, we might need to merge or handle differently
-- Let's identify which user should keep the phone number (usually the older one)

SELECT 
  'DUPLICATE RESOLUTION STRATEGY' as status,
  phone_number,
  user_id,
  profile_created,
  user_created,
  is_host,
  ROW_NUMBER() OVER (PARTITION BY phone_number ORDER BY user_created ASC) as priority
FROM (
  SELECT 
    p.phone_number,
    u.id as user_id,
    p.created_at as profile_created,
    u.created_at as user_created,
    u.is_host
  FROM users u
  JOIN profiles p ON u.id = p.user_id
  WHERE p.phone_number IN (
    SELECT p2.phone_number 
    FROM profiles p2
    GROUP BY p2.phone_number 
    HAVING COUNT(*) > 1
  )
) duplicates
ORDER BY phone_number, priority;

-- 6. Final verification
SELECT 
  'FINAL STATUS' as status,
  COUNT(*) as total_users,
  COUNT(CASE WHEN u.phone_number IS NOT NULL THEN 1 END) as users_with_phone,
  COUNT(CASE WHEN u.phone_number IS NULL THEN 1 END) as users_without_phone,
  COUNT(CASE WHEN u.is_host = true THEN 1 END) as total_hosts,
  COUNT(CASE WHEN u.is_host = true AND u.phone_number IS NOT NULL THEN 1 END) as hosts_with_phone
FROM users u;