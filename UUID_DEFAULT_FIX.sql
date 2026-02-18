-- ============================================
-- SET DEFAULT UUID FOR user_id COLUMN
-- ============================================

-- Set default UUID generation for user_id column
ALTER TABLE reviews ALTER COLUMN user_id SET DEFAULT gen_random_uuid();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
SELECT 'user_id now has UUID default value!' as status;