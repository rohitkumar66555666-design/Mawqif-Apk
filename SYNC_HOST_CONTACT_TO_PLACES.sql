-- Sync host contact information to all their places
-- This ensures existing places show the host's phone and WhatsApp numbers

-- Step 1: Add whatsapp_number column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp_number TEXT;
    RAISE NOTICE 'Added whatsapp_number column to users table';
  ELSE
    RAISE NOTICE 'whatsapp_number column already exists in users table';
  END IF;
END $$;

-- Step 2: Show current places without contact info
SELECT 
  'Places Missing Contact Info' as info,
  p.id,
  p.title,
  p.owner_id,
  p.contact_phone,
  p.whatsapp_number,
  u.phone_number as host_phone,
  COALESCE(u.whatsapp_number, 'Not set') as host_whatsapp
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

-- Step 3: Update places with host contact information
UPDATE places 
SET 
  contact_phone = COALESCE(contact_phone, users.phone_number),
  whatsapp_number = COALESCE(places.whatsapp_number, users.whatsapp_number),
  updated_at = NOW()
FROM users 
WHERE places.owner_id = users.id 
AND places.is_active = true
AND (
  places.contact_phone IS NULL 
  OR places.contact_phone = '' 
  OR places.whatsapp_number IS NULL 
  OR places.whatsapp_number = ''
);

-- Step 4: Verify the sync worked
SELECT 
  'After Sync - Places with Contact Info' as info,
  p.id,
  p.title,
  p.owner_id,
  p.contact_phone,
  p.whatsapp_number,
  u.phone_number as host_phone,
  COALESCE(u.whatsapp_number, 'Not set') as host_whatsapp,
  CASE 
    WHEN p.contact_phone IS NOT NULL AND p.contact_phone != '' 
    THEN '✅ HAS PHONE'
    ELSE '⚠️ MISSING PHONE'
  END as phone_status,
  CASE 
    WHEN p.whatsapp_number IS NOT NULL AND p.whatsapp_number != ''
    THEN '✅ HAS WHATSAPP'
    ELSE '⚠️ MISSING WHATSAPP'
  END as whatsapp_status
FROM places p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

-- Step 5: Show summary
SELECT 
  'Contact Sync Summary' as summary,
  COUNT(*) as total_places,
  COUNT(CASE WHEN contact_phone IS NOT NULL AND contact_phone != '' THEN 1 END) as places_with_phone,
  COUNT(CASE WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN 1 END) as places_with_whatsapp,
  COUNT(CASE 
    WHEN contact_phone IS NOT NULL AND contact_phone != '' 
    AND whatsapp_number IS NOT NULL AND whatsapp_number != ''
    THEN 1 
  END) as places_with_both
FROM places 
WHERE is_active = true;

SELECT 'Host contact information synced to places successfully!' as success_message;