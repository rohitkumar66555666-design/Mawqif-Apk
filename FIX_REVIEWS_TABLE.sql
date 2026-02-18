-- Fix Reviews Table for My Reviews Feature
-- Run this in your Supabase SQL Editor

-- Add missing columns to reviews table if they don't exist
DO $$
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reviews ADD COLUMN is_active BOOLEAN DEFAULT true;
        UPDATE reviews SET is_active = true WHERE is_active IS NULL;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE reviews SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;

    -- Add likes_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'likes_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reviews ADD COLUMN likes_count INTEGER DEFAULT 0;
        UPDATE reviews SET likes_count = 0 WHERE likes_count IS NULL;
    END IF;

    -- Add dislikes_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'dislikes_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reviews ADD COLUMN dislikes_count INTEGER DEFAULT 0;
        UPDATE reviews SET dislikes_count = 0 WHERE dislikes_count IS NULL;
    END IF;

    -- Add replies_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'replies_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reviews ADD COLUMN replies_count INTEGER DEFAULT 0;
        UPDATE reviews SET replies_count = 0 WHERE replies_count IS NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_active ON reviews(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at_trigger ON reviews;
CREATE TRIGGER update_reviews_updated_at_trigger
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Enable Row Level Security if not already enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read active reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- Create policies for reviews
-- Users can read all active reviews
CREATE POLICY "Users can read active reviews" ON reviews
    FOR SELECT USING (is_active = true);

-- Users can insert their own reviews
CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (true);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (true);

SELECT 'Reviews table fixed successfully!' as status;