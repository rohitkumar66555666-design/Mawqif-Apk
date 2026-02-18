-- Fix Users Table - Add missing user record without is_active column
-- This script creates the missing user record for the current user

-- 1. First check what columns exist in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Create the missing user record (adjust columns based on what exists)
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

-- 3. Verify the user was created
SELECT 
  id,
  phone_number,
  is_host,
  host_since,
  total_places_added,
  host_rating,
  created_at
FROM users 
WHERE id = '19b69964-32c-4779-8b1d-19b6996432c77';