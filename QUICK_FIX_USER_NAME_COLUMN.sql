-- QUICK FIX: Add user_name column to reviews table
-- This fixes the immediate error: "Could not find the 'user_name' column"

-- Step 1: Check if user_name column exists
SELECT 
  'Checking user_name column' as check_type,
  COUNT(*) as column_exists
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
AND column_name = 'user_name';

-- Step 2: Add user_name column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE reviews ADD COLUMN user_name TEXT;
    RAISE NOTICE '✅ Added user_name column to reviews table';
  ELSE
    RAISE NOTICE 'ℹ️ user_name column already exists';
  END IF;
END $$;

-- Step 3: Verify the column was added
SELECT 
  'Verification: user_name column' as status,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
AND column_name = 'user_name';

-- Step 4: Show current reviews table structure
SELECT 
  'Current reviews table columns' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY column_name;

SELECT '✅ QUICK FIX COMPLETED!' as success_message;
SELECT 'You can now create reviews without the user_name column error.' as result;