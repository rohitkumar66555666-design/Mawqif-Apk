-- Fix duplicate phone numbers in users table
-- This script resolves the unique constraint violation error

-- 1. First, let's see what duplicate phone numbers exist
SELECT 
  phone_number,
  COUNT(*) as count,
  array_agg(id) as user_ids,
  array_agg(created_at) as created_dates
FROM users 
WHERE phone_number IS NOT NULL
GROUP BY phone_number
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. For each duplicate phone number, keep the most recent user and clear others
-- This will be done in steps to avoid conflicts

-- Step 1: Identify duplicates and mark older ones for cleanup
WITH duplicate_phones AS (
  SELECT 
    phone_number,
    id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY phone_number ORDER BY created_at DESC) as rn
  FROM users 
  WHERE phone_number IS NOT NULL
),
older_duplicates AS (
  SELECT id, phone_number
  FROM duplicate_phones 
  WHERE rn > 1
)
SELECT 
  'Will clear phone number from these users:' as action,
  id,
  phone_number,
  created_at
FROM users 
WHERE id IN (SELECT id FROM older_duplicates)
ORDER BY phone_number, created_at;

-- Step 2: Clear phone numbers from older duplicate users
-- UNCOMMENT AND RUN THIS AFTER REVIEWING THE ABOVE RESULTS
/*
WITH duplicate_phones AS (
  SELECT 
    phone_number,
    id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY phone_number ORDER BY created_at DESC) as rn
  FROM users 
  WHERE phone_number IS NOT NULL
),
older_duplicates AS (
  SELECT id
  FROM duplicate_phones 
  WHERE rn > 1
)
UPDATE users 
SET phone_number = NULL,
    updated_at = NOW()
WHERE id IN (SELECT id FROM older_duplicates);
*/

-- Step 3: Verify the fix worked
SELECT 
  'After cleanup - should show no duplicates:' as status,
  phone_number,
  COUNT(*) as count
FROM users 
WHERE phone_number IS NOT NULL
GROUP BY phone_number
HAVING COUNT(*) > 1;

-- Step 4: Show current phone number assignments
SELECT 
  id,
  phone_number,
  name,
  is_host,
  created_at,
  updated_at
FROM users 
WHERE phone_number IS NOT NULL
ORDER BY phone_number, created_at DESC;

-- Step 5: Check profiles table for consistency
SELECT 
  'Profile to User phone number consistency check:' as check_status,
  p.phone_number as profile_phone,
  u.phone_number as user_phone,
  p.user_id,
  CASE 
    WHEN p.phone_number = u.phone_number THEN 'MATCH'
    WHEN u.phone_number IS NULL THEN 'USER_MISSING_PHONE'
    ELSE 'MISMATCH'
  END as consistency_status
FROM profiles p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.phone_number IS NOT NULL
ORDER BY consistency_status, p.phone_number;

-- Step 6: Fix any profile-user phone number mismatches
-- UNCOMMENT AND RUN THIS IF THERE ARE MISMATCHES
/*
UPDATE users 
SET phone_number = profiles.phone_number,
    updated_at = NOW()
FROM profiles 
WHERE users.id = profiles.user_id 
  AND users.phone_number IS NULL 
  AND profiles.phone_number IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u2 
    WHERE u2.phone_number = profiles.phone_number 
    AND u2.id != users.id
  );
*/

-- Final verification
SELECT 
  'Final verification - all should be unique:' as check_result,
  phone_number,
  COUNT(*) as count
FROM users 
WHERE phone_number IS NOT NULL
GROUP BY phone_number
ORDER BY phone_number;