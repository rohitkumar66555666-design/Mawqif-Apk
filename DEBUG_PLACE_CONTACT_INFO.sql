-- Debug why place contact info is not showing
-- Check if places have contact information and if sync worked

-- Step 1: Check your user contact info
SELECT 
  'Your Host Contact Info' as info,
  id,
  phone_number,
  whatsapp_number
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 2: Check your places and their contact info
SELECT 
  'Your Places Contact Info' as info,
  id,
  title,
  owner_id,
  contact_phone,
  whatsapp_number,
  created_at,
  CASE 
    WHEN contact_phone IS NOT NULL AND contact_phone != '' THEN '✅ Has Phone'
    ELSE '❌ Missing Phone'
  END as phone_status,
  CASE 
    WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN '✅ Has WhatsApp'
    ELSE '❌ Missing WhatsApp'
  END as whatsapp_status
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;

-- Step 3: Check if places table has contact columns
SELECT 
  'Places Table Contact Columns' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'places'
AND column_name IN ('contact_phone', 'whatsapp_number')
ORDER BY column_name;

-- Step 4: Show what needs to be fixed
SELECT 
  'Contact Info Status' as summary,
  COUNT(*) as total_places,
  COUNT(CASE WHEN contact_phone IS NOT NULL AND contact_phone != '' THEN 1 END) as places_with_phone,
  COUNT(CASE WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN 1 END) as places_with_whatsapp,
  COUNT(CASE WHEN (contact_phone IS NULL OR contact_phone = '') AND (whatsapp_number IS NULL OR whatsapp_number = '') THEN 1 END) as places_missing_contact
FROM places 
WHERE owner_id = 'mock_user_1766668547393';

SELECT 'Debug complete - check results above!' as debug_status;