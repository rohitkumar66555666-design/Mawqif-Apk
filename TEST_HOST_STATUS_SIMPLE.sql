-- Simple Test: Check and Fix Host Status
-- Run this to see why host features are missing

-- 1. Show all users and their host status
SELECT 
  'ALL USERS' as info,
  id,
  phone_number,
  is_host,
  host_since,
  total_places_added
FROM users 
ORDER BY created_at DESC;

-- 2. Show all places and their owners
SELECT 
  'ALL PLACES' as info,
  p.id,
  p.title,
  p.owner_id,
  p.is_active,
  u.is_host as owner_is_host
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

-- 3. QUICK FIX: Make ALL users with places into hosts
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
  SELECT DISTINCT owner_id 
  FROM places 
  WHERE is_active = true AND owner_id IS NOT NULL
);

-- 4. Show results after fix
SELECT 
  'AFTER FIX' as info,
  u.id,
  u.phone_number,
  u.is_host,
  u.total_places_added,
  COUNT(p.id) as actual_places,
  CASE 
    WHEN u.is_host = true THEN '✅ WILL SEE HOST FEATURES'
    ELSE '❌ NO HOST FEATURES'
  END as dashboard_result
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
GROUP BY u.id, u.phone_number, u.is_host, u.total_places_added
ORDER BY u.created_at DESC;