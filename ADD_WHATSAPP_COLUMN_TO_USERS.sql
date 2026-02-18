-- Add WhatsApp number column to users table
-- This is needed for host contact information sync

-- Step 1: Check if whatsapp_number column exists
SELECT 
  'Checking users table columns' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name IN ('phone_number', 'whatsapp_number')
ORDER BY column_name;

-- Step 2: Add whatsapp_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp_number TEXT;
    RAISE NOTICE 'Added whatsapp_number column to users table';
  ELSE
    RAISE NOTICE 'whatsapp_number column already exists in users table';
  END IF;
END $$;

-- Step 3: Verify the column was added
SELECT 
  'Users table columns after update' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name IN ('phone_number', 'whatsapp_number')
ORDER BY column_name;

-- Step 4: Show current user data
SELECT 
  'Current user data' as info,
  id,
  phone_number,
  whatsapp_number,
  COALESCE(first_name || ' ' || last_name, first_name, 'No name') as display_name
FROM users 
WHERE id = 'mock_user_1766668547393';

SELECT 'WhatsApp column added to users table successfully!' as success_message;