-- Fix Specific User Phone Number Issue
-- Handle the case where mock_user_1766668547393 has NULL phone but the phone exists elsewhere

-- 1. Check the current situation for the specific user
SELECT 
  'SPECIFIC USER ANALYSIS' as status,
  u.id,
  u.phone_number as user_phone,
  p.phone_number as profile_phone,
  u.is_host,
  u.host_since,
  u.created_at as user_created
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id = 'mock_user_1766668547393';

-- 2. Check if this phone number exists elsewhere
SELECT 
  'PHONE NUMBER CONFLICT CHECK' as status,
  u.id,
  u.phone_number,
  u.is_host,
  u.created_at,
  'This user already has the phone number' as note
FROM users u
WHERE u.phone_number = '+918655102089';

-- 3. Check the profile for this user
SELECT 
  'PROFILE CHECK' as status,
  p.user_id,
  p.phone_number,
  p.first_name,
  p.last_name,
  p.created_at
FROM profiles p
WHERE p.user_id = 'mock_user_1766668547393';

-- 4. Solution Options:

-- Option A: If the phone number belongs to a different user, 
-- we might need to assign a different phone or handle the conflict

-- Option B: If this is the correct user for this phone number,
-- we might need to update the other user's phone to NULL first

-- Let's see which user was created first (should keep the phone number)
SELECT 
  'PRIORITY ANALYSIS' as status,
  u.id,
  u.phone_number,
  u.created_at,
  u.is_host,
  ROW_NUMBER() OVER (ORDER BY u.created_at ASC) as creation_order,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY u.created_at ASC) = 1 THEN 'SHOULD_KEEP_PHONE'
    ELSE 'SHOULD_GET_NULL_OR_DIFFERENT_PHONE'
  END as recommendation
FROM users u
WHERE u.phone_number = '+918655102089' 
   OR u.id = 'mock_user_1766668547393';

-- 5. Safe fix: Clear the phone number from the newer user and assign to the correct one
-- (Only run this if the analysis above shows it's safe)

/*
-- Step 1: Clear phone from the user who shouldn't have it
UPDATE users 
SET phone_number = NULL 
WHERE phone_number = '+918655102089' 
  AND id != 'mock_user_1766668547393'
  AND created_at > (
    SELECT created_at FROM users WHERE id = 'mock_user_1766668547393'
  );

-- Step 2: Assign phone to the correct user
UPDATE users 
SET phone_number = '+918655102089'
WHERE id = 'mock_user_1766668547393';
*/

-- 6. Alternative: Just assign a unique phone number to avoid conflicts
-- UPDATE users 
-- SET phone_number = '+918655102089_' || id
-- WHERE id = 'mock_user_1766668547393';

-- 7. Verification query (run after applying fix)
SELECT 
  'VERIFICATION' as status,
  u.id,
  u.phone_number,
  u.is_host,
  u.created_at,
  p.phone_number as profile_phone
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.id = 'mock_user_1766668547393' 
   OR u.phone_number LIKE '+918655102089%'
ORDER BY u.created_at;