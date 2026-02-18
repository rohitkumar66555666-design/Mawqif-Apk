-- ============================================
-- SAFE FIX USER ID TYPE FOR DEV MODE
-- Drop policies first, then change types, then recreate policies
-- ============================================

-- Step 1: Drop ALL policies that depend on the id columns
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view active places" ON places;
DROP POLICY IF EXISTS "Hosts can insert places" ON places;
DROP POLICY IF EXISTS "Hosts can update own places" ON places;
DROP POLICY IF EXISTS "Hosts can delete own places" ON places;
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Hosts can view own analytics" ON host_analytics;
DROP POLICY IF EXISTS "Hosts can view edit history of own places" ON place_edit_history;
DROP POLICY IF EXISTS "Hosts can manage own notifications" ON host_notifications;

-- Step 2: Drop foreign key constraints
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_owner_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE host_analytics DROP CONSTRAINT IF EXISTS host_analytics_host_id_fkey;
ALTER TABLE place_edit_history DROP CONSTRAINT IF EXISTS place_edit_history_editor_id_fkey;
ALTER TABLE host_notifications DROP CONSTRAINT IF EXISTS host_notifications_host_id_fkey;

-- Step 3: Change column types from UUID to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE places ALTER COLUMN owner_id TYPE TEXT;
ALTER TABLE reviews ALTER COLUMN reviewer_id TYPE TEXT;
ALTER TABLE bookmarks ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE host_analytics ALTER COLUMN host_id TYPE TEXT;
ALTER TABLE place_edit_history ALTER COLUMN editor_id TYPE TEXT;
ALTER TABLE host_notifications ALTER COLUMN host_id TYPE TEXT;

-- Step 4: Recreate foreign key constraints
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

-- Step 5: Insert the current mock user
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

-- Step 6: Recreate basic policies (simplified for dev mode)
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true); -- Simplified for dev
CREATE POLICY "Anyone can view active places" ON places FOR SELECT USING (is_active = true);
CREATE POLICY "Hosts can insert places" ON places FOR INSERT WITH CHECK (true); -- Simplified for dev
CREATE POLICY "Hosts can update own places" ON places FOR UPDATE USING (true); -- Simplified for dev
CREATE POLICY "Hosts can delete own places" ON places FOR DELETE USING (true); -- Simplified for dev

-- Success message
SELECT 'Database updated for dev mode! Mock user IDs now supported.' as status;