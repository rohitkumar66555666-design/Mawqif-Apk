-- Debug User ID Mismatch Issue
-- Check if there's a mismatch between database user ID and app login

-- 1. Show all users with your phone number
SELECT 
  'ALL USERS WITH YOUR PHONE' as section,
  id,
  phone_number,
  is_host,
  created_at,
  LENGTH(id::text) as id_length,
  id::text as id_as_text
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
  p.created_at,
  LENGTH(p.owner_id::text) as owner_id_length
FROM places p
JOIN users u ON p.owner_id = u.id
WHERE u.phone_number = '+918655102089'
ORDER BY p.created_at DESC;

-- 3. Check if there are malformed UUIDs
SELECT 
  'UUID VALIDATION' as section,
  id,
  phone_number,
  CASE 
    WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN 'VALID UUID'
    ELSE 'INVALID UUID'
  END as uuid_status,
  LENGTH(id::text) as id_length
FROM users 
WHERE phone_number = '+918655102089';

-- 4. Show the problematic user ID that might be causing issues
SELECT 
  'PROBLEMATIC USER' as section,
  id,
  phone_number,
  'This user has malformed UUID' as issue
FROM users 
WHERE phone_number = '+918655102089'
  AND id::text = '19b69964-32c-4779-8b1d-19b6996432c77';

-- 5. Create a new user with proper UUID if needed
INSERT INTO users (
  id,
  phone_number,
  is_host,
  host_since,
  total_places_added,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  '+918655102089',
  true,
  NOW(),
  1,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users 
  WHERE phone_number = '+918655102089' 
    AND id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- 6. Show final user status
SELECT 
  'FINAL STATUS' as section,
  id,
  phone_number,
  is_host,
  CASE 
    WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN 'VALID UUID'
    ELSE 'INVALID UUID'
  END as uuid_status
FROM users 
WHERE phone_number = '+918655102089'
ORDER BY created_at DESC;