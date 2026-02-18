-- ============================================
-- SIMPLE TEST - What should the dashboard show?
-- ============================================

-- Test 1: Does the user exist?
SELECT 'User Test' as test, COUNT(*) as result FROM users WHERE id = 'mock_user_1766668547393';

-- Test 2: How many places exist total?
SELECT 'Total Places' as test, COUNT(*) as result FROM places;

-- Test 3: How many places have owner_id set?
SELECT 'Places with Owner' as test, COUNT(*) as result FROM places WHERE owner_id IS NOT NULL;

-- Test 4: How many places belong to mock user?
SELECT 'Mock User Places' as test, COUNT(*) as result FROM places WHERE owner_id = 'mock_user_1766668547393';

-- Test 5: How many ACTIVE places belong to mock user?
SELECT 'Mock User Active Places' as test, COUNT(*) as result FROM places WHERE owner_id = 'mock_user_1766668547393' AND is_active = true;

-- Test 6: Show the actual places
SELECT 
  title,
  owner_id,
  is_active,
  created_at
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;