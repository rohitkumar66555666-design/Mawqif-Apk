-- ============================================
-- CHECK CURRENT DATABASE STATE
-- Run this first to see what you have
-- ============================================

-- 1. List ALL tables in your database
SELECT 
  'Current Tables' as info,
  table_name as name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. If places table exists, show its columns
SELECT 
  'Places Table Columns' as info,
  column_name as name,
  data_type as type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'places'
ORDER BY ordinal_position;

-- 3. Check if users table exists at all
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN 'Users table EXISTS'
    ELSE 'Users table MISSING - this is the problem!'
  END as users_status;

-- 4. Show total number of tables
SELECT 
  COUNT(*) as total_tables,
  'tables found in public schema' as info
FROM information_schema.tables 
WHERE table_schema = 'public';