-- Debug User ID Mismatch Issue
-- The profile has user_id: "19b69964-32c-4779-8b1d-19b6996432c77" but users table might not have this record

-- 1. Check the current profile user_id
SELECT 
  user_id,
  phone_number,
  first_name,
  last_name,
  created_at
FROM profiles 
WHERE phone_number = '+918655102089';

-- 2. Check if this user_id exists in users table
SELECT 
  id,
  phone_number,
  is_host,
  host_since,
  created_at
FROM users 
WHERE id = '19b69964-32c-4779-8b1d-19b6996432c77';

-- 3. Check all users in users table
SELECT 
  id,
  phone_number,
  is_host,
  host_since,
  created_at
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if there's a user with similar ID or same phone number
SELECT 
  id,
  phone_number,
  is_host,
  host_since,
  created_at
FROM users 
WHERE phone_number = '+918655102089'
   OR id LIKE '19b69964-32c%';

-- 5. Fix: Create missing user record if needed
-- Replace the user_id with the actual one from the profile
INSERT INTO users (
  id,
  phone_number,
  is_host,
  host_since,
  total_places_added,
  host_rating,
  created_at
) VALUES (
  '19b69964-32c-4779-8b1d-19b6996432c77',
  '+918655102089',
  false,
  NULL,
  0,
  0.0,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  phone_number = EXCLUDED.phone_number;

-- 6. Verify the fix
SELECT 
  u.id,
  u.phone_number,
  u.is_host,
  p.first_name,
  p.last_name
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.phone_number = '+918655102089';