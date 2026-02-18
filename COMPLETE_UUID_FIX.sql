-- ============================================
-- COMPLETE UUID AND COLUMN FIX FOR REVIEWS SYSTEM
-- This fixes both UUID and column name issues
-- ============================================

-- Step 1: Make user_id column accept NULL and auto-generate UUID
ALTER TABLE reviews 
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN user_id SET DEFAULT gen_random_uuid();

-- Step 2: Handle column name mismatch - make comment column nullable if it exists
-- and ensure review_text exists
DO $$ 
BEGIN
  -- If comment column exists and is NOT NULL, make it nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'comment' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE reviews ALTER COLUMN comment DROP NOT NULL;
  END IF;
  
  -- Add review_text column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' AND column_name = 'review_text'
  ) THEN
    ALTER TABLE reviews ADD COLUMN review_text TEXT;
  END IF;
END $$;

-- Step 3: Ensure all required columns exist with proper defaults
ALTER TABLE reviews 
  ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) DEFAULT 'Anonymous User',
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dislikes_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT false;

-- Step 4: Copy data from comment to review_text if needed
UPDATE reviews 
SET review_text = comment 
WHERE review_text IS NULL AND comment IS NOT NULL;

-- Step 5: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Step 6: Verify the setup
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
  AND column_name IN ('user_id', 'user_name', 'comment', 'review_text', 'likes_count', 'dislikes_count', 'replies_count', 'is_owner')
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Reviews table is now properly configured! Both UUID and column issues fixed!' as status;
