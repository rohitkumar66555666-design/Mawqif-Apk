-- ============================================
-- CHECK WHAT COLUMNS YOU CURRENTLY HAVE
-- Run this first to see what's missing
-- ============================================

-- Show all current columns in places table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'places' 
ORDER BY ordinal_position;

-- Check specifically for the columns your app needs
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'places' AND column_name = 'contact_phone'
        ) THEN '✅ contact_phone EXISTS'
        ELSE '❌ contact_phone MISSING'
    END as contact_phone_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'places' AND column_name = 'whatsapp_number'
        ) THEN '✅ whatsapp_number EXISTS'
        ELSE '❌ whatsapp_number MISSING'
    END as whatsapp_number_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'places' AND column_name = 'address'
        ) THEN '✅ address EXISTS'
        ELSE '❌ address MISSING'
    END as address_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'places' AND column_name = 'is_open'
        ) THEN '✅ is_open EXISTS'
        ELSE '❌ is_open MISSING'
    END as is_open_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'places' AND column_name = 'avg_rating'
        ) THEN '✅ avg_rating EXISTS'
        ELSE '❌ avg_rating MISSING'
    END as avg_rating_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'places' AND column_name = 'review_count'
        ) THEN '✅ review_count EXISTS'
        ELSE '❌ review_count MISSING'
    END as review_count_status;

-- Show sample data to see what values are in existing columns
SELECT 
  id,
  title,
  city,
  type,
  latitude,
  longitude
FROM places 
LIMIT 3;