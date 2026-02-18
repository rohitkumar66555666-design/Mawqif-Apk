-- Check what's actually in your user profile and fix the hardcoded numbers

-- Step 1: Show what's currently in your user profile
SELECT 
  'CURRENT USER PROFILE (This is the problem!)' as info,
  id,
  phone_number,
  whatsapp_number,
  created_at,
  updated_at
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 2: Show what the Dashboard app thinks you have
-- (This should match what you entered in the Dashboard contact edit)

-- Step 3: Clear the hardcoded numbers and set them to NULL
-- So you can enter your real numbers in the Dashboard
UPDATE users 
SET 
  phone_number = NULL,
  whatsapp_number = NULL,
  updated_at = NOW()
WHERE id = 'mock_user_1766668547393';

-- Step 4: Verify the profile is now clean
SELECT 
  'AFTER CLEARING - Your profile is now clean' as info,
  id,
  phone_number,
  whatsapp_number,
  updated_at
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 5: Clear the places too so they don't show the old hardcoded numbers
UPDATE places 
SET 
  contact_phone = NULL,
  whatsapp_number = NULL,
  updated_at = NOW()
WHERE owner_id = 'mock_user_1766668547393';

-- Step 6: Show places are now clean too
SELECT 
  'PLACES ALSO CLEARED' as info,
  title,
  contact_phone,
  whatsapp_number
FROM places 
WHERE owner_id = 'mock_user_1766668547393';

SELECT 'Hardcoded numbers cleared! Now go to Dashboard and enter your real numbers.' as instructions;