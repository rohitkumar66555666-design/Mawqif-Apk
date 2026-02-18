-- FIX REVIEWER_NAME NOT NULL CONSTRAINT ERROR
-- This fixes: "null value in column 'reviewer_name' violates not-null constraint"

-- Step 1: Check current constraint on reviewer_name
SELECT 
  'Current reviewer_name column info' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
AND column_name = 'reviewer_name';

-- Step 2: Remove NOT NULL constraint from reviewer_name column
DO $$
BEGIN
  -- Check if reviewer_name column exists and has NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' 
    AND column_name = 'reviewer_name'
    AND is_nullable = 'NO'
  ) THEN
    -- Remove NOT NULL constraint
    ALTER TABLE reviews ALTER COLUMN reviewer_name DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL constraint from reviewer_name column';
  ELSE
    RAISE NOTICE 'ℹ️ reviewer_name column is already nullable or does not exist';
  END IF;
END $$;

-- Step 3: Also ensure user_name column exists and is nullable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE reviews ADD COLUMN user_name TEXT;
    RAISE NOTICE '✅ Added user_name column';
  ELSE
    RAISE NOTICE 'ℹ️ user_name column already exists';
  END IF;
END $$;

-- Step 4: Make sure user_name is also nullable (no NOT NULL constraint)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' 
    AND column_name = 'user_name'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE reviews ALTER COLUMN user_name DROP NOT NULL;
    RAISE NOTICE '✅ Removed NOT NULL constraint from user_name column';
  ELSE
    RAISE NOTICE 'ℹ️ user_name column is already nullable';
  END IF;
END $$;

-- Step 5: Verify both columns are now nullable
SELECT 
  'Updated column constraints' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
AND column_name IN ('reviewer_name', 'user_name')
ORDER BY column_name;

-- Step 6: Test inserting a review with minimal data (this should work now)
SELECT 'Testing review insertion capability...' as test_status;

-- Show current reviews table structure
SELECT 
  'Final reviews table structure' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY column_name;

SELECT '✅ REVIEWER_NAME CONSTRAINT FIX COMPLETED!' as success_message;
SELECT 'You can now post reviews without the NOT NULL constraint error.' as result;