-- Restore phone number data without backups
-- This script fixes the backup phone numbers and restores proper data structure

-- 1. Check current state - see what backup phone numbers exist
SELECT 
  id,
  phone_number,
  name,
  created_at,
  CASE 
    WHEN phone_number LIKE '%_backup' THEN 'BACKUP PHONE'
    WHEN phone_number IS NULL THEN 'NO PHONE'
    ELSE 'NORMAL PHONE'
  END as phone_status
FROM users 
ORDER BY phone_number;

-- 2. Check profiles table for the same phone numbers
SELECT 
  p.id as profile_id,
  p.user_id,
  p.phone_number,
  p.full_name,
  u.phone_number as user_phone_number,
  CASE 
    WHEN p.phone_number = u.phone_number THEN 'MATCH'
    WHEN u.phone_number IS NULL THEN 'USER_NO_PHONE'
    WHEN u.phone_number LIKE '%_backup' THEN 'USER_HAS_BACKUP'
    ELSE 'MISMATCH'
  END as status
FROM profiles p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.phone_number IS NOT NULL
ORDER BY p.phone_number;

-- 3. For phone number 8655102089 specifically - check all related data
SELECT 
  'Phone 8655102089 - Users table:' as info,
  id,
  phone_number,
  name,
  is_host::text,
  created_at::text
FROM users 
WHERE phone_number LIKE '%8655102089%'

UNION ALL

SELECT 
  'Phone 8655102089 - Profiles table:' as info,
  user_id as id,
  phone_number,
  full_name as name,
  is_active::text,
  created_at::text
FROM profiles 
WHERE phone_number LIKE '%8655102089%'

ORDER BY info, created_at DESC;

-- 4. Check places owned by users with this phone number
SELECT 
  'Places for phone 8655102089:' as info,
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  pr.phone_number,
  pr.full_name as owner_name
FROM places p
JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number LIKE '%8655102089%'
ORDER BY p.created_at DESC;

-- 5. RESTORE PROPER PHONE NUMBERS (Remove _backup suffix)
-- UNCOMMENT AND RUN THIS AFTER REVIEWING ABOVE RESULTS

/*
-- Step 5a: Update backup phone numbers to remove _backup suffix
UPDATE users 
SET phone_number = REPLACE(phone_number, '_backup', ''),
    updated_at = NOW()
WHERE phone_number LIKE '%_backup';

-- Step 5b: For phone number 8655102089, ensure there's only one active user
-- Keep the user with the most recent activity or the one with places
WITH phone_users AS (
  SELECT 
    u.id,
    u.phone_number,
    u.created_at,
    COUNT(p.id) as place_count,
    MAX(pr.last_login_at) as last_login
  FROM users u
  LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
  LEFT JOIN profiles pr ON u.id = pr.user_id
  WHERE u.phone_number = '+918655102089'
  GROUP BY u.id, u.phone_number, u.created_at
),
primary_user AS (
  SELECT id
  FROM phone_users
  ORDER BY place_count DESC, last_login DESC NULLS LAST, created_at DESC
  LIMIT 1
)
-- Clear phone number from non-primary users (but keep their data)
UPDATE users 
SET phone_number = NULL,
    updated_at = NOW()
WHERE phone_number = '+918655102089'
  AND id NOT IN (SELECT id FROM primary_user);
*/

-- 6. Verify the restoration worked
SELECT 
  'After restoration - phone number assignments:' as status,
  id,
  phone_number,
  name,
  is_host,
  created_at
FROM users 
WHERE phone_number IS NOT NULL
ORDER BY phone_number;

-- 7. Check that places are still properly linked
SELECT 
  'After restoration - places ownership:' as status,
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  u.phone_number,
  pr.full_name as owner_name
FROM places p
JOIN users u ON p.owner_id = u.id
LEFT JOIN profiles pr ON u.id = pr.user_id
WHERE u.phone_number IS NOT NULL
ORDER BY u.phone_number, p.created_at DESC;