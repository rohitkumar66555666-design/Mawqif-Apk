-- ============================================
-- RECREATE USERS TABLE WITH TEXT ID
-- Drop and recreate the users table to fix the UUID issue
-- ============================================

-- Step 1: Drop the users table completely (this will cascade and remove foreign keys)
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create users table with TEXT id (not UUID)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone_number TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  display_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE,
  host_since TIMESTAMPTZ,
  total_places_added INTEGER DEFAULT 0,
  total_reviews_received INTEGER DEFAULT 0,
  host_rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Insert the mock user
INSERT INTO users (
  id, 
  phone_number, 
  name, 
  display_name, 
  is_verified, 
  is_host,
  total_places_added
) VALUES (
  'mock_user_1766668547393',
  '+1234567890',
  'Test User',
  'Test User',
  true,
  false,
  0
);

-- Step 4: Update places table to use TEXT for owner_id (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'places') THEN
    -- Change owner_id to TEXT type
    ALTER TABLE places ALTER COLUMN owner_id TYPE TEXT;
    
    -- Add foreign key constraint back
    ALTER TABLE places ADD CONSTRAINT places_owner_id_fkey 
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 5: Enable RLS with simple policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_users_all" ON users FOR ALL USING (true) WITH CHECK (true);

-- Step 6: Test the mock user
SELECT 
  'SUCCESS!' as status,
  id,
  name,
  is_host,
  total_places_added
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Success message
SELECT 'Users table recreated with TEXT IDs! Your app should work now.' as final_status;