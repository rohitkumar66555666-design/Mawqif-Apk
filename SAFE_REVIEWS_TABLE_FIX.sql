-- SAFE REVIEWS TABLE FIX
-- This script safely adds only the essential missing columns to reviews table

-- Step 1: Check what exists first
SELECT 
  'Current reviews table structure' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY column_name;

-- Step 2: Add essential missing columns one by one
-- Add user_id (CRITICAL - this is causing the error)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN user_id TEXT;
    RAISE NOTICE '✅ Added user_id column';
  ELSE
    RAISE NOTICE 'ℹ️ user_id column already exists';
  END IF;
END $$;

-- Add place_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'place_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN place_id TEXT;
    RAISE NOTICE '✅ Added place_id column';
  ELSE
    RAISE NOTICE 'ℹ️ place_id column already exists';
  END IF;
END $$;

-- Add rating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'rating'
  ) THEN
    ALTER TABLE reviews ADD COLUMN rating INTEGER;
    RAISE NOTICE '✅ Added rating column';
  ELSE
    RAISE NOTICE 'ℹ️ rating column already exists';
  END IF;
END $$;

-- Add comment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'comment'
  ) THEN
    ALTER TABLE reviews ADD COLUMN comment TEXT;
    RAISE NOTICE '✅ Added comment column';
  ELSE
    RAISE NOTICE 'ℹ️ comment column already exists';
  END IF;
END $$;

-- Add replies_count (this was the original error)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'replies_count'
  ) THEN
    ALTER TABLE reviews ADD COLUMN replies_count INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added replies_count column';
  ELSE
    RAISE NOTICE 'ℹ️ replies_count column already exists';
  END IF;
END $$;

-- Add reviewer_name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'reviewer_name'
  ) THEN
    ALTER TABLE reviews ADD COLUMN reviewer_name TEXT;
    RAISE NOTICE '✅ Added reviewer_name column';
  ELSE
    RAISE NOTICE 'ℹ️ reviewer_name column already exists';
  END IF;
END $$;

-- Add user_name (this is what the app is trying to use)
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

-- Add host_response
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'host_response'
  ) THEN
    ALTER TABLE reviews ADD COLUMN host_response TEXT;
    RAISE NOTICE '✅ Added host_response column';
  ELSE
    RAISE NOTICE 'ℹ️ host_response column already exists';
  END IF;
END $$;

-- Add created_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '✅ Added created_at column';
  ELSE
    RAISE NOTICE 'ℹ️ created_at column already exists';
  END IF;
END $$;

-- Step 3: Verify the fix
SELECT 
  'Updated reviews table structure' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY column_name;

-- Step 4: Test if we can now insert a review (this should work)
SELECT 'Reviews table is now ready!' as success_message;