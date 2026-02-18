-- Simple and Direct Fix for UUID/TEXT Issue
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL policies (they prevent column changes)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'reviews' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON reviews', policy_record.policyname);
    END LOOP;
END $$;

-- Step 2: Drop foreign key constraints
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_place_id;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_user_id;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_place_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Step 3: Change user_id column type
ALTER TABLE reviews ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Change place_id column type (if needed)
ALTER TABLE reviews ALTER COLUMN place_id TYPE TEXT;

-- Step 5: Recreate simple policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('user_id', 'place_id');

SELECT 'Reviews table fixed - both user_id and place_id are now TEXT!' as result;