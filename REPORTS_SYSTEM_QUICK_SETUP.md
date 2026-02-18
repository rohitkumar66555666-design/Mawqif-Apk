# Reports System Quick Setup Guide

## ❌ ERROR ENCOUNTERED
```
ERROR: 42703: column "reported_by" does not exist
```

## 🔧 QUICK FIX

### Step 1: Run the Simple Setup Script
Copy and paste this SQL in your Supabase SQL Editor:

```sql
-- SIMPLE REVIEW REPORTS SYSTEM SETUP
DROP TABLE IF EXISTS review_reports CASCADE;
DROP VIEW IF EXISTS review_reports_dashboard CASCADE;

-- Create review_reports table
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

-- Create indexes
CREATE INDEX idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX idx_review_reports_reported_by ON review_reports(reported_by);
CREATE INDEX idx_review_reports_status ON review_reports(status);

-- Add report_count to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Create dashboard view
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

SELECT 'Reports System Setup Complete!' as status;
```

### Step 2: Test the System
After running the SQL, the app will automatically detect the reports system and enable:
- ✅ Report button on reviews (flag icon)
- ✅ Report modal with categories
- ✅ Host dashboard reports management

## 🚨 ALTERNATIVE FILES TO USE

If you encounter issues, use these files in order:

1. **`SIMPLE_REVIEW_REPORTS_SETUP.sql`** - Basic setup (recommended)
2. **`DEBUG_REPORTS_TABLE.sql`** - Diagnose issues
3. **`CREATE_REVIEW_REPORTS_SYSTEM.sql`** - Full system (if simple version works)

## ✅ VERIFICATION

After setup, you should see:
- Report button (flag icon) next to like/dislike on reviews
- Reports management section in host dashboard (if you have reports)
- No more "column does not exist" errors

## 🔄 IF STILL HAVING ISSUES

1. Run `DEBUG_REPORTS_TABLE.sql` to see what's wrong
2. Check Supabase logs for detailed error messages
3. Ensure you're running SQL in the correct database
4. Try the nuclear option: drop and recreate the table

The app now handles missing tables gracefully and will show helpful error messages!