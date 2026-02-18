-- Simple user creation that works with any table schema
-- First check what columns exist, then create user with only those columns

-- Step 1: Check if user exists
SELECT 
  'Checking if user exists' as check_type,
  COUNT(*) as user_count
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 2: Show what columns exist in users table
SELECT 
  'Users table columns' as info,
  column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY column_name;

-- Step 3: Create user with only basic columns that should exist
INSERT INTO users (
  id,
  phone_number,
  created_at
) 
SELECT 
  'mock_user_1766668547393',
  '+91 9876543210',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE id = 'mock_user_1766668547393'
);

-- Step 4: Add whatsapp_number if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'whatsapp_number'
  ) THEN
    UPDATE users 
    SET whatsapp_number = '+91 9876543210'
    WHERE id = 'mock_user_1766668547393';
    RAISE NOTICE 'Added WhatsApp number';
  END IF;
END $$;

-- Step 5: Add is_host if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_host'
  ) THEN
    UPDATE users 
    SET is_host = true
    WHERE id = 'mock_user_1766668547393';
    RAISE NOTICE 'Set as host';
  END IF;
END $$;

-- Step 6: Add host_since if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'host_since'
  ) THEN
    UPDATE users 
    SET host_since = NOW()
    WHERE id = 'mock_user_1766668547393';
    RAISE NOTICE 'Set host_since date';
  END IF;
END $$;

-- Step 7: Show the created user
SELECT 
  'User created successfully' as status,
  *
FROM users 
WHERE id = 'mock_user_1766668547393';

SELECT 'User record created with available columns!' as success_message;