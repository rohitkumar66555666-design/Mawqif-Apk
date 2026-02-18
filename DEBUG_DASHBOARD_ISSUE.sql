-- ============================================
-- DEBUG DASHBOARD ISSUE
-- Comprehensive check of why places aren't showing in dashboard
-- ============================================

-- 1. Show current user ID that the app is using
SELECT 'Current mock user should be' as info, 'mock_user_1766668547393' as expected_user_id;

-- 2. Check if this user exists
SELECT 
  'User exists?' as check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM users WHERE id = 'mock_user_1766668547393') 
    THEN 'YES - User found' 
    ELSE 'NO - User missing!' 
  END as result;

-- 3. Show user details
SELECT 
  'User details' as info,
  id,
  name,
  is_host,
  total_places_added,
  created_at
FROM users 
WHERE id = 'mock_user_1766668547393';

-- 4. Count places owned by this user
SELECT 
  'Places owned by mock user' as info,
  COUNT(*) as count
FROM places 
WHERE owner_id = 'mock_user_1766668547393';

-- 5. Show all places with their owner details
SELECT 
  'All places with owner info' as info,
  p.id as place_id,
  p.title,
  p.owner_id,
  p.is_active,
  u.name as owner_name,
  p.created_at
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
ORDER BY p.created_at DESC;

-- 6. Test the exact query that getUserPlaces() uses
SELECT 
  'getUserPlaces query test' as info,
  p.*
FROM places p
WHERE p.owner_id = 'mock_user_1766668547393'
  AND p.is_active = true
ORDER BY p.created_at DESC;

-- 7. Test the exact query that getHostStatistics() uses
SELECT 
  'getHostStatistics query test' as info,
  COUNT(*) as totalPlaces,
  SUM(p.total_reviews) as totalReviews,
  SUM(p.total_bookmarks) as totalBookmarks,
  AVG(p.avg_rating) as averageRating
FROM places p
WHERE p.owner_id = 'mock_user_1766668547393'
  AND p.is_active = true;

-- 8. Check if there are any RLS policy issues
SELECT 
  'RLS policies on places table' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'places';

-- 9. Show what the app should see
SELECT 
  'What dashboard should show' as summary,
  (SELECT COUNT(*) FROM places WHERE owner_id = 'mock_user_1766668547393' AND is_active = true) as place_count,
  (SELECT is_host FROM users WHERE id = 'mock_user_1766668547393') as is_host_status,
  (SELECT total_places_added FROM users WHERE id = 'mock_user_1766668547393') as cached_count;