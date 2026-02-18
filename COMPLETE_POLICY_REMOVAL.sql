-- ============================================
-- COMPLETE POLICY REMOVAL AND TYPE CHANGE
-- Remove ALL policies, change types, then recreate minimal policies
-- ============================================

-- Step 1: Disable RLS temporarily to avoid policy conflicts
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE places DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE host_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE place_edit_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE host_notifications DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (comprehensive list)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Step 3: Drop foreign key constraints
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_owner_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE host_analytics DROP CONSTRAINT IF EXISTS host_analytics_host_id_fkey;
ALTER TABLE place_edit_history DROP CONSTRAINT IF EXISTS place_edit_history_editor_id_fkey;
ALTER TABLE host_notifications DROP CONSTRAINT IF EXISTS host_notifications_host_id_fkey;

-- Step 4: Change column types from UUID to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE places ALTER COLUMN owner_id TYPE TEXT;
ALTER TABLE reviews ALTER COLUMN reviewer_id TYPE TEXT;
ALTER TABLE bookmarks ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE host_analytics ALTER COLUMN host_id TYPE TEXT;
ALTER TABLE place_edit_history ALTER COLUMN editor_id TYPE TEXT;
ALTER TABLE host_notifications ALTER COLUMN host_id TYPE TEXT;

-- Step 5: Recreate foreign key constraints
ALTER TABLE places ADD CONSTRAINT places_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_fkey 
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE host_analytics ADD CONSTRAINT host_analytics_host_id_fkey 
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE place_edit_history ADD CONSTRAINT place_edit_history_editor_id_fkey 
  FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE host_notifications ADD CONSTRAINT host_notifications_host_id_fkey 
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 6: Insert the current mock user
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
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  is_verified = EXCLUDED.is_verified;

-- Step 7: Re-enable RLS with simple policies for dev mode
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create very simple policies for dev mode (no auth checks)
CREATE POLICY "dev_users_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_places_all" ON places FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_reviews_all" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_bookmarks_all" ON bookmarks FOR ALL USING (true) WITH CHECK (true);

-- Success message
SELECT 'Database converted to TEXT IDs for dev mode! Test your app now.' as status;