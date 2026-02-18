-- Simple Reviews Table Setup for My Reviews Feature
-- Run this in your Supabase SQL Editor

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_active ON reviews(is_active);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
-- Users can read all active reviews
CREATE POLICY IF NOT EXISTS "Users can read active reviews" ON reviews
  FOR SELECT USING (is_active = true);

-- Users can insert their own reviews
CREATE POLICY IF NOT EXISTS "Users can insert their own reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Users can update their own reviews
CREATE POLICY IF NOT EXISTS "Users can update their own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub' OR user_id = current_setting('app.current_user_id', true));

-- Users can delete (soft delete) their own reviews
CREATE POLICY IF NOT EXISTS "Users can delete their own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub' OR user_id = current_setting('app.current_user_id', true));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint to places table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'places') THEN
        ALTER TABLE reviews 
        ADD CONSTRAINT fk_reviews_place_id 
        FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- Add foreign key constraint to profiles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE reviews 
        ADD CONSTRAINT fk_reviews_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- Test the setup
SELECT 'Reviews table setup completed successfully!' as status;