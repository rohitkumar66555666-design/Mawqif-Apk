-- Fix missing user record error
-- The error means your user doesn't exist in the database

-- Step 1: Check if your user exists
SELECT 
  'Checking if user exists' as check_type,
  COUNT(*) as user_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ USER MISSING - This is the problem!'
    ELSE '✅ User exists'
  END as status
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 2: Show all users in database (to see what users exist)
SELECT 
  'All users in database' as info,
  id,
  phone_number,
  created_at
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Create the missing user record
INSERT INTO users (
  id,
  phone_number,
  whatsapp_number,
  is_host,
  host_since,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  'mock_user_1766668547393',
  '+91 9876543210',  -- Default phone (you can change this in Dashboard)
  '+91 9876543210',  -- Default WhatsApp (you can change this in Dashboard)
  true,
  NOW(),
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE id = 'mock_user_1766668547393'
);

-- Step 4: Verify the user was created
SELECT 
  'User created successfully' as status,
  id,
  phone_number,
  whatsapp_number,
  is_host,
  host_since,
  is_active,
  created_at
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 5: Check if there are any places without owners
SELECT 
  'Places without valid owners' as info,
  COUNT(*) as orphaned_places
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE u.id IS NULL;

-- Step 6: Assign orphaned places to the user (if any)
UPDATE places 
SET owner_id = 'mock_user_1766668547393'
WHERE owner_id IS NULL 
OR owner_id NOT IN (SELECT id FROM users);

SELECT 'Missing user record has been created and fixed!' as success_message;