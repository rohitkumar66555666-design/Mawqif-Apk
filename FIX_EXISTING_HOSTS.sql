-- Fix Existing Users Who Should Be Hosts
-- This script updates users who have places but are not marked as hosts

-- 1. Check current situation - users with places but not marked as hosts
SELECT 
  u.id,
  u.phone_number,
  u.is_host,
  u.host_since,
  COUNT(p.id) as place_count
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
GROUP BY u.id, u.phone_number, u.is_host, u.host_since
HAVING COUNT(p.id) > 0 AND u.is_host = false;

-- 2. Update users who have places to be hosts
UPDATE users 
SET 
  is_host = true,
  host_since = COALESCE(host_since, NOW()),
  total_places_added = (
    SELECT COUNT(*) 
    FROM places 
    WHERE owner_id = users.id AND is_active = true
  )
WHERE id IN (
  SELECT DISTINCT p.owner_id
  FROM places p
  WHERE p.is_active = true
    AND p.owner_id IS NOT NULL
) AND is_host = false;

-- 3. Verify the fix - check updated users
SELECT 
  u.id,
  u.phone_number,
  u.is_host,
  u.host_since,
  u.total_places_added,
  COUNT(p.id) as actual_place_count
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
WHERE u.is_host = true
GROUP BY u.id, u.phone_number, u.is_host, u.host_since, u.total_places_added
ORDER BY u.host_since DESC;