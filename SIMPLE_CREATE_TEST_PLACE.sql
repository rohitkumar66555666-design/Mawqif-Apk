-- Simple Create Test Place - Handle UUID Issues
-- This will create a test place using a simpler approach

-- 1. First check what users exist
SELECT 
  'EXISTING USERS' as section,
  id,
  phone_number,
  is_host,
  created_at
FROM users 
WHERE phone_number = '+918655102089'
ORDER BY created_at DESC;

-- 2. Update existing user to be host (if exists)
UPDATE users 
SET is_host = true,
    host_since = COALESCE(host_since, NOW()),
    total_places_added = COALESCE(total_places_added, 0) + 1,
    updated_at = NOW()
WHERE phone_number = '+918655102089';

-- 3. Create test place using existing user ID
INSERT INTO places (
    id,
    title,
    type,
    address,
    city,
    latitude,
    longitude,
    owner_id,
    is_active,
    is_open,
    status_message,
    created_at,
    updated_at,
    total_reviews,
    total_bookmarks,
    avg_rating
)
SELECT 
    gen_random_uuid(),
    'APPOPOLEIS Test Place',
    'office',
    'Shop no 1 Crystal Kanungo MIRA road East',
    'MIRA ROAD',
    19.2952325,
    72.8543792,
    u.id,
    true,
    true,
    'Test place for dashboard',
    NOW(),
    NOW(),
    0,
    0,
    0.0
FROM users u
WHERE u.phone_number = '+918655102089'
LIMIT 1;

-- 4. Verify the place was created
SELECT 
    'VERIFICATION' as section,
    u.phone_number,
    u.is_host,
    p.title,
    p.type,
    p.address,
    p.is_active,
    p.is_open,
    p.created_at
FROM users u
JOIN places p ON u.id = p.owner_id
WHERE u.phone_number = '+918655102089'
ORDER BY p.created_at DESC;