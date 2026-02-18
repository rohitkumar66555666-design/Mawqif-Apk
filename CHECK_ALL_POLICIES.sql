-- ============================================
-- CHECK ALL EXISTING POLICIES
-- See what policies exist before we try to modify columns
-- ============================================

-- List all policies in the database
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;