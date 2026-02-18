-- Check what columns actually exist in the users table
-- This will help us understand the current schema

-- Show all columns in users table
SELECT 
  'Users table columns' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Show sample user data (first few columns only)
SELECT 
  'Sample user data' as info,
  id,
  phone_number,
  created_at
FROM users 
WHERE id = 'mock_user_1766668547393'
LIMIT 1;

-- Check if specific columns exist
SELECT 
  'Column existence check' as check_type,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'full_name'
  ) THEN '✅ full_name exists' ELSE '❌ full_name missing' END as full_name_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN '✅ first_name exists' ELSE '❌ first_name missing' END as first_name_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'whatsapp_number'
  ) THEN '✅ whatsapp_number exists' ELSE '❌ whatsapp_number missing' END as whatsapp_status;