-- Debug why status section is not showing

-- 1. Check if status columns exist
SELECT 
  'Status Columns Check' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'places'
AND column_name IN ('is_open', 'status_message', 'status_updated_at', 'status_updated_by')
ORDER BY column_name;

-- 2. Check user places count
SELECT 
  'User Places Count' as check_type,
  COUNT(*) as total_places,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_places
FROM places 
WHERE owner_id = 'mock_user_1766668547393';

-- 3. Check user host status
SELECT 
  'User Host Status' as check_type,
  id,
  is_host,
  host_since,
  total_places_added
FROM users 
WHERE id = 'mock_user_1766668547393';

-- 4. Show actual places with status (if any)
SELECT 
  'User Places with Status' as info,
  id,
  title,
  owner_id,
  is_active,
  is_open,
  status_message,
  status_updated_at,
  created_at
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;