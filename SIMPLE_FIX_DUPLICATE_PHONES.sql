-- Simple script to fix duplicate phone numbers in users table
-- Run each section step by step

-- 1. Check for duplicate phone numbers
SELECT 
  phone_number,
  COUNT(*) as duplicate_count,
  array_agg(id ORDER BY created_at DESC) as user_ids
FROM users 
WHERE phone_number IS NOT NULL
GROUP BY phone_number
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. If duplicates exist, this will show which users will be affected
WITH ranked_users AS (
  SELECT 
    id,
    phone_number,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY phone_number ORDER BY created_at DESC) as rank
  FROM users 
  WHERE phone_number IS NOT NULL
)
SELECT 
  phone_number,
  id,
  created_at,
  CASE 
    WHEN rank = 1 THEN 'KEEP (Most Recent)'
    ELSE 'CLEAR PHONE NUMBER'
  END as action
FROM ranked_users
WHERE phone_number IN (
  SELECT phone_number 
  FROM users 
  WHERE phone_number IS NOT NULL
  GROUP BY phone_number 
  HAVING COUNT(*) > 1
)
ORDER BY phone_number, rank;

-- 3. EXECUTE THIS TO FIX DUPLICATES
-- This keeps the most recent user for each phone number and clears others
WITH ranked_users AS (
  SELECT 
    id,
    phone_number,
    ROW_NUMBER() OVER (PARTITION BY phone_number ORDER BY created_at DESC) as rank
  FROM users 
  WHERE phone_number IS NOT NULL
)
UPDATE users 
SET phone_number = NULL,
    updated_at = NOW()
WHERE id IN (
  SELECT id 
  FROM ranked_users 
  WHERE rank > 1
);

-- 4. Verify fix worked - should return no rows
SELECT 
  phone_number,
  COUNT(*) as count
FROM users 
WHERE phone_number IS NOT NULL
GROUP BY phone_number
HAVING COUNT(*) > 1;

-- 5. Show final phone number assignments
SELECT 
  id,
  phone_number,
  name,
  created_at,
  updated_at
FROM users 
WHERE phone_number IS NOT NULL
ORDER BY phone_number;