-- Simple script to check phone number data without complex unions

-- 1. Check users table for phone 8655102089
SELECT 
  'USERS TABLE' as source,
  id,
  phone_number,
  name,
  is_host,
  created_at
FROM users 
WHERE phone_number LIKE '%8655102089%'
ORDER BY created_at DESC;

-- 2. Check profiles table for phone 8655102089
SELECT 
  'PROFILES TABLE' as source,
  user_id as id,
  phone_number,
  full_name as name,
  is_active,
  created_at
FROM profiles 
WHERE phone_number LIKE '%8655102089%'
ORDER BY created_at DESC;

-- 3. Check places owned by users with this phone number
SELECT 
  'PLACES TABLE' as source,
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

-- 4. Check all backup phone numbers
SELECT 
  'BACKUP PHONE NUMBERS' as source,
  id,
  phone_number,
  name,
  created_at
FROM users 
WHERE phone_number LIKE '%_backup'
ORDER BY phone_number;

-- 5. Check for duplicate phone numbers
SELECT 
  'DUPLICATE PHONE CHECK' as source,
  phone_number,
  COUNT(*) as count,
  array_agg(id) as user_ids
FROM users 
WHERE phone_number IS NOT NULL
GROUP BY phone_number
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 6. Simple fix for backup phone numbers
-- UNCOMMENT TO EXECUTE:
/*
UPDATE users 
SET phone_number = REPLACE(phone_number, '_backup', ''),
    updated_at = NOW()
WHERE phone_number LIKE '%_backup';
*/

-- 7. Verify after fix
SELECT 
  'AFTER FIX - PHONE ASSIGNMENTS' as source,
  id,
  phone_number,
  name,
  is_host,
  created_at
FROM users 
WHERE phone_number IS NOT NULL
ORDER BY phone_number;