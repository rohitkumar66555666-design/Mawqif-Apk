-- Immediate Host Status Fix - Make Current User a Host
-- Run this to immediately fix the missing host features

-- 1. Check current user status
SELECT 
  'CURRENT STATUS' as check_type,
  u.id,
  u.phone_number,
  u.is_host,
  u.host_since,
  u.total_places_added,
  COUNT(p.id) as actual_places_count
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
WHERE u.phone_number LIKE '+91865510%' -- Your phone number pattern
GROUP BY u.id, u.phone_number, u.is_host, u.host_since, u.total_places_added;

-- 2. Check if user has places but isn't marked as host
SELECT 
  'PLACES CHECK' as check_type,
  p.id,
  p.title,
  p.owner_id,
  p.is_active,
  u.is_host,
  'User has places but not marked as host' as issue
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.is_active = true 
  AND u.is_host = false
  AND u.phone_number LIKE '+91865510%';

-- 3. IMMEDIATE FIX: Make the user a host if they have places
UPDATE users 
SET 
  is_host = true,
  host_since = COALESCE(host_since, NOW()),
  total_places_added = (
    SELECT COUNT(*) 
    FROM places 
    WHERE owner_id = users.id AND is_active = true
  )
WHERE phone_number LIKE '+91865510%'
  AND EXISTS (
    SELECT 1 FROM places 
    WHERE owner_id = users.id AND is_active = true
  );

-- 4. Alternative: Force make user a host even without places (for testing)
-- Uncomment this if you want to see host features even without places
/*
UPDATE users 
SET 
  is_host = true,
  host_since = COALESCE(host_since, NOW()),
  total_places_added = COALESCE(total_places_added, 0)
WHERE phone_number LIKE '+91865510%';
*/

-- 5. Verify the fix
SELECT 
  'AFTER FIX' as check_type,
  u.id,
  u.phone_number,
  u.is_host,
  u.host_since,
  u.total_places_added,
  COUNT(p.id) as actual_places_count,
  CASE 
    WHEN u.is_host = true THEN 'HOST FEATURES SHOULD BE VISIBLE'
    ELSE 'HOST FEATURES WILL BE HIDDEN'
  END as dashboard_status
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
WHERE u.phone_number LIKE '+91865510%'
GROUP BY u.id, u.phone_number, u.is_host, u.host_since, u.total_places_added;