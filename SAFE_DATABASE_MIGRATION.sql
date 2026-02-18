-- ============================================
-- SAFE DATABASE MIGRATION
-- This will work with existing tables and add missing columns
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE OR UPDATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to users table (safe - won't error if they exist)
DO $$ 
BEGIN
  -- Add is_verified column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified') THEN
    ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add is_host column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_host') THEN
    ALTER TABLE users ADD COLUMN is_host BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add host_since column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'host_since') THEN
    ALTER TABLE users ADD COLUMN host_since TIMESTAMPTZ;
  END IF;
  
  -- Add total_places_added column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_places_added') THEN
    ALTER TABLE users ADD COLUMN total_places_added INTEGER DEFAULT 0;
  END IF;
  
  -- Add total_reviews_received column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_reviews_received') THEN
    ALTER TABLE users ADD COLUMN total_reviews_received INTEGER DEFAULT 0;
  END IF;
  
  -- Add host_rating column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'host_rating') THEN
    ALTER TABLE users ADD COLUMN host_rating DECIMAL(3,2) DEFAULT 0.0;
  END IF;
END $$;

-- ============================================
-- 2. CREATE OR UPDATE PLACES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to places table (safe - won't error if they exist)
DO $$ 
BEGIN
  -- Add owner_id column (CRITICAL for host features)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'owner_id') THEN
    ALTER TABLE places ADD COLUMN owner_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add is_active column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'is_active') THEN
    ALTER TABLE places ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add is_verified column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'is_verified') THEN
    ALTER TABLE places ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add capacity column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'capacity') THEN
    ALTER TABLE places ADD COLUMN capacity INTEGER;
  END IF;
  
  -- Add amenities column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'amenities') THEN
    ALTER TABLE places ADD COLUMN amenities JSONB DEFAULT '{"wuzu": false, "washroom": false, "women_area": false}';
  END IF;
  
  -- Add contact_phone column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'contact_phone') THEN
    ALTER TABLE places ADD COLUMN contact_phone TEXT;
  END IF;
  
  -- Add whatsapp_number column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE places ADD COLUMN whatsapp_number TEXT;
  END IF;
  
  -- Add primary_photo column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'primary_photo') THEN
    ALTER TABLE places ADD COLUMN primary_photo TEXT;
  END IF;
  
  -- Add photos column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'photos') THEN
    ALTER TABLE places ADD COLUMN photos JSONB DEFAULT '[]';
  END IF;
  
  -- Add statistics columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'avg_rating') THEN
    ALTER TABLE places ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'total_reviews') THEN
    ALTER TABLE places ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'total_bookmarks') THEN
    ALTER TABLE places ADD COLUMN total_bookmarks INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'view_count') THEN
    ALTER TABLE places ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
  
  -- Add last_edited_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'last_edited_at') THEN
    ALTER TABLE places ADD COLUMN last_edited_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Add verification_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'verification_date') THEN
    ALTER TABLE places ADD COLUMN verification_date TIMESTAMPTZ;
  END IF;
  
  -- Add opening_hours column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'places' AND column_name = 'opening_hours') THEN
    ALTER TABLE places ADD COLUMN opening_hours JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- 3. CREATE REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- ============================================
-- 4. CREATE BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- ============================================
-- 5. CREATE HOST ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS host_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  places_added INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, month_year)
);

-- ============================================
-- 6. CREATE PLACE EDIT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS place_edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  field_changed TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  edit_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. CREATE HOST NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS host_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_review', 'place_bookmarked', 'place_flagged', 'verification_status', 'monthly_report')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. CREATE STORAGE BUCKET (SAFE)
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. CREATE BASIC POLICIES (SAFE)
-- ============================================

-- Drop existing policies if they exist (safe)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view active places" ON places;
DROP POLICY IF EXISTS "Hosts can insert places" ON places;
DROP POLICY IF EXISTS "Hosts can update own places" ON places;
DROP POLICY IF EXISTS "Hosts can delete own places" ON places;

-- Create policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Anyone can view active places" ON places FOR SELECT USING (is_active = true);
CREATE POLICY "Hosts can insert places" ON places FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);
CREATE POLICY "Hosts can update own places" ON places FOR UPDATE USING (auth.uid()::text = owner_id::text);
CREATE POLICY "Hosts can delete own places" ON places FOR DELETE USING (auth.uid()::text = owner_id::text);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'SAFE MIGRATION COMPLETED SUCCESSFULLY! Your existing data is preserved.' as status;