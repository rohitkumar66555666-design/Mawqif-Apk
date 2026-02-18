-- Check Your Places in Supabase
-- Let's find your places and see why they might not be showing

-- 1. First, find your user ID
SELECT 
  'YOUR USER INFO' as section,
  id as user_id,
  phone_number,
  is_host,
  created_at
FROM users 
WHERE phone_number = '+918655102089'
ORDER BY created_at DESC;

-- 2. Check all places owned by your user ID
SELECT 
  'YOUR PLACES' as section,
  p.id,
  p.title,
  p.type,
  p.address,
  p.owner_id,
  p.is_active,
  p.is_open,
  p.created_at,
  p.updated_at
FROM places p
JOIN users u ON p.owner_id = u.id
WHERE u.phone_number = '+918655102089'
ORDER BY p.created_at DESC;

-- 3. Check places table structure to see what columns exist
SELECT 
  'PLACES TABLE COLUMNS' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'places' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check all places to see if any exist (in case owner_id is wrong)
SELECT 
  'ALL RECENT PLACES' as section,
  p.id,
  p.title,
  p.type,
  p.owner_id,
  p.is_active,
  p.created_at
FROM places p
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Count total places in database
SELECT 
  'TOTAL COUNT' as section,
  COUNT(*) as total_places,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_places,
  COUNT(CASE WHEN owner_id IS NOT NULL THEN 1 END) as places_with_owner
FROM places;