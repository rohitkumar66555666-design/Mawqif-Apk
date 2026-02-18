-- ============================================
-- ADD PLACE STATUS MANAGEMENT COLUMNS
-- Add columns for manual open/closed status control
-- ============================================

-- Add status management columns to places table
DO $$
BEGIN
  -- Add is_open column (manual open/closed status)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'is_open'
  ) THEN
    ALTER TABLE places ADD COLUMN is_open BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added is_open column';
  END IF;

  -- Add status_message column (reason for closure)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'status_message'
  ) THEN
    ALTER TABLE places ADD COLUMN status_message TEXT;
    RAISE NOTICE 'Added status_message column';
  END IF;

  -- Add status_updated_at column (when status was last changed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'status_updated_at'
  ) THEN
    ALTER TABLE places ADD COLUMN status_updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added status_updated_at column';
  END IF;

  -- Add status_updated_by column (who changed the status)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'status_updated_by'
  ) THEN
    ALTER TABLE places ADD COLUMN status_updated_by TEXT REFERENCES users(id);
    RAISE NOTICE 'Added status_updated_by column';
  END IF;
END $$;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_places_is_open ON places(is_open);
CREATE INDEX IF NOT EXISTS idx_places_status_updated_at ON places(status_updated_at);

-- Show updated places table structure
SELECT 
  'Updated places columns' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'places'
AND column_name IN ('is_open', 'status_message', 'status_updated_at', 'status_updated_by')
ORDER BY ordinal_position;

-- Success message
SELECT 'Place status management columns added successfully!' as status;