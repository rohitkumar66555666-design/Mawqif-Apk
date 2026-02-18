-- Sync your existing contact info from Dashboard to places
-- No hardcoding needed - uses the numbers you already entered

-- Step 1: Show what contact info you have in your host profile
SELECT 
  'Your Host Profile Contact Info' as info,
  id,
  phone_number,
  whatsapp_number
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 2: Show what's currently in your places
SELECT 
  'Current Place Contact Info' as info,
  title,
  contact_phone,
  whatsapp_number,
  owner_id
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;

-- Step 3: Copy your existing host contact info to all your places
UPDATE places 
SET 
  contact_phone = (
    SELECT phone_number 
    FROM users 
    WHERE id = places.owner_id
  ),
  whatsapp_number = (
    SELECT whatsapp_number 
    FROM users 
    WHERE id = places.owner_id
  ),
  updated_at = NOW()
WHERE owner_id = 'mock_user_1766668547393';

-- Step 4: Verify the sync worked
SELECT 
  'After Sync - Places now show your host contact info' as status,
  p.title,
  p.contact_phone as place_phone,
  p.whatsapp_number as place_whatsapp,
  u.phone_number as your_host_phone,
  u.whatsapp_number as your_host_whatsapp,
  CASE 
    WHEN p.contact_phone = u.phone_number THEN '✅ Phone Synced'
    ELSE '❌ Phone Not Synced'
  END as phone_status,
  CASE 
    WHEN p.whatsapp_number = u.whatsapp_number THEN '✅ WhatsApp Synced'
    ELSE '❌ WhatsApp Not Synced'
  END as whatsapp_status
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.owner_id = 'mock_user_1766668547393'
ORDER BY p.created_at DESC;

SELECT 'Your existing host contact info has been synced to all places!' as success_message;