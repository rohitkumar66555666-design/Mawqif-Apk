-- Test toggle functionality directly in database

-- 1. Show current places and their status
SELECT 
  'Current Places Status' as info,
  id,
  title,
  owner_id,
  is_open,
  status_message,
  status_updated_at,
  status_updated_by
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;

-- 2. Test manual toggle (close a place)
UPDATE places 
SET 
  is_open = false,
  status_message = 'Test closure from SQL',
  status_updated_at = NOW(),
  status_updated_by = 'mock_user_1766668547393'
WHERE owner_id = 'mock_user_1766668547393'
AND is_open = true
LIMIT 1;

-- 3. Show updated status
SELECT 
  'After Manual Toggle' as info,
  id,
  title,
  is_open,
  status_message,
  status_updated_at
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;

-- 4. Test toggle back (open the place)
UPDATE places 
SET 
  is_open = true,
  status_message = NULL,
  status_updated_at = NOW(),
  status_updated_by = 'mock_user_1766668547393'
WHERE owner_id = 'mock_user_1766668547393'
AND is_open = false
LIMIT 1;

-- 5. Final status check
SELECT 
  'Final Status Check' as info,
  id,
  title,
  is_open,
  status_message,
  status_updated_at
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;