-- DEBUG REPORTS TABLE ISSUES
-- This script helps diagnose what went wrong with the reports table

-- 1. Check if review_reports table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'review_reports';

-- 2. If table exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'review_reports' 
ORDER BY ordinal_position;

-- 3. Check for any constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'review_reports';

-- 4. Check if reviews table has report_count column
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name = 'report_count';

-- 5. Show all tables in the database
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 6. Check if there are any existing reports
SELECT COUNT(*) as existing_reports_count
FROM review_reports
WHERE 1=1; -- This will fail if table doesn't exist

-- 7. Show error details if any
SELECT 'Debug complete - check results above' as status;