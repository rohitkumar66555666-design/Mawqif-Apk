-- Simple Check User and Places Status
-- Just check what exists without creating anything new

-- 1. Show all users with your phone number
SELECT 
  'ALL USERS WITH YOUR PHONE' as section,
  id,
  phone_number,
  is_host,
  created_at,
  LENGTH(id::text) as id_length
FROM users 
WHERE phone_number = '+918655102089'
ORDER BY created_at DESC;

-- 2. Show places created for your phone number
SELECT 
  'PLACES FOR YOUR PHONE' as section,
  p.id as place_id,
  p.title,
  p.owner_id,
  u.phone_number,
  p.is_active,
  p.created_at
FROM places p
JOIN users u ON p.owner_id = u.id
WHERE u.phone_number = '+918655102089'
ORDER BY p.created_at DESC;

-- 3. Check if the malformed UUID user has places
SELECT 
  'PLACES FOR MALFORMED UUID USER' as section,
  COUNT(*) as place_count,
  '19b69964-32c-4779-8b1d-19b6996432c77' as problematic_user_id
FROM places 
WHERE owner_id::text = '19b69964-32c-4779-8b1d-19b6996432c77';

-- 4. Show all places in the database (to see if any exist)
SELECT 
  'ALL PLACES IN DATABASE' as section,
  COUNT(*) as total_places
FROM places 
WHERE is_active = true;