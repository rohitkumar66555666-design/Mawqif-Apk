-- ============================================
-- SIMPLE VERSION - ADD ESSENTIAL COLUMNS ONLY
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add the essential missing columns (one by one for safety)
ALTER TABLE places ADD COLUMN contact_phone TEXT;
ALTER TABLE places ADD COLUMN whatsapp_number TEXT;
ALTER TABLE places ADD COLUMN address TEXT;
ALTER TABLE places ADD COLUMN is_open BOOLEAN DEFAULT true;
ALTER TABLE places ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE places ADD COLUMN review_count INTEGER DEFAULT 0;

-- Update existing records with default values
UPDATE places 
SET 
  is_open = true,
  avg_rating = 0.0,
  review_count = 0
WHERE is_open IS NULL OR avg_rating IS NULL OR review_count IS NULL;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'places' 
ORDER BY ordinal_position;

-- Test query to make sure it works
SELECT 
  id,
  title,
  contact_phone,
  whatsapp_number,
  address,
  is_open,
  avg_rating,
  review_count
FROM places 
LIMIT 3;

-- Success message
SELECT '✅ Essential columns added successfully!' as status;