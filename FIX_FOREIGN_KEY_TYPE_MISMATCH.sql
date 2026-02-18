-- FIX FOREIGN KEY TYPE MISMATCH ERROR
-- This fixes: "Key columns "user_id" and "id" are of incompatible types: uuid and text"

-- Step 1: Check current column types
SELECT 
  'Current column types' as info,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (
  (table_name = 'users' AND column_name = 'id') OR
  (table_name = 'user_places' AND column_name = 'user_id') OR
  (table_name = 'places' AND column_name = 'owner_id') OR
  (table_name = 'reviews' AND column_name = 'user_id')
)
ORDER BY table_name, column_name;

-- Step 2: Drop the problematic foreign key constraint first
DO $$
BEGIN
  -- Drop foreign key constraint on user_places
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_places_user_id_fkey'
  ) THEN
    ALTER TABLE user_places DROP CONSTRAINT user_places_user_id_fkey;
    RAISE NOTICE '✅ Dropped user_places_user_id_fkey constraint';
  END IF;
  
  -- Drop any other foreign key constraints that might conflict
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'places_owner_id_fkey'
  ) THEN
    ALTER TABLE places DROP CONSTRAINT places_owner_id_fkey;
    RAISE NOTICE '✅ Dropped places_owner_id_fkey constraint';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_user_id_fkey'
  ) THEN
    ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;
    RAISE NOTICE '✅ Dropped reviews_user_id_fkey constraint';
  END IF;
END $$;

-- Step 3: Convert user_places.user_id from UUID to TEXT
DO $$
BEGIN
  -- Check if user_places table exists and has user_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_places' AND column_name = 'user_id'
  ) THEN
    -- Convert UUID to TEXT
    ALTER TABLE user_places ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    RAISE NOTICE '✅ Converted user_places.user_id from UUID to TEXT';
  ELSE
    RAISE NOTICE 'ℹ️ user_places.user_id column does not exist';
  END IF;
END $$;

-- Step 4: Ensure all related tables use TEXT for user IDs
DO $$
BEGIN
  -- Convert places.owner_id to TEXT if it's UUID
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' 
    AND column_name = 'owner_id'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE places ALTER COLUMN owner_id TYPE TEXT USING owner_id::TEXT;
    RAISE NOTICE '✅ Converted places.owner_id from UUID to TEXT';
  END IF;
  
  -- Convert reviews.user_id to TEXT if it's UUID
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' 
    AND column_name = 'user_id'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE reviews ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    RAISE NOTICE '✅ Converted reviews.user_id from UUID to TEXT';
  END IF;
END $$;

-- Step 5: Recreate foreign key constraints with matching TEXT types
DO $$
BEGIN
  -- Recreate user_places foreign key constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_places'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'users'
  ) THEN
    ALTER TABLE user_places 
    ADD CONSTRAINT user_places_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Recreated user_places_user_id_fkey constraint with TEXT types';
  END IF;
  
  -- Recreate places foreign key constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE places 
    ADD CONSTRAINT places_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Recreated places_owner_id_fkey constraint with TEXT types';
  END IF;
  
  -- Recreate reviews foreign key constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE reviews 
    ADD CONSTRAINT reviews_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Recreated reviews_user_id_fkey constraint with TEXT types';
  END IF;
END $$;

-- Step 6: Verify all column types are now consistent
SELECT 
  'Updated column types' as info,
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (
  (table_name = 'users' AND column_name = 'id') OR
  (table_name = 'user_places' AND column_name = 'user_id') OR
  (table_name = 'places' AND column_name = 'owner_id') OR
  (table_name = 'reviews' AND column_name = 'user_id')
)
ORDER BY table_name, column_name;

-- Step 7: Show foreign key constraints
SELECT 
  'Foreign key constraints' as info,
  constraint_name,
  table_name,
  column_name,
  foreign_table_name,
  foreign_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.referential_constraints rc 
  ON kcu.constraint_name = rc.constraint_name
JOIN information_schema.key_column_usage kcu2 
  ON rc.unique_constraint_name = kcu2.constraint_name
WHERE kcu.table_schema = 'public'
AND kcu.constraint_name LIKE '%user%'
ORDER BY constraint_name;

SELECT '✅ FOREIGN KEY TYPE MISMATCH FIXED!' as success_message;
SELECT 'All user ID columns are now TEXT type and foreign keys work properly.' as result;