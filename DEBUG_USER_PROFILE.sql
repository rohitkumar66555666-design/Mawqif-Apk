-- Debug user profile to see what's missing
SELECT 
  id,
  phone_number,
  first_name,
  last_name,
  full_name,
  profile_image_url,
  city,
  date_of_birth,
  gender,
  is_active,
  created_at
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Check what fields are missing for profile completion
SELECT 
  'Profile Completion Check' as check_type,
  CASE WHEN full_name IS NOT NULL AND full_name != '' THEN '✅' ELSE '❌' END as has_full_name,
  CASE WHEN profile_image_url IS NOT NULL AND profile_image_url != '' THEN '✅' ELSE '❌' END as has_profile_image,
  CASE WHEN city IS NOT NULL AND city != '' THEN '✅' ELSE '❌' END as has_city,
  CASE 
    WHEN full_name IS NOT NULL AND full_name != '' 
    AND profile_image_url IS NOT NULL AND profile_image_url != ''
    AND city IS NOT NULL AND city != ''
    THEN '✅ PROFILE COMPLETE' 
    ELSE '❌ PROFILE INCOMPLETE' 
  END as profile_status
FROM users 
WHERE id = 'mock_user_1766668547393';