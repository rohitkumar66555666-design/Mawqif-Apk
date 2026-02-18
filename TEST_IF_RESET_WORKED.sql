-- ============================================
-- TEST IF DATABASE RESET WORKED
-- Check if we can use the mock user ID now
-- ============================================

-- 1. Check if users table exists and what type the id column is
SELECT 
  'users.id column type' as test,
  data_type as result
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'id';

-- 2. Try to query the mock user (this should work if reset worked)
SELECT 
  'Mock user query test' as test,
  id,
  name,
  is_host
FROM users 
WHERE id = 'mock_user_1766668547393';

-- 3. Count total users
SELECT 
  'Total users' as test,
  COUNT(*) as result
FROM users;