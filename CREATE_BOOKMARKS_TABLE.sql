-- Create Bookmarks Table for Mawqif App
-- Run this in your Supabase SQL Editor

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    place_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can't bookmark same place twice
    UNIQUE(user_id, place_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_place_id ON bookmarks(place_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy for bookmarks (allow all operations for now)
CREATE POLICY "bookmarks_all_access" ON bookmarks 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_bookmarks_updated_at_trigger
    BEFORE UPDATE ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_bookmarks_updated_at();

-- Insert sample data for testing
INSERT INTO bookmarks (user_id, place_id) VALUES
('mock_user_123', 'sample-place-1'),
('mock_user_123', 'sample-place-2')
ON CONFLICT (user_id, place_id) DO NOTHING;

-- Verify table creation
SELECT 'BOOKMARKS TABLE CREATED SUCCESSFULLY!' as status;

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookmarks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data
SELECT 'SAMPLE BOOKMARKS:' as info;
SELECT * FROM bookmarks;