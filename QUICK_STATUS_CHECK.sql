-- Quick check to see if toggle buttons should appear

-- Check if you're a host with places
SELECT 
  'Toggle Button Visibility Check' as check_type,
  u.is_host as is_host,
  COUNT(p.id) as places_count,
  CASE 
    WHEN u.is_host = true AND COUNT(p.id) > 0 
    THEN '✅ TOGGLE BUTTONS SHOULD BE VISIBLE' 
    ELSE '❌ TOGGLE BUTTONS WILL NOT SHOW' 
  END as visibility_status,
  CASE 
    WHEN u.is_host = false THEN 'Need to set is_host = true'
    WHEN COUNT(p.id) = 0 THEN 'Need to add places'
    ELSE 'All conditions met'
  END as fix_needed
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
WHERE u.id = 'mock_user_1766668547393'
GROUP BY u.id, u.is_host;

-- Show your places that should have toggle buttons
SELECT 
  'Your Places with Toggle Buttons' as info,
  title,
  type,
  is_open,
  CASE WHEN is_open = true THEN 'OPEN (Green badge)' ELSE 'CLOSED (Red badge)' END as status_display,
  CASE WHEN is_open = true THEN 'Close button available' ELSE 'Open button available' END as toggle_action
FROM places 
WHERE owner_id = 'mock_user_1766668547393' AND is_active = true;