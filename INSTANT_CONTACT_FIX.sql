-- INSTANT FIX: Copy your contact info to all your places right now
-- This will make your contact info visible in place details immediately

-- Update all your places with your contact information
UPDATE places 
SET 
  contact_phone = (
    SELECT phone_number 
    FROM users 
    WHERE id = 'mock_user_1766668547393'
  ),
  whatsapp_number = (
    SELECT whatsapp_number 
    FROM users 
    WHERE id = 'mock_user_1766668547393'
  ),
  updated_at = NOW()
WHERE owner_id = 'mock_user_1766668547393';

-- Show the results
SELECT 
  'FIXED: Your places now have contact info!' as status,
  id,
  title,
  contact_phone,
  whatsapp_number,
  CASE 
    WHEN contact_phone IS NOT NULL AND contact_phone != '' THEN '✅ Phone Added'
    ELSE '❌ No Phone'
  END as phone_status,
  CASE 
    WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN '✅ WhatsApp Added'
    ELSE '❌ No WhatsApp'
  END as whatsapp_status
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;

SELECT 'Contact info is now visible in place details!' as success_message;