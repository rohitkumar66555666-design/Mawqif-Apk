-- ============================================
-- TEST DATABASE CONNECTION AND PLACES DATA
-- Run this in Supabase SQL Editor to debug missing places
-- ============================================

-- Step 1: Check if places table exists and show structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'places'
ORDER BY ordinal_position;

-- Step 2: Count total places in database
SELECT 
  COUNT(*) as total_places,
  COUNT(CASE WHEN address IS NOT NULL AND address != '' THEN 1 END) as places_with_address,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as places_with_coordinates
FROM places;

-- Step 3: Show all places with key information
SELECT 
  id,
  title,
  city,
  type,
  latitude,
  longitude,
  address,
  created_at,
  CASE 
    WHEN latitude IS NULL OR longitude IS NULL THEN '❌ Missing coordinates'
    WHEN address IS NULL OR address = '' THEN '⚠️ Missing address'
    ELSE '✅ Complete'
  END as status
FROM places
ORDER BY created_at DESC
LIMIT 10;

-- Step 4: Check for the most recently added place
SELECT 
  '🆕 Most Recent Place:' as info,
  title,
  city,
  type,
  latitude,
  longitude,
  address,
  created_at
FROM places
ORDER BY created_at DESC
LIMIT 1;

-- Step 5: Check if address column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'places' AND column_name = 'address'
    ) 
    THEN '✅ Address column exists'
    ELSE '❌ Address column missing - run ADD_ADDRESS_COLUMN.sql'
  END as address_column_status;