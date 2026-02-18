-- Force Fix Dashboard Host Status
-- This will ensure your user is properly marked as a host so dashboard features show

-- 1. First, let's see current status
SELECT 
  'BEFORE UPDATE' as status,
  u.id,
  u.phone_number,
  u.is_host,
  COUNT(p.id) as places_count
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
WHERE u.phone_number = '+918655102089'
GROUP BY u.id, u.phone_number, u.is_host;

-- 2. Force update user to be host if they have any places
UPDATE users 
SET 
  is_host = true,
  host_since = COALESCE(host_since, NOW()),
  total_places_added = (
    SELECT COUNT(*) 
    FROM places 
    WHERE owner_id = users.id AND is_active = true
  ),
  updated_at = NOW()
WHERE phone_number = '+918655102089'
  AND EXISTS (
    SELECT 1 
    FROM places 
    WHERE owner_id = users.id AND is_active = true
  );

-- 3. Verify the fix worked
SELECT 
  'AFTER UPDATE' as status,
  u.id,
  u.phone_number,
  u.is_host,
  u.host_since,
  u.total_places_added,
  COUNT(p.id) as actual_places_count
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
WHERE u.phone_number = '+918655102089'
GROUP BY u.id, u.phone_number, u.is_host, u.host_since, u.total_places_added;

-- 4. Show places owned by this user
SELECT 
  p.id,
  p.title,
  p.type,
  p.is_active,
  p.is_open,
  p.created_at
FROM places p
JOIN users u ON p.owner_id = u.id
WHERE u.phone_number = '+918655102089'
ORDER BY p.created_at DESC;