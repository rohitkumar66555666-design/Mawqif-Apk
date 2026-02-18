-- ============================================
-- HOST SECTION SUPABASE DATABASE SETUP
-- Complete SQL setup for host management features
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (Enhanced for Host Features)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  display_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE, -- Track if user is a host
  host_since TIMESTAMPTZ, -- When they became a host
  total_places_added INTEGER DEFAULT 0, -- Cache count for performance
  total_reviews_received INTEGER DEFAULT 0, -- Reviews on their places
  host_rating DECIMAL(3,2) DEFAULT 0.0, -- Average rating as a host
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PLACES TABLE (Enhanced with Host Features)
-- ============================================
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Host who added this place
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('masjid', 'musalla', 'home', 'office', 'shop', 'other')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  capacity INTEGER,
  amenities JSONB DEFAULT '{"wuzu": false, "washroom": false, "women_area": false}',
  
  -- Contact Information
  contact_phone TEXT,
  whatsapp_number TEXT,
  
  -- Images (Multiple photos support)
  primary_photo TEXT, -- Main photo URL
  photos JSONB DEFAULT '[]', -- Array of photo URLs
  
  -- Status and Verification
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- Admin verification
  verification_date TIMESTAMPTZ,
  
  -- Statistics (cached for performance)
  avg_rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Opening Hours (Optional)
  opening_hours JSONB DEFAULT '{}'
);

-- ============================================
-- 3. HOST ANALYTICS TABLE
-- Track host performance and statistics
-- ============================================
CREATE TABLE IF NOT EXISTS host_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Monthly Statistics
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  places_added INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(host_id, month_year)
);

-- ============================================
-- 4. PLACE EDIT HISTORY TABLE
-- Track all edits made to places by hosts
-- ============================================
CREATE TABLE IF NOT EXISTS place_edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- What was changed
  field_changed TEXT NOT NULL, -- 'title', 'address', 'photos', 'amenities', etc.
  old_value JSONB, -- Previous value
  new_value JSONB, -- New value
  
  -- Edit metadata
  edit_reason TEXT, -- Optional reason for edit
  ip_address INET, -- For security tracking
  user_agent TEXT, -- Browser/app info
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. REVIEWS TABLE (Enhanced for Host Features)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  
  -- Review Status
  is_approved BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  
  -- Host Response
  host_response TEXT, -- Host can respond to reviews
  host_response_date TIMESTAMPTZ,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews from same user for same place
  UNIQUE(place_id, reviewer_id)
);

-- ============================================
-- 6. BOOKMARKS TABLE
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
-- 7. HOST NOTIFICATIONS TABLE
-- Notifications for hosts about their places
-- ============================================
CREATE TABLE IF NOT EXISTS host_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  
  -- Notification Details
  type TEXT NOT NULL CHECK (type IN ('new_review', 'place_bookmarked', 'place_flagged', 'verification_status', 'monthly_report')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Additional data (review_id, etc.)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Places indexes
CREATE INDEX IF NOT EXISTS idx_places_owner_id ON places(owner_id);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_places_type ON places(type);
CREATE INDEX IF NOT EXISTS idx_places_active ON places(is_active);
CREATE INDEX IF NOT EXISTS idx_places_created_at ON places(created_at);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_place_id ON bookmarks(place_id);

-- Host analytics indexes
CREATE INDEX IF NOT EXISTS idx_host_analytics_host_id ON host_analytics(host_id);
CREATE INDEX IF NOT EXISTS idx_host_analytics_month_year ON host_analytics(month_year);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_host_notifications_host_id ON host_notifications(host_id);
CREATE INDEX IF NOT EXISTS idx_host_notifications_unread ON host_notifications(host_id, is_read);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update user's total_places_added count
CREATE OR REPLACE FUNCTION update_user_places_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count and set as host
    UPDATE users 
    SET 
      total_places_added = total_places_added + 1,
      is_host = TRUE,
      host_since = COALESCE(host_since, NOW()),
      updated_at = NOW()
    WHERE id = NEW.owner_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count
    UPDATE users 
    SET 
      total_places_added = GREATEST(total_places_added - 1, 0),
      updated_at = NOW()
    WHERE id = OLD.owner_id;
    
    -- If no places left, remove host status
    UPDATE users 
    SET is_host = FALSE 
    WHERE id = OLD.owner_id AND total_places_added = 0;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for places count
DROP TRIGGER IF EXISTS trigger_update_places_count ON places;
CREATE TRIGGER trigger_update_places_count
  AFTER INSERT OR DELETE ON places
  FOR EACH ROW
  EXECUTE FUNCTION update_user_places_count();

-- Function to update place statistics
CREATE OR REPLACE FUNCTION update_place_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New review added
    UPDATE places 
    SET 
      total_reviews = total_reviews + 1,
      avg_rating = (
        SELECT ROUND(AVG(rating)::numeric, 2) 
        FROM reviews 
        WHERE place_id = NEW.place_id AND is_approved = TRUE
      ),
      updated_at = NOW()
    WHERE id = NEW.place_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Review deleted
    UPDATE places 
    SET 
      total_reviews = GREATEST(total_reviews - 1, 0),
      avg_rating = COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 2) 
        FROM reviews 
        WHERE place_id = OLD.place_id AND is_approved = TRUE
      ), 0),
      updated_at = NOW()
    WHERE id = OLD.place_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for review statistics
DROP TRIGGER IF EXISTS trigger_update_place_stats ON reviews;
CREATE TRIGGER trigger_update_place_stats
  AFTER INSERT OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_place_stats();

-- Function to update bookmark count
CREATE OR REPLACE FUNCTION update_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE places 
    SET 
      total_bookmarks = total_bookmarks + 1,
      updated_at = NOW()
    WHERE id = NEW.place_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE places 
    SET 
      total_bookmarks = GREATEST(total_bookmarks - 1, 0),
      updated_at = NOW()
    WHERE id = OLD.place_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookmark count
DROP TRIGGER IF EXISTS trigger_update_bookmark_count ON bookmarks;
CREATE TRIGGER trigger_update_bookmark_count
  AFTER INSERT OR DELETE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_bookmark_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_places_updated_at ON places;
CREATE TRIGGER trigger_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Places policies
CREATE POLICY "Anyone can view active places" ON places FOR SELECT USING (is_active = true);
CREATE POLICY "Hosts can insert places" ON places FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);
CREATE POLICY "Hosts can update own places" ON places FOR UPDATE USING (auth.uid()::text = owner_id::text);
CREATE POLICY "Hosts can delete own places" ON places FOR DELETE USING (auth.uid()::text = owner_id::text);

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = reviewer_id::text);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid()::text = reviewer_id::text);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid()::text = reviewer_id::text);

-- Bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid()::text = user_id::text);

-- Host analytics policies
CREATE POLICY "Hosts can view own analytics" ON host_analytics FOR SELECT USING (auth.uid()::text = host_id::text);

-- Place edit history policies
CREATE POLICY "Hosts can view edit history of own places" ON place_edit_history 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM places 
    WHERE places.id = place_edit_history.place_id 
    AND places.owner_id::text = auth.uid()::text
  )
);

-- Host notifications policies
CREATE POLICY "Hosts can manage own notifications" ON host_notifications FOR ALL USING (auth.uid()::text = host_id::text);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- Create storage bucket for place images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for place images
CREATE POLICY "Anyone can view place images" ON storage.objects FOR SELECT USING (bucket_id = 'place-images');
CREATE POLICY "Authenticated users can upload place images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'place-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own place images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'place-images' AND auth.uid()::text = owner::text
);
CREATE POLICY "Users can delete own place images" ON storage.objects FOR DELETE USING (
  bucket_id = 'place-images' AND auth.uid()::text = owner::text
);

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample user (replace with your actual user ID)
-- INSERT INTO users (id, phone_number, name, display_name, is_verified) 
-- VALUES ('your-user-id-here', '+1234567890', 'Test Host', 'Test Host', true)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USEFUL QUERIES FOR HOST DASHBOARD
-- ============================================

-- Get host statistics
/*
SELECT 
  u.name,
  u.total_places_added,
  u.host_since,
  u.host_rating,
  COUNT(DISTINCT r.id) as total_reviews_received,
  COUNT(DISTINCT b.id) as total_bookmarks_received
FROM users u
LEFT JOIN places p ON p.owner_id = u.id
LEFT JOIN reviews r ON r.place_id = p.id
LEFT JOIN bookmarks b ON b.place_id = p.id
WHERE u.id = 'your-user-id'
GROUP BY u.id, u.name, u.total_places_added, u.host_since, u.host_rating;
*/

-- Get host's places with statistics
/*
SELECT 
  p.*,
  COUNT(DISTINCT r.id) as review_count,
  COUNT(DISTINCT b.id) as bookmark_count,
  AVG(r.rating) as avg_rating
FROM places p
LEFT JOIN reviews r ON r.place_id = p.id AND r.is_approved = true
LEFT JOIN bookmarks b ON b.place_id = p.id
WHERE p.owner_id = 'your-user-id'
GROUP BY p.id
ORDER BY p.created_at DESC;
*/

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- Database setup complete!
-- Next steps:
-- 1. Run this SQL in your Supabase SQL editor
-- 2. Update your app's PlacesService to use owner_id
-- 3. Test the host features in your app
-- 4. Replace 'your-user-id' with actual user IDs in sample queries

SELECT 'HOST SECTION DATABASE SETUP COMPLETED SUCCESSFULLY!' as status;