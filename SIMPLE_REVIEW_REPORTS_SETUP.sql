-- SIMPLE REVIEW REPORTS SYSTEM SETUP
-- This creates a basic but functional reporting system

-- 1. First, check if the table exists and drop it if needed
DROP TABLE IF EXISTS review_reports CASCADE;
DROP VIEW IF EXISTS review_reports_dashboard CASCADE;

-- 2. Create review_reports table (simple version without foreign keys initially)
CREATE TABLE review_reports (
  id TEXT PRIMARY KEY DEFAULT ('report_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 8)),
  review_id TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  report_reason TEXT NOT NULL,
  report_category TEXT NOT NULL,
  additional_details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  resolution_notes TEXT
);

-- 3. Create indexes for better performance
CREATE INDEX idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX idx_review_reports_reported_by ON review_reports(reported_by);
CREATE INDEX idx_review_reports_status ON review_reports(status);
CREATE INDEX idx_review_reports_created_at ON review_reports(created_at DESC);
CREATE INDEX idx_review_reports_category ON review_reports(report_category);

-- 4. Add report_count column to reviews table if it doesn't exist
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- 5. Create a simple view for dashboard (without complex joins initially)
CREATE OR REPLACE VIEW review_reports_dashboard AS
SELECT 
  rr.id as report_id,
  rr.review_id,
  rr.report_reason,
  rr.report_category,
  rr.status,
  rr.created_at as reported_at,
  rr.additional_details,
  rr.reported_by as reporter_id
FROM review_reports rr
ORDER BY rr.created_at DESC;

-- 6. Insert some test data to verify the system works
INSERT INTO review_reports (
  review_id, 
  reported_by, 
  report_reason, 
  report_category, 
  additional_details, 
  status
) VALUES 
  ('test_review_1', 'mock_user_1766736481865', 'Spam Content', 'spam', 'This review contains promotional content', 'pending'),
  ('test_review_2', 'mock_user_1766736481865', 'Abusive Language', 'abuse', 'Contains inappropriate language', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 7. Test the system
SELECT 'Review Reports System Created Successfully!' as status;

-- 8. Show the table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'review_reports' 
ORDER BY ordinal_position;

-- 9. Show sample data
SELECT 
  id,
  report_category,
  report_reason,
  status,
  created_at
FROM review_reports
LIMIT 5;

-- 10. Test the dashboard view
SELECT 
  report_id,
  report_category,
  status,
  reported_at
FROM review_reports_dashboard
LIMIT 3;