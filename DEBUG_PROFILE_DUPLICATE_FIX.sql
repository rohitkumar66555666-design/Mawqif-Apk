-- Debug Profile Duplicate Phone Number Issue
-- Run this to check the current state of profiles table

-- 1. Check for duplicate phone numbers
SELECT 
  phone_number, 
  COUNT(*) as count,
  STRING_AGG(user_id, ', ') as user_ids,
  STRING_AGG(created_at::text, ', ') as created_dates
FROM profiles 
WHERE is_active = true
GROUP BY phone_number 
HAVING COUNT(*) > 1;

-- 2. Check all profiles
SELECT 
  id,
  user_id,
  phone_number,
  first_name,
  last_name,
  full_name,
  is_active,
  created_at,
  last_login_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check the unique constraint on phone_number
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
  AND contype = 'u';

-- 4. If you need to clean up duplicates (CAREFUL - backup first!)
-- Uncomment the following lines only if you have duplicates and want to keep the most recent one:

/*
-- Delete older duplicate profiles, keeping the most recent one for each phone number
DELETE FROM profiles p1
WHERE p1.id NOT IN (
  SELECT DISTINCT ON (phone_number) id
  FROM profiles p2
  WHERE p2.is_active = true
  ORDER BY phone_number, created_at DESC
);
*/

-- 5. Test the new getOrCreateProfile logic by checking what would happen
-- Replace '+1234567890' with the actual phone number having issues
/*
SELECT 
  'Existing profile found' as action,
  user_id,
  phone_number,
  first_name,
  created_at
FROM profiles 
WHERE phone_number = '+918655102089' 
  AND is_active = true;
*/