-- FINAL DEFINITIVE FIX for Reviews Table
-- This will work regardless of current state
-- Run this in your Supabase SQL Editor

-- Step 1: Check if reviews table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        -- Create reviews table from scratch
        CREATE TABLE reviews (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            place_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            likes_count INTEGER DEFAULT 0,
            dislikes_count INTEGER DEFAULT 0,
            replies_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created new reviews table';
    ELSE
        RAISE NOTICE 'Reviews table already exists';
    END IF;
END $$;

-- Step 2: Disable RLS temporarily
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies
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
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 4: Drop ALL constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'reviews' 
        AND table_schema = 'public'
        AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE format('ALTER TABLE reviews DROP CONSTRAINT IF EXISTS %I', constraint_record.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- Step 5: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add likes_count if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'likes_count') THEN
        ALTER TABLE reviews ADD COLUMN likes_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added likes_count column';
    END IF;
    
    -- Add dislikes_count if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'dislikes_count') THEN
        ALTER TABLE reviews ADD COLUMN dislikes_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added dislikes_count column';
    END IF;
    
    -- Add replies_count if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'replies_count') THEN
        ALTER TABLE reviews ADD COLUMN replies_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added replies_count column';
    END IF;
    
    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'updated_at') THEN
        ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- Step 6: Force change column types to TEXT
DO $$
BEGIN
    -- Change user_id to TEXT
    BEGIN
        ALTER TABLE reviews ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
        RAISE NOTICE 'Changed user_id to TEXT';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'user_id already TEXT or conversion failed: %', SQLERRM;
    END;
    
    -- Change place_id to TEXT
    BEGIN
        ALTER TABLE reviews ALTER COLUMN place_id TYPE TEXT USING place_id::TEXT;
        RAISE NOTICE 'Changed place_id to TEXT';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'place_id already TEXT or conversion failed: %', SQLERRM;
    END;
END $$;

-- Step 7: Set default values for existing NULL columns
UPDATE reviews SET likes_count = 0 WHERE likes_count IS NULL;
UPDATE reviews SET dislikes_count = 0 WHERE dislikes_count IS NULL;
UPDATE reviews SET replies_count = 0 WHERE replies_count IS NULL;
UPDATE reviews SET updated_at = created_at WHERE updated_at IS NULL;

-- Step 8: Re-enable RLS with simple policy
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_access" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- Step 9: Create performance indexes
DROP INDEX IF EXISTS idx_reviews_user_id;
DROP INDEX IF EXISTS idx_reviews_place_id;
DROP INDEX IF EXISTS idx_reviews_created_at;

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Step 10: Verify final structure
SELECT 'FINAL VERIFICATION:' as status;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 11: Test insert to make sure it works
DO $$
BEGIN
    -- Try to insert a test review
    INSERT INTO reviews (place_id, user_id, user_name, rating, comment)
    VALUES ('test-place-123', 'test-user-456', 'Test User', 5, 'Test review')
    ON CONFLICT DO NOTHING;
    
    -- Delete the test review
    DELETE FROM reviews WHERE user_name = 'Test User' AND comment = 'Test review';
    
    RAISE NOTICE 'SUCCESS: Reviews table is now ready for TEXT user_id and place_id!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;