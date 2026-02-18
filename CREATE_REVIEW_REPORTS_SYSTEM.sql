-- CREATE REVIEW REPORTS SYSTEM
-- This creates a comprehensive reporting system for tracking abusive or inappropriate reviews

-- 1. Create review_reports table
CREATE TABLE IF NOT EXISTS review_reports (
  id TEXT PRIMARY KEY DEFAULT ('report_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 8)),
  review_id TEXT NOT NULL,
  reported_by TEXT NOT NULL, -- User who reported
  report_reason TEXT NOT NULL, -- Reason for reporting
  report_category TEXT NOT NULL, -- Category: spam, abuse, inappropriate, fake, etc.
  additional_details TEXT, -- Optional additional details
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT, -- Admin/moderator who reviewed
  resolution_notes TEXT, -- Notes from admin/moderator
  
  -- Foreign key constraints
  CONSTRAINT fk_review_reports_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_reports_reporter FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_reported_by ON review_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);
CREATE INDEX IF NOT EXISTS idx_review_reports_created_at ON review_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_reports_category ON review_reports(report_category);

-- 3. Add report_count column to reviews table for quick access
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- 4. Create trigger to update report_count when reports are added/removed
CREATE OR REPLACE FUNCTION update_review_report_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews 
    SET report_count = report_count + 1 
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews 
    SET report_count = GREATEST(report_count - 1, 0) 
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers
DROP TRIGGER IF EXISTS trigger_update_review_report_count_insert ON review_reports;
CREATE TRIGGER trigger_update_review_report_count_insert
  AFTER INSERT ON review_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_review_report_count();

DROP TRIGGER IF EXISTS trigger_update_review_report_count_delete ON review_reports;
CREATE TRIGGER trigger_update_review_report_count_delete
  AFTER DELETE ON review_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_review_report_count();

-- 6. Create view for easy reporting dashboard
CREATE OR REPLACE VIEW review_reports_dashboard AS
SELECT 
  rr.id as report_id,
  rr.review_id,
  rr.report_reason,
  rr.report_category,
  rr.status,
  rr.created_at as reported_at,
  rr.additional_details,
  
  -- Review details
  r.comment as review_comment,
  r.rating as review_rating,
  r.user_name as reviewer_name,
  r.created_at as review_created_at,
  
  -- Place details
  p.title as place_name,
  p.owner_id as place_owner_id,
  
  -- Reporter details
  u.full_name as reporter_name,
  rr.reported_by as reporter_id
  
FROM review_reports rr
LEFT JOIN reviews r ON rr.review_id = r.id
LEFT JOIN places p ON r.place_id = p.id
LEFT JOIN users u ON rr.reported_by = u.id
ORDER BY rr.created_at DESC;

-- 7. Insert some sample report categories for reference
INSERT INTO review_reports (review_id, reported_by, report_reason, report_category, additional_details, status) 
VALUES 
  ('sample_review_1', 'sample_user_1', 'Spam Content', 'spam', 'This review contains promotional content', 'pending'),
  ('sample_review_2', 'sample_user_2', 'Abusive Language', 'abuse', 'Contains inappropriate language', 'pending'),
  ('sample_review_3', 'sample_user_3', 'Fake Review', 'fake', 'Suspicious review pattern', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 8. Test the system
SELECT 'Review Reports System Created Successfully!' as status;

-- 9. Show sample data structure
SELECT 
  'Sample Report Categories:' as info,
  'spam, abuse, inappropriate, fake, harassment, off-topic' as categories;

-- 10. Verify tables exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'review_reports' 
ORDER BY ordinal_position;