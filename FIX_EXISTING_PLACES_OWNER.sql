-- ============================================
-- FIX EXISTING PLACES OWNER
-- Set owner_id for places that don't have one
-- ============================================

-- First, let's see what we have
SELECT 
  'Current situation' as info,
  COUNT(*) as total_places,
  COUNT(owner_id) as places_with_owner,
  COUNT(*) - COUNT(owner_id) as places_without_owner
FROM places;

-- Update all places without owner_id to belong to the mock user
UPDATE places 
SET owner_id = 'mock_user_1766668547393'
WHERE owner_id IS NULL;

-- Update the user's total_places_added count
UPDATE users 
SET 
  total_places_added = (SELECT COUNT(*) FROM places WHERE owner_id = 'mock_user_1766668547393'),
  is_host = TRUE,
  host_since = COALESCE(host_since, NOW())
WHERE id = 'mock_user_1766668547393';

-- Show the results
SELECT 
  'After fix' as info,
  COUNT(*) as total_places,
  COUNT(owner_id) as places_with_owner,
  COUNT(*) - COUNT(owner_id) as places_without_owner
FROM places;

-- Show user's updated stats
SELECT 
  'User stats' as info,
  id,
  name,
  is_host,
  total_places_added,
  host_since
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Show all places with their owner
SELECT 
  'All places with owner' as info,
  id,
  title,
  owner_id,
  city,
  created_at
FROM places 
ORDER BY created_at DESC;

SELECT 'Existing places now have owner_id! Check your dashboard.' as status;