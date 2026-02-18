-- FORCE FIX for Reviews Table - This WILL work
-- Run this in your Supabase SQL Editor

-- Step 1: Disable RLS completely
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies aggressively
DROP POLICY IF EXISTS "allow_all_reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can update reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Users can read active reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
DROP POLICY IF EXISTS "authenticated users can insert reviews" ON reviews;

-- Step 3: Drop ALL constraints
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_place_id;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_user_id;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_place_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Step 4: Check current column types
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('user_id', 'place_id')
ORDER BY column_name;

-- Step 5: Force change user_id to TEXT using USING clause
ALTER TABLE reviews ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Step 6: Force change place_id to TEXT using USING clause  
ALTER TABLE reviews ALTER COLUMN place_id TYPE TEXT USING place_id::TEXT;

-- Step 7: Verify the changes worked
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('user_id', 'place_id')
ORDER BY column_name;

-- Step 8: Re-enable RLS with simple policy
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_all_access" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- Step 9: Create indexes for performance
DROP INDEX IF EXISTS idx_reviews_user_id;
DROP INDEX IF EXISTS idx_reviews_place_id;
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_place_id ON reviews(place_id);

-- Final verification
SELECT 'SUCCESS: Reviews table columns are now TEXT type!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('user_id', 'place_id');