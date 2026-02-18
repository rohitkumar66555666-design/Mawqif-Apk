-- SIMPLE FIX: Create the missing user
-- This fixes: Key (user_id)=(mock_user_1766736481865) is not present in table "users"

-- Step 1: Check what's missing
SELECT 
  'Current users' as info,
  id,
  phone_number
FROM users;

-- Step 2: Create the missing user from the error message
INSERT INTO users (id, phone_number, created_at)
VALUES ('mock_user_1766736481865', '+916299798907', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 3: Also create the main mock user if missing
INSERT INTO users (id, phone_number, created_at)
VALUES ('mock_user_1766668547393', '+916299798907', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create any other missing users referenced in reviews
INSERT INTO users (id, phone_number, created_at)
SELECT DISTINCT 
  r.user_id,
  '+91 0000000000',
  NOW()
FROM reviews r
WHERE r.user_id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verify users were created
SELECT 
  'Users after creation' as info,
  id,
  phone_number,
  created_at
FROM users
ORDER BY created_at DESC;

-- Step 6: Check if any reviews are still orphaned
SELECT 
  'Orphaned reviews check' as info,
  COUNT(*) as orphaned_count
FROM reviews r
WHERE r.user_id NOT IN (SELECT id FROM users);

SELECT '✅ MISSING USERS CREATED!' as success_message;
SELECT 'All referenced users now exist in the database.' as result;