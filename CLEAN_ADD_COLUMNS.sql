-- ============================================
-- CLEAN VERSION - ADD MISSING COLUMNS
-- No psql commands, works in Supabase SQL Editor
-- ============================================

-- Step 1: Add missing columns
ALTER TABLE places ADD COLUMN contact_phone TEXT;
ALTER TABLE places ADD COLUMN whatsapp_number TEXT;
ALTER TABLE places ADD COLUMN address TEXT;
ALTER TABLE places ADD COLUMN is_open BOOLEAN DEFAULT true;
ALTER TABLE places ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE places ADD COLUMN review_count INTEGER DEFAULT 0;

-- Step 2: Update existing records
UPDATE places 
SET 
  is_open = COALESCE(is_open, true),
  avg_rating = COALESCE(avg_rating, 0.0),
  review_count = COALESCE(review_count, 0);

-- Step 3: Verify columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'places' 
AND column_name IN (
    'contact_phone', 
    'whatsapp_number', 
    'address', 
    'is_open', 
    'avg_rating', 
    'review_count'
)
ORDER BY column_name;

-- Step 4: Test with sample data
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

-- Step 5: Success confirmation
SELECT 
  'SUCCESS: All columns added!' as status,
  COUNT(*) as total_places
FROM places;