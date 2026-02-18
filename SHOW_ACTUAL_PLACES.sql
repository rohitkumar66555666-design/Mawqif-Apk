-- ============================================
-- SHOW ACTUAL PLACES DATA
-- Let's see what's actually in the places table
-- ============================================

-- Show ALL places with their exact data
SELECT 
  'All Places Details' as info,
  id,
  title,
  owner_id,
  is_active,
  created_at
FROM places 
ORDER BY created_at DESC;

-- Show what owner_id values exist
SELECT 
  'Owner ID Values' as info,
  owner_id,
  COUNT(*) as count
FROM places 
GROUP BY owner_id;

-- Show is_active values
SELECT 
  'Active Status' as info,
  is_active,
  COUNT(*) as count
FROM places 
GROUP BY is_active;

-- Show the mock user details
SELECT 
  'Mock User Details' as info,
  id,
  name,
  total_places_added
FROM users 
WHERE id = 'mock_user_1766668547393';