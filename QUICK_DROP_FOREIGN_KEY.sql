-- QUICK FIX: Drop problematic foreign key constraint
-- This is a simple fix if you don't need the foreign key constraint

-- Step 1: Check what foreign key constraints exist
SELECT 
  'Current foreign key constraints' as info,
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage 
WHERE table_schema = 'public'
AND constraint_name LIKE '%fkey%'
ORDER BY constraint_name;

-- Step 2: Drop the problematic constraint
DO $$
BEGIN
  -- Drop user_places foreign key constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_places_user_id_fkey'
  ) THEN
    ALTER TABLE user_places DROP CONSTRAINT user_places_user_id_fkey;
    RAISE NOTICE '✅ Dropped user_places_user_id_fkey constraint';
  ELSE
    RAISE NOTICE 'ℹ️ user_places_user_id_fkey constraint does not exist';
  END IF;
END $$;

-- Step 3: Verify constraint was dropped
SELECT 
  'Remaining foreign key constraints' as info,
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage 
WHERE table_schema = 'public'
AND constraint_name LIKE '%fkey%'
ORDER BY constraint_name;

SELECT '✅ PROBLEMATIC FOREIGN KEY DROPPED!' as success_message;
SELECT 'You can now run other SQL scripts without the type mismatch error.' as result;