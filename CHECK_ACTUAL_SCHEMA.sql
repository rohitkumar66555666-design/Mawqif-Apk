-- ============================================
-- CHECK ACTUAL DATABASE SCHEMA
-- See what tables and columns actually exist
-- ============================================

-- 1. List all tables
SELECT 'TABLES' as type, table_name as name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Show columns in users table (if it exists)
SELECT 'USERS COLUMNS' as type, column_name as name, data_type as type_info
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Show columns in places table (if it exists)
SELECT 'PLACES COLUMNS' as type, column_name as name, data_type as type_info
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'places'
ORDER BY ordinal_position;

-- 4. Show columns in reviews table (if it exists)
SELECT 'REVIEWS COLUMNS' as type, column_name as name, data_type as type_info
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'reviews'
ORDER BY ordinal_position;

-- 5. Show all foreign key constraints
SELECT 
  'FOREIGN KEYS' as type,
  tc.table_name as table_name,
  kcu.column_name as column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public';