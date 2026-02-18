-- ============================================
-- FIX USER ID TYPE FOR DEV MODE
-- Change users.id from UUID to TEXT to accept mock user IDs
-- ============================================

-- First, drop the foreign key constraints that reference users.id
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_owner_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
ALTER TABLE host_analytics DROP CONSTRAINT IF EXISTS host_analytics_host_id_fkey;
ALTER TABLE place_edit_history DROP CONSTRAINT IF EXISTS place_edit_history_editor_id_fkey;
ALTER TABLE host_notifications DROP CONSTRAINT IF EXISTS host_notifications_host_id_fkey;

-- Change users.id from UUID to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE users ALTER COLUMN id SET DEFAULT 'user_' || extract(epoch from now())::text;

-- Change all foreign key columns to TEXT as well
ALTER TABLE places ALTER COLUMN owner_id TYPE TEXT;
ALTER TABLE reviews ALTER COLUMN reviewer_id TYPE TEXT;
ALTER TABLE bookmarks ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE host_analytics ALTER COLUMN host_id TYPE TEXT;
ALTER TABLE place_edit_history ALTER COLUMN editor_id TYPE TEXT;
ALTER TABLE host_notifications ALTER COLUMN host_id TYPE TEXT;

-- Recreate the foreign key constraints
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

-- Insert the current mock user if it doesn't exist
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

-- Update RLS policies to work with TEXT IDs
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Hosts can insert places" ON places;
CREATE POLICY "Hosts can insert places" ON places 
  FOR INSERT WITH CHECK (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Hosts can update own places" ON places;
CREATE POLICY "Hosts can update own places" ON places 
  FOR UPDATE USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Hosts can delete own places" ON places;
CREATE POLICY "Hosts can delete own places" ON places 
  FOR DELETE USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Success message
SELECT 'Database updated to accept mock user IDs! Test your app now.' as status;