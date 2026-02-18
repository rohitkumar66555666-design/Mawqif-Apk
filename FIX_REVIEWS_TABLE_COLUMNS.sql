-- Fix missing columns in reviews table
-- Add the missing replies_count and other review columns

-- Step 1: Check current reviews table structure
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

-- Step 2: Add missing columns to reviews table
DO $$
BEGIN
  -- Add replies_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'replies_count'
  ) THEN
    ALTER TABLE reviews ADD COLUMN replies_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added replies_count column';
  END IF;

  -- Add likes_count column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE reviews ADD COLUMN likes_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added likes_count column';
  END IF;

  -- Add dislikes_count column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'dislikes_count'
  ) THEN
    ALTER TABLE reviews ADD COLUMN dislikes_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added dislikes_count column';
  END IF;

  -- Add is_owner column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'is_owner'
  ) THEN
    ALTER TABLE reviews ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_owner column';
  END IF;

  -- Add user_liked column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'user_liked'
  ) THEN
    ALTER TABLE reviews ADD COLUMN user_liked BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added user_liked column';
  END IF;

  -- Add user_disliked column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'user_disliked'
  ) THEN
    ALTER TABLE reviews ADD COLUMN user_disliked BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added user_disliked column';
  END IF;

  -- Add host_response column if missing (for host replies)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'host_response'
  ) THEN
    ALTER TABLE reviews ADD COLUMN host_response TEXT;
    RAISE NOTICE 'Added host_response column';
  END IF;

  -- Add host_response_date column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'host_response_date'
  ) THEN
    ALTER TABLE reviews ADD COLUMN host_response_date TIMESTAMPTZ;
    RAISE NOTICE 'Added host_response_date column';
  END IF;
END $$;

-- Step 3: Show updated reviews table structure
SELECT 
  'Updated reviews table columns' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY ordinal_position;

-- Step 4: Test creating a review (this should work now)
SELECT 'Reviews table is now ready for creating reviews!' as success_message;

-- Step 5: Show any existing reviews
SELECT 
  'Existing reviews' as info,
  COUNT(*) as review_count
FROM reviews;