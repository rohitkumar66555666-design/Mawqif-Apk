-- Force sync contact info to your places immediately
-- This will copy your host contact info to all your places

-- Step 1: Show current state
SELECT 
  'BEFORE: Your places contact info' as status,
  p.id,
  p.title,
  p.contact_phone,
  p.whatsapp_number,
  u.phone_number as your_phone,
  u.whatsapp_number as your_whatsapp
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.owner_id = 'mock_user_1766668547393'
ORDER BY p.created_at DESC;

-- Step 2: Force update all your places with your contact info
UPDATE places 
SET 
  contact_phone = users.phone_number,
  whatsapp_number = users.whatsapp_number,
  updated_at = NOW()
FROM users 
WHERE places.owner_id = users.id 
AND places.owner_id = 'mock_user_1766668547393';

-- Step 3: Show updated state
SELECT 
  'AFTER: Your places contact info' as status,
  p.id,
  p.title,
  p.contact_phone,
  p.whatsapp_number,
  u.phone_number as your_phone,
  u.whatsapp_number as your_whatsapp,
  CASE 
    WHEN p.contact_phone = u.phone_number THEN '✅ Phone Synced'
    ELSE '❌ Phone Not Synced'
  END as phone_sync_status,
  CASE 
    WHEN p.whatsapp_number = u.whatsapp_number THEN '✅ WhatsApp Synced'
    ELSE '❌ WhatsApp Not Synced'
  END as whatsapp_sync_status
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.owner_id = 'mock_user_1766668547393'
ORDER BY p.created_at DESC;

SELECT 'Contact info force synced to all your places!' as success_message;