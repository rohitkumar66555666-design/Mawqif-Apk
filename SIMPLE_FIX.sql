-- ============================================
-- SIMPLE FIX - Just add the missing user_name column
-- ============================================

-- Add the missing user_name column
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) DEFAULT 'Anonymous User';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
SELECT 'user_name column added successfully!' as status;