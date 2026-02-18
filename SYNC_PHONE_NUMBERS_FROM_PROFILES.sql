-- Sync Phone Numbers from Profiles to Users Table
-- This fixes NULL phone numbers in users table by syncing from profiles

-- 1. Check current situation - users with NULL phone numbers
SELECT 
  u.id,
  u.phone_number as user_phone,
  p.phone_number as profile_phone,
  u.is_host,
  u.host_since
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.phone_number IS NULL
ORDER BY u.host_since DESC;

-- 2. Update users table with phone numbers from profiles
UPDATE users 
SET phone_number = profiles.phone_number
FROM profiles 
WHERE users.id = profiles.user_id 
  AND users.phone_number IS NULL 
  AND profiles.phone_number IS NOT NULL;

-- 3. Verify the fix - check that phone numbers are now synced
SELECT 
  u.id,
  u.phone_number as user_phone,
  p.phone_number as profile_phone,
  u.is_host,
  u.host_since,
  CASE 
    WHEN u.phone_number = p.phone_number THEN 'SYNCED'
    WHEN u.phone_number IS NULL AND p.phone_number IS NOT NULL THEN 'NEEDS_SYNC'
    WHEN u.phone_number IS NOT NULL AND p.phone_number IS NULL THEN 'USER_ONLY'
    ELSE 'MISMATCH'
  END as sync_status
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.host_since DESC;

-- 4. Check specific user that had NULL phone number
SELECT 
  u.id,
  u.phone_number,
  u.is_host,
  u.host_since,
  p.first_name,
  p.last_name,
  p.phone_number as profile_phone
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id = 'mock_user_1766668547393';