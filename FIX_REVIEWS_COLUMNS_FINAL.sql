-- Final Fix for Reviews Table Column Types
-- Run this in your Supabase SQL Editor

-- First, let's see what we're working with
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
AND column_name IN ('user_id', 'place_id')
ORDER BY column_name;

-- Drop ALL policies first (they prevent column type changes)
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can update reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Users can read active reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
DROP POLICY IF EXISTS "authenticated users can insert reviews" ON reviews;

-- Drop any foreign key constraints that might prevent type changes
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_place_id;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_user_id;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_place_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Now change column types
-- Change user_id from UUID to TEXT
DO $$
BEGIN
    -- Check if user_id is UUID and change to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reviews ALTER COLUMN user_id TYPE TEXT;
        RAISE NOTICE 'Changed user_id from UUID to TEXT';
    ELSE
        RAISE NOTICE 'user_id is already TEXT or does not exist';
    END IF;
END $$;

-- Change place_id from UUID to TEXT if needed
DO $$
BEGIN
    -- Check if place_id is UUID and change to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'place_id'
        AND data_type = 'uuid'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reviews ALTER COLUMN place_id TYPE TEXT;
        RAISE NOTICE 'Changed place_id from UUID to TEXT';
    ELSE
        RAISE NOTICE 'place_id is already TEXT or does not exist';
    END IF;
END $$;

-- Recreate simple policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read reviews
CREATE POLICY "Everyone can read reviews" ON reviews
    FOR SELECT USING (true);

-- Allow everyone to insert reviews
CREATE POLICY "Everyone can insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Allow everyone to update reviews
CREATE POLICY "Everyone can update reviews" ON reviews
    FOR UPDATE USING (true);

-- Allow everyone to delete reviews
CREATE POLICY "Everyone can delete reviews" ON reviews
    FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id_text ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id_text ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Show final column types
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
AND column_name IN ('user_id', 'place_id')
ORDER BY column_name;

SELECT 'Reviews table column types fixed successfully!' as status;