-- ============================================
-- FIX REVIEWS COLUMN MISMATCH
-- Add comment column and copy data from review_text
-- ============================================

-- Step 1: Add comment column to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT;

-- Step 2: Copy data from review_text to comment (if review_text has data)
UPDATE reviews SET comment = review_text WHERE review_text IS NOT NULL AND comment IS NULL;

-- Step 3: Make comment column NOT NULL (after copying data)
ALTER TABLE reviews ALTER COLUMN comment SET NOT NULL;

-- Step 4: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Step 5: Verify the fix
SELECT 'Reviews table now has both review_text and comment columns!' as status;

-- Step 6: Show table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
ORDER BY ordinal_position;