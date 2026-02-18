-- Quick profile completion for testing
-- This adds basic profile data so you can test the AddPlace functionality

UPDATE users 
SET 
  first_name = 'Test',
  last_name = 'User',
  full_name = 'Test User',
  city = 'Mumbai',
  profile_image_url = 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=TU',
  updated_at = NOW()
WHERE id = 'mock_user_1766668547393';

-- Verify the update
SELECT 
  'Profile Updated' as status,
  full_name,
  city,
  profile_image_url,
  CASE 
    WHEN full_name IS NOT NULL AND full_name != '' 
    AND city IS NOT NULL AND city != ''
    THEN '✅ PROFILE NOW COMPLETE' 
    ELSE '❌ STILL INCOMPLETE' 
  END as completion_status
FROM users 
WHERE id = 'mock_user_1766668547393';