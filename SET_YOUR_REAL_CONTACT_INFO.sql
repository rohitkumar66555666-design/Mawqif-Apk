-- Set your REAL contact information
-- Replace any fake/test numbers with your actual numbers

-- Step 1: First, let's set YOUR REAL contact info in your user profile
-- REPLACE THESE WITH YOUR ACTUAL NUMBERS:
UPDATE users 
SET 
  phone_number = '+91 9876543210',  -- ← CHANGE THIS to your real phone number
  whatsapp_number = '+91 9876543210', -- ← CHANGE THIS to your real WhatsApp number
  updated_at = NOW()
WHERE id = 'mock_user_1766668547393';

-- Step 2: Now copy your REAL numbers to all your places
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

-- Step 3: Verify your real numbers are now showing
SELECT 
  'YOUR REAL CONTACT INFO NOW SET' as status,
  u.phone_number as your_phone_in_profile,
  u.whatsapp_number as your_whatsapp_in_profile,
  p.title as place_name,
  p.contact_phone as place_phone,
  p.whatsapp_number as place_whatsapp,
  CASE 
    WHEN u.phone_number = p.contact_phone THEN '✅ Correct Phone'
    ELSE '❌ Still Wrong Phone'
  END as phone_status
FROM users u
LEFT JOIN places p ON u.id = p.owner_id
WHERE u.id = 'mock_user_1766668547393'
ORDER BY p.created_at DESC;

SELECT 'Your real contact numbers are now set everywhere!' as success_message;

-- INSTRUCTIONS:
-- 1. Edit lines 6-7 above with YOUR REAL phone and WhatsApp numbers
-- 2. Run this script
-- 3. Your real numbers will show in place details