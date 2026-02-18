-- ============================================
-- DEBUG ADDED PLACES
-- Check if places were added and what owner_id they have
-- ============================================

-- 1. Show all places in the database
SELECT 
  'All Places' as info,
  id,
  title,
  owner_id,
  city,
  created_at
FROM places 
ORDER BY created_at DESC;

-- 2. Show all users
SELECT 
  'All Users' as info,
  id,
  name,
  phone_number,
  is_host,
  total_places_added
FROM users;

-- 3. Check if any places have NULL owner_id
SELECT 
  'Places with NULL owner_id' as info,
  COUNT(*) as count
FROM places 
WHERE owner_id IS NULL;

-- 4. Check if any places have the mock user as owner
SELECT 
  'Places owned by mock user' as info,
  COUNT(*) as count
FROM places 
WHERE owner_id = 'mock_user_1766668547393';

-- 5. Show places that don't match any user
SELECT 
  'Orphaned Places' as info,
  p.id,
  p.title,
  p.owner_id,
  'No matching user' as issue
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE u.id IS NULL;