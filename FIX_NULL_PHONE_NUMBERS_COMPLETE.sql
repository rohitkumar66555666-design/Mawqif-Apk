-- Complete Fix for NULL Phone Numbers in Users Table
-- This script identifies and fixes users with NULL phone numbers

-- 1. Identify the problem - users with NULL phone numbers
SELECT 
  'BEFORE FIX' as status,
  u.id,
  u.phone_number as user_phone,
  p.phone_number as profile_phone,
  u.is_host,
  u.host_since,
  CASE 
    WHEN u.phone_number IS NULL AND p.phone_number IS NOT NULL THEN 'NEEDS_SYNC'
    WHEN u.phone_number IS NULL AND p.phone_number IS NULL THEN 'NO_PHONE_ANYWHERE'
    WHEN u.phone_number IS NOT NULL THEN 'HAS_PHONE'
    ELSE 'UNKNOWN'
  END as issue_type
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.phone_number IS NULL
ORDER BY u.host_since DESC;

-- 2. Fix: Sync phone numbers from profiles to users table
UPDATE users 
SET phone_number = profiles.phone_number
FROM profiles 
WHERE users.id = profiles.user_id 
  AND users.phone_number IS NULL 
  AND profiles.phone_number IS NOT NULL;

-- 3. Verify the fix worked
SELECT 
  'AFTER FIX' as status,
  u.id,
  u.phone_number as user_phone,
  p.phone_number as profile_phone,
  u.is_host,
  u.host_since,
  CASE 
    WHEN u.phone_number = p.phone_number THEN 'SYNCED_OK'
    WHEN u.phone_number IS NULL AND p.phone_number IS NOT NULL THEN 'STILL_NEEDS_SYNC'
    WHEN u.phone_number IS NULL AND p.phone_number IS NULL THEN 'NO_PHONE_ANYWHERE'
    WHEN u.phone_number IS NOT NULL AND p.phone_number IS NULL THEN 'USER_ONLY'
    ELSE 'MISMATCH'
  END as sync_status
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.host_since DESC;

-- 4. Check the specific user that was showing NULL
SELECT 
  'SPECIFIC USER CHECK' as status,
  u.id,
  u.phone_number,
  u.is_host,
  u.host_since,
  u.total_places_added,
  p.first_name,
  p.last_name,
  p.phone_number as profile_phone,
  p.created_at as profile_created
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id = 'mock_user_1766668547393';

-- 5. Summary report
SELECT 
  'SUMMARY' as report_type,
  COUNT(*) as total_users,
  COUNT(CASE WHEN u.phone_number IS NOT NULL THEN 1 END) as users_with_phone,
  COUNT(CASE WHEN u.phone_number IS NULL THEN 1 END) as users_without_phone,
  COUNT(CASE WHEN u.is_host = true THEN 1 END) as total_hosts,
  COUNT(CASE WHEN u.is_host = true AND u.phone_number IS NOT NULL THEN 1 END) as hosts_with_phone
FROM users u;