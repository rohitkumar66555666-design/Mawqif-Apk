-- Fix Reviews Table User ID and Foreign Key Issues
-- Run this in your Supabase SQL Editor

-- First, check the current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Change user_id column from UUID to TEXT to handle mock user IDs
DO $$
BEGIN
    -- Check if user_id is currently UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
        AND table_schema = 'public'
    ) THEN
        -- Change user_id from UUID to TEXT
        ALTER TABLE reviews ALTER COLUMN user_id TYPE TEXT;
        RAISE NOTICE 'Changed user_id column from UUID to TEXT';
    END IF;
END $$;

-- Change place_id column from UUID to TEXT if needed (to match places table)
DO $$
BEGIN
    -- Check if place_id is currently UUID type but places.id is TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'place_id'
        AND data_type = 'uuid'
        AND table_schema = 'public'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' 
        AND column_name = 'id'
        AND data_type = 'text'
        AND table_schema = 'public'
    ) THEN
        -- Change place_id from UUID to TEXT to match places.id
        ALTER TABLE reviews ALTER COLUMN place_id TYPE TEXT;
        RAISE NOTICE 'Changed place_id column from UUID to TEXT';
    END IF;
END $$;

-- Add foreign key constraint to places table if both tables exist and have matching types
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'places' 
        AND table_schema = 'public'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'reviews' 
        AND table_schema = 'public'
    ) THEN
        -- Drop existing constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_reviews_place_id' 
            AND table_name = 'reviews'
        ) THEN
            ALTER TABLE reviews DROP CONSTRAINT fk_reviews_place_id;
        END IF;
        
        -- Add foreign key constraint
        BEGIN
            ALTER TABLE reviews 
            ADD CONSTRAINT fk_reviews_place_id 
            FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key constraint between reviews and places';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
        END;
    END IF;
END $$;

-- Add foreign key constraint to profiles table if both tables exist and have matching types
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'reviews' 
        AND table_schema = 'public'
    ) THEN
        -- Drop existing constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_reviews_user_id' 
            AND table_name = 'reviews'
        ) THEN
            ALTER TABLE reviews DROP CONSTRAINT fk_reviews_user_id;
        END IF;
        
        -- Add foreign key constraint
        BEGIN
            ALTER TABLE reviews 
            ADD CONSTRAINT fk_reviews_user_id 
            FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key constraint between reviews and profiles';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
        END;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id_text ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id_text ON reviews(place_id);

SELECT 'Reviews table user_id and foreign key issues fixed!' as status;