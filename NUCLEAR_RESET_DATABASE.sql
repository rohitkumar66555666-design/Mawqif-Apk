-- ============================================
-- NUCLEAR RESET - DROP EVERYTHING AND START FRESH
-- This will completely reset your database for dev mode
-- ============================================

-- Step 1: Drop ALL tables (this removes all policies and constraints)
DROP TABLE IF EXISTS host_notifications CASCADE;
DROP TABLE IF EXISTS place_edit_history CASCADE;
DROP TABLE IF EXISTS host_analytics CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Create users table with TEXT id
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

-- Step 3: Create places table with TEXT owner_id
CREATE TABLE places (
  id TEXT PRIMARY KEY DEFAULT 'place_' || extract(epoch from now())::text,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  capacity INTEGER,
  amenities JSONB DEFAULT '{"wuzu": false, "washroom": false, "women_area": false}',
  contact_phone TEXT,
  whatsapp_number TEXT,
  primary_photo TEXT,
  photos JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMPTZ,
  avg_rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  opening_hours JSONB DEFAULT '{}'
);

-- Step 4: Create reviews table
CREATE TABLE reviews (
  id TEXT PRIMARY KEY DEFAULT 'review_' || extract(epoch from now())::text,
  place_id TEXT REFERENCES places(id) ON DELETE CASCADE,
  reviewer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  host_response TEXT,
  host_response_date TIMESTAMPTZ,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(place_id, reviewer_id)
);

-- Step 5: Create bookmarks table
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY DEFAULT 'bookmark_' || extract(epoch from now())::text,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  place_id TEXT REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Step 6: Insert the mock user
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

-- Step 7: Enable RLS with simple dev policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create simple policies for dev mode (no auth restrictions)
CREATE POLICY "dev_users_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_places_all" ON places FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_reviews_all" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_bookmarks_all" ON bookmarks FOR ALL USING (true) WITH CHECK (true);

-- Step 8: Test everything works
SELECT 
  'SUCCESS!' as status,
  id,
  name,
  is_host,
  total_places_added
FROM users 
WHERE id = 'mock_user_1766668547393';

-- Final message
SELECT 'Database completely reset for dev mode! All TEXT IDs, no UUID issues!' as final_status;