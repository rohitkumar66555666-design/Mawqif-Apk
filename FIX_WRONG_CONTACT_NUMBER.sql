-- Fix wrong contact numbers showing in place details
-- Investigate and correct the fake/wrong numbers

-- Step 1: Check what's in your user profile (your real numbers)
SELECT 
  'YOUR REAL CONTACT INFO (Host Profile)' as info,
  id,
  phone_number as your_real_phone,
  whatsapp_number as your_real_whatsapp
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 2: Check what's showing in your places (the fake numbers)
SELECT 
  'PLACES SHOWING WRONG NUMBERS' as info,
  id,
  title,
  contact_phone as place_fake_phone,
  whatsapp_number as place_fake_whatsapp,
  owner_id,
  created_at
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;

-- Step 3: Compare side by side to see the mismatch
SELECT 
  'COMPARISON: Real vs Fake Numbers' as comparison,
  p.title as place_name,
  u.phone_number as your_real_phone,
  p.contact_phone as place_showing_fake_phone,
  u.whatsapp_number as your_real_whatsapp,
  p.whatsapp_number as place_showing_fake_whatsapp,
  CASE 
    WHEN u.phone_number = p.contact_phone THEN '✅ Phone Correct'
    ELSE '❌ Phone WRONG'
  END as phone_status,
  CASE 
    WHEN u.whatsapp_number = p.whatsapp_number THEN '✅ WhatsApp Correct'
    ELSE '❌ WhatsApp WRONG'
  END as whatsapp_status
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.owner_id = 'mock_user_1766668547393'
ORDER BY p.created_at DESC;

-- Step 4: FORCE CORRECT the wrong numbers with your real numbers
UPDATE places 
SET 
  contact_phone = users.phone_number,
  whatsapp_number = users.whatsapp_number,
  updated_at = NOW()
FROM users 
WHERE places.owner_id = users.id 
AND places.owner_id = 'mock_user_1766668547393';

-- Step 5: Verify the fix worked
SELECT 
  'AFTER FIX: Places should now show correct numbers' as status,
  p.title as place_name,
  p.contact_phone as place_phone_now,
  p.whatsapp_number as place_whatsapp_now,
  u.phone_number as your_real_phone,
  u.whatsapp_number as your_real_whatsapp,
  CASE 
    WHEN u.phone_number = p.contact_phone THEN '✅ Phone FIXED'
    ELSE '❌ Phone STILL WRONG'
  END as phone_fix_status,
  CASE 
    WHEN u.whatsapp_number = p.whatsapp_number THEN '✅ WhatsApp FIXED'
    ELSE '❌ WhatsApp STILL WRONG'
  END as whatsapp_fix_status
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.owner_id = 'mock_user_1766668547393'
ORDER BY p.created_at DESC;

SELECT 'Wrong contact numbers have been corrected with your real numbers!' as success_message;