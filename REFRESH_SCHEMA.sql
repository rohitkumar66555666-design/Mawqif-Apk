-- ============================================
-- REFRESH SUPABASE SCHEMA CACHE
-- Run this to fix PGRST204 error
-- ============================================

-- This will force Supabase to reload the schema
NOTIFY pgrst, 'reload schema';

-- Verify the reviews table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- Success message
SELECT 'Schema refreshed! Try adding a review now.' as status;