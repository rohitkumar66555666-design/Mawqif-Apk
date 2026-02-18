-- Safely add WhatsApp column to users table
-- Works regardless of existing schema

-- Step 1: Add whatsapp_number column if it doesn't exist
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

-- Step 2: Show what columns we have now
SELECT 
  'Users table columns after update' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY column_name;

-- Step 3: Show current user data (only safe columns)
SELECT 
  'Current user data' as info,
  id,
  phone_number,
  whatsapp_number
FROM users 
WHERE id = 'mock_user_1766668547393';

SELECT 'WhatsApp column setup completed!' as success_message;