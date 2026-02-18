-- CHECK REVIEWS TABLE STRUCTURE
-- Let's see what columns actually exist in the reviews table

-- Step 1: Check if reviews table exists
SELECT 
  'Reviews table exists' as check_type,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'reviews';

-- Step 2: Show all columns in reviews table
SELECT 
  'Current reviews table columns' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY ordinal_position;

-- Step 3: Show sample data if any exists
SELECT 
  'Sample reviews data' as info,
  *
FROM reviews 
LIMIT 3;

-- Step 4: Check what the reviews table structure should be based on places
SELECT 
  'Places table structure for reference' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'places'
AND column_name IN ('id', 'owner_id', 'title')
ORDER BY column_name;