-- SIMPLE FIX: Replace wrong contact numbers with correct ones
-- This works regardless of your table schema

-- Step 1: Set YOUR REAL contact numbers in your user profile
-- CHANGE THESE TO YOUR ACTUAL NUMBERS:
UPDATE users 
SET 
  phone_number = '+91 1234567890',     -- ← PUT YOUR REAL PHONE NUMBER HERE
  whatsapp_number = '+91 1234567890'   -- ← PUT YOUR REAL WHATSAPP NUMBER HERE
WHERE id = 'mock_user_1766668547393';

-- Step 2: Copy your real numbers to ALL your places
UPDATE places 
SET 
  contact_phone = (SELECT phone_number FROM users WHERE id = 'mock_user_1766668547393'),
  whatsapp_number = (SELECT whatsapp_number FROM users WHERE id = 'mock_user_1766668547393')
WHERE owner_id = 'mock_user_1766668547393';

-- Step 3: Check the results
SELECT 
  'Your contact info is now correct!' as status,
  title as place_name,
  contact_phone as phone_showing_in_place,
  whatsapp_number as whatsapp_showing_in_place
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;

-- INSTRUCTIONS:
-- 1. Edit lines 5-6 above with YOUR REAL phone numbers
-- 2. Run this script
-- 3. Your real numbers will now show in place details instead of fake ones