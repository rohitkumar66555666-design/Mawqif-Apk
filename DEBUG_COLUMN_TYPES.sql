-- ============================================
-- DEBUG COLUMN TYPES
-- Check if the SQL fixes actually worked
-- ============================================

-- 1. Check the actual data type of users.id column
SELECT 
  'users.id column type' as info,
  data_type as current_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'id';

-- 2. Check if the mock user exists in the users table
SELECT 
  'Mock user exists?' as info,
  COUNT(*) as count,
  'records found' as status
FROM users 
WHERE id = 'mock_user_1766668547393';

-- 3. Try to insert the mock user (this will tell us if TEXT IDs work)
INSERT INTO users (
  id, 
  phone_number, 
  name, 
  display_name, 
  is_verified
) VALUES (
  'mock_user_1766668547393',
  '+1234567890',
  'Test User',
  'Test User',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- 4. Verify the insert worked
SELECT 
  'Insert verification' as info,
  id,
  name,
  phone_number
FROM users 
WHERE id = 'mock_user_1766668547393';

-- 5. Test a simple query that your app would run
SELECT 
  'App query test' as info,
  id,
  is_host,
  total_places_added
FROM users 
WHERE id = 'mock_user_1766668547393';