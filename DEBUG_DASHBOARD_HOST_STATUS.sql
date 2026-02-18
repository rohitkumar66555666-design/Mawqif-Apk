-- Debug Dashboard Host Status Issue
-- Check if user is properly marked as host

-- 1. Check current user status
SELECT 
  id,
  phone_number,
  is_host,
  created_at
FROM users 
WHERE phone_number = '+918655102089'
ORDER BY created_at DESC;

-- 2. Check if user has places (should make them a host)
SELECT 
  p.id,
  p.title,
  p.owner_id,
  p.created_at,
  u.phone_number,
  u.is_host
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE u.phone_number = '+918655102089';

-- 3. Force update user to be host if they have places
UPDATE users 
SET is_host = true,
    updated_at = NOW()
WHERE phone_number = '+918655102089'
  AND id IN (
    SELECT DISTINCT owner_id 
    FROM places 
    WHERE owner_id IS NOT NULL
  );

-- 4. Verify the fix
SELECT 
  u.id,
  u.phone_number,
  u.is_host,
  COUNT(p.id) as place_count
FROM users u
LEFT JOIN places p ON u.id = p.owner_id
WHERE u.phone_number = '+918655102089'
GROUP BY u.id, u.phone_number, u.is_host;