-- ============================================
-- ADD ADDRESS COLUMN TO PLACES TABLE
-- This adds the missing address column for location details
-- ============================================

-- Step 1: Add address column to places table
ALTER TABLE places 
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';

-- Step 2: Update existing places with placeholder address (if any exist)
UPDATE places 
SET address = CONCAT(city, ', India') 
WHERE address = '' OR address IS NULL;

-- Step 3: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'places' 
  AND column_name = 'address';

-- Success message
SELECT '✅ Address column added successfully to places table!' as status;