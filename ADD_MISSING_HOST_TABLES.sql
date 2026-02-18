-- ============================================
-- ADD MISSING HOST TABLES
-- Create the remaining tables for host features
-- ============================================

-- 1. Host Analytics Table
CREATE TABLE IF NOT EXISTS host_analytics (
  id TEXT PRIMARY KEY DEFAULT 'analytics_' || extract(epoch from now())::text,
  host_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  places_added INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_bookmarks INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, month_year)
);

-- 2. Place Edit History Table
CREATE TABLE IF NOT EXISTS place_edit_history (
  id TEXT PRIMARY KEY DEFAULT 'edit_' || extract(epoch from now())::text,
  place_id TEXT REFERENCES places(id) ON DELETE CASCADE,
  editor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  field_changed TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  edit_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Host Notifications Table
CREATE TABLE IF NOT EXISTS host_notifications (
  id TEXT PRIMARY KEY DEFAULT 'notification_' || extract(epoch from now())::text,
  host_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  place_id TEXT REFERENCES places(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_review', 'place_bookmarked', 'place_flagged', 'verification_status', 'monthly_report')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on new tables
ALTER TABLE host_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create simple dev policies
CREATE POLICY "dev_host_analytics_all" ON host_analytics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_place_edit_history_all" ON place_edit_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_host_notifications_all" ON host_notifications FOR ALL USING (true) WITH CHECK (true);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_host_analytics_host_id ON host_analytics(host_id);
CREATE INDEX IF NOT EXISTS idx_place_edit_history_place_id ON place_edit_history(place_id);
CREATE INDEX IF NOT EXISTS idx_host_notifications_host_id ON host_notifications(host_id);

-- 7. Create storage bucket for place images (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Test that everything is created
SELECT 'Host tables created successfully!' as status;

-- 9. Show all tables now
SELECT 
  'Available Tables' as info,
  table_name as name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;