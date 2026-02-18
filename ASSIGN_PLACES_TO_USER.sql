-- ============================================
-- ASSIGN ALL PLACES TO MOCK USER
-- Fix the owner_id and is_active for existing places
-- ============================================

-- First, show what we have before the fix
SELECT 'BEFORE FIX' as status;

SELECT 
  'Current places' as info,
  id,
  title,
  owner_id,
  is_active
FROM places 
ORDER BY created_at DESC;

-- Update ALL places to belong to the mock user and be active
UPDATE places 
SET 
  owner_id = 'mock_user_1766668547393',
  is_active = COALESCE(is_active, true)  -- Set to true if NULL
WHERE owner_id IS NULL OR owner_id != 'mock_user_1766668547393';

-- Update the user's statistics
UPDATE users 
SET 
  total_places_added = (SELECT COUNT(*) FROM places WHERE owner_id = 'mock_user_1766668547393'),
  is_host = true,
  host_since = COALESCE(host_since, NOW())
WHERE id = 'mock_user_1766668547393';

-- Show what we have after the fix
SELECT 'AFTER FIX' as status;

SELECT 
  'Updated places' as info,
  id,
  title,
  owner_id,
  is_active
FROM places 
ORDER BY created_at DESC;

-- Show updated user stats
SELECT 
  'Updated user stats' as info,
  id,
  name,
  is_host,
  total_places_added,
  host_since
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Test the dashboard queries
SELECT 
  'Dashboard query test' as info,
  COUNT(*) as places_count
FROM places 
WHERE owner_id = 'mock_user_1766668547393' 
  AND is_active = true;

SELECT 'SUCCESS! Your places should now show in the dashboard!' as final_message;