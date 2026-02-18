-- COMPLETE DASHBOARD FIX
-- This script fixes both user record and reviews table issues

-- ==============================================
-- PART 1: FIX USER RECORD ISSUE
-- ==============================================

-- Step 1: Check current user table structure
SELECT 
  'Current users table columns' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY column_name;

-- Step 2: Check if user exists
SELECT 
  'Checking if user exists' as check_type,
  COUNT(*) as user_count
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 3: Create user with basic columns
INSERT INTO users (
  id,
  phone_number,
  created_at
) 
SELECT 
  'mock_user_1766668547393',
  '+916299798907',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE id = 'mock_user_1766668547393'
);

-- Step 4: Add whatsapp_number if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'whatsapp_number'
  ) THEN
    UPDATE users 
    SET whatsapp_number = '+916299798907'
    WHERE id = 'mock_user_1766668547393';
    RAISE NOTICE 'Added WhatsApp number';
  END IF;
END $$;

-- Step 5: Add is_host if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_host'
  ) THEN
    UPDATE users 
    SET is_host = true
    WHERE id = 'mock_user_1766668547393';
    RAISE NOTICE 'Set as host';
  END IF;
END $$;

-- Step 6: Add host_since if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'host_since'
  ) THEN
    UPDATE users 
    SET host_since = NOW()
    WHERE id = 'mock_user_1766668547393';
    RAISE NOTICE 'Set host_since date';
  END IF;
END $$;

-- ==============================================
-- PART 2: FIX REVIEWS TABLE COLUMNS
-- ==============================================

-- Step 7: Check current reviews table structure
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

-- Step 8: Add missing columns to reviews table
DO $$
BEGIN
  -- Add user_id column if missing (CRITICAL - this is what's causing the error)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN user_id TEXT;
    RAISE NOTICE 'Added user_id column';
  END IF;

  -- Add place_id column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'place_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN place_id TEXT;
    RAISE NOTICE 'Added place_id column';
  END IF;

  -- Add rating column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'rating'
  ) THEN
    ALTER TABLE reviews ADD COLUMN rating INTEGER;
    RAISE NOTICE 'Added rating column';
  END IF;

  -- Add comment column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'comment'
  ) THEN
    ALTER TABLE reviews ADD COLUMN comment TEXT;
    RAISE NOTICE 'Added comment column';
  END IF;

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

  -- Add reviewer_name column if missing (for display purposes)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'reviewer_name'
  ) THEN
    ALTER TABLE reviews ADD COLUMN reviewer_name TEXT;
    RAISE NOTICE 'Added reviewer_name column';
  END IF;

  -- Add created_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column';
  END IF;

  -- Add updated_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column';
  END IF;
END $$;

-- ==============================================
-- PART 3: VERIFICATION AND TESTING
-- ==============================================

-- Step 9: Verify user was created successfully
SELECT 
  'User verification' as status,
  id,
  phone_number,
  whatsapp_number,
  is_host,
  host_since,
  created_at
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 10: Show updated reviews table structure
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

-- Step 11: Test user data fetch (simulate what Dashboard does)
SELECT 
  'Dashboard user fetch test' as test_type,
  id,
  phone_number,
  whatsapp_number,
  is_host,
  host_since
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Step 12: Test host statistics fetch
SELECT 
  'Host statistics test' as test_type,
  COUNT(*) as total_places
FROM places 
WHERE owner_id = 'mock_user_1766668547393' 
AND is_active = true;

-- Step 13: Show existing reviews count
SELECT 
  'Existing reviews count' as info,
  COUNT(*) as review_count
FROM reviews;

-- Success message
SELECT '✅ DASHBOARD FIX COMPLETED SUCCESSFULLY!' as success_message;
SELECT 'Both user record and reviews table have been fixed.' as details;
SELECT 'You can now test the Dashboard screen.' as next_step;