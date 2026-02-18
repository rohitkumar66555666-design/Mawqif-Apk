-- Fix Current User Host Status - Targeted Fix
-- This will make your specific user a host so dashboard features appear

-- 1. Check your current user status
SELECT 
  'YOUR CURRENT STATUS' as info,
  id,
  phone_number,
  is_host,
  host_since,
  total_places_added,
  created_at
FROM users 
WHERE id = '19b69964-32c-4779-8b1d-19b6996432c77' -- Your user ID
   OR phone_number = '+918655102089'; -- Your phone number

-- 2. Check if you have any places
SELECT 
  'YOUR PLACES' as info,
  p.id,
  p.title,
  p.owner_id,
  p.is_active,
  p.created_at
FROM places p
WHERE p.owner_id = '19b69964-32c-4779-8b1d-19b6996432c77'
   OR p.owner_id IN (
     SELECT id FROM users WHERE phone_number = '+918655102089'
   );

-- 3. IMMEDIATE FIX: Make you a host
UPDATE users 
SET 
  is_host = true,
  host_since = COALESCE(host_since, NOW()),
  total_places_added = COALESCE(total_places_added, 1)
WHERE id = '19b69964-32c-4779-8b1d-19b6996432c77'
   OR phone_number = '+918655102089';

-- 4. Verify the fix worked
SELECT 
  'AFTER FIX - YOU SHOULD SEE HOST FEATURES NOW' as result,
  id,
  phone_number,
  is_host,
  host_since,
  total_places_added,
  CASE 
    WHEN is_host = true THEN '✅ HOST FEATURES WILL BE VISIBLE'
    ELSE '❌ HOST FEATURES STILL HIDDEN'
  END as dashboard_status
FROM users 
WHERE id = '19b69964-32c-4779-8b1d-19b6996432c77'
   OR phone_number = '+918655102089';