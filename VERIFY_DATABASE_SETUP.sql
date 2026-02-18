-- ============================================
-- VERIFY DATABASE SETUP
-- Run this after setting up the main SQL file
-- ============================================

-- Check if all required tables exist
SELECT 
  'Tables Status' as check_type,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ All tables created successfully'
    ELSE '❌ Missing tables: ' || (7 - COUNT(*))::text
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'places', 'reviews', 'bookmarks', 'host_analytics', 'place_edit_history', 'host_notifications');

-- List all created tables
SELECT 
  'Created Tables' as check_type,
  string_agg(table_name, ', ' ORDER BY table_name) as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'places', 'reviews', 'bookmarks', 'host_analytics', 'place_edit_history', 'host_notifications');

-- Check if storage bucket exists
SELECT 
  'Storage Bucket' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'place-images') 
    THEN '✅ place-images bucket created'
    ELSE '❌ place-images bucket missing'
  END as status;

-- Check if functions exist
SELECT 
  'Database Functions' as check_type,
  COUNT(*) || ' functions created' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_user_places_count', 'update_place_stats', 'update_bookmark_count', 'update_updated_at_column');

-- Check if triggers exist
SELECT 
  'Database Triggers' as check_type,
  COUNT(*) || ' triggers created' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Test if users table exists and is accessible
SELECT 
  'Users Table Test' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN '✅ Users table exists and ready'
    ELSE '❌ Users table missing - run main setup SQL first'
  END as status;

-- Test if places table exists and is accessible
SELECT 
  'Places Table Test' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'places'
    ) THEN '✅ Places table exists and ready'
    ELSE '❌ Places table missing - run main setup SQL first'
  END as status;

-- Final status
SELECT 
  '🎉 SETUP STATUS' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'places'
    ) THEN '✅ Database is ready for the Mawqif app!'
    ELSE '❌ Database setup incomplete - run HOST_SECTION_SUPABASE_SETUP.sql first'
  END as status;