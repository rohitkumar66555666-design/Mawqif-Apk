-- Quick Fix for NULL Phone Number - Avoid Constraint Violation
-- This assigns a unique phone number to the user with NULL phone

-- 1. Check current situation
SELECT 
  id,
  phone_number,
  is_host,
  host_since
FROM users 
WHERE id = 'mock_user_1766668547393' OR phone_number = '+918655102089';

-- 2. Simple fix: Assign a unique phone number to avoid constraint violation
UPDATE users 
SET phone_number = '+918655102089_backup'
WHERE id = 'mock_user_1766668547393' 
  AND phone_number IS NULL;

-- 3. Verify the fix
SELECT 
  'AFTER FIX' as status,
  id,
  phone_number,
  is_host,
  host_since
FROM users 
WHERE id = 'mock_user_1766668547393' OR phone_number LIKE '+918655102089%'
ORDER BY phone_number;