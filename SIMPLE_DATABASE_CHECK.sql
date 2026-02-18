-- ============================================
-- SIMPLE DATABASE CHECK - NO ERRORS GUARANTEED
-- Run this to check if your database is set up
-- ============================================

-- Check what tables exist in your database
SELECT 
  table_name as "Table Name",
  'EXISTS' as "Status"
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check specifically for our required tables
SELECT 
  'users' as "Required Table",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as "Status"

UNION ALL

SELECT 
  'places' as "Required Table",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'places'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as "Status"

UNION ALL

SELECT 
  'reviews' as "Required Table",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'reviews'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as "Status"

UNION ALL

SELECT 
  'bookmarks' as "Required Table",
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'bookmarks'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as "Status";

-- Simple message
SELECT 'If you see MISSING tables above, you need to run HOST_SECTION_SUPABASE_SETUP.sql first' as "Instructions";