-- ============================================
-- ADD MISSING COLUMNS TO PLACES TABLE
-- Add photo and other missing columns that the app expects
-- ============================================

-- Check current places table structure
SELECT 
  'Current places columns' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'places'
ORDER BY ordinal_position;

-- Add missing columns to places table
DO $$
BEGIN
  -- Add photo column (single photo URL)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'photo'
  ) THEN
    ALTER TABLE places ADD COLUMN photo TEXT;
    RAISE NOTICE 'Added photo column';
  END IF;

  -- Add primary_photo column (main photo URL)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'primary_photo'
  ) THEN
    ALTER TABLE places ADD COLUMN primary_photo TEXT;
    RAISE NOTICE 'Added primary_photo column';
  END IF;

  -- Add photos column (array of photo URLs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'photos'
  ) THEN
    ALTER TABLE places ADD COLUMN photos JSONB DEFAULT '[]';
    RAISE NOTICE 'Added photos column';
  END IF;

  -- Add owner_id column if missing (critical for host features)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE places ADD COLUMN owner_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added owner_id column';
  END IF;

  -- Add other missing columns that the app might expect
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'amenities'
  ) THEN
    ALTER TABLE places ADD COLUMN amenities JSONB DEFAULT '{"wuzu": false, "washroom": false, "women_area": false}';
    RAISE NOTICE 'Added amenities column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE places ADD COLUMN contact_phone TEXT;
    RAISE NOTICE 'Added contact_phone column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE places ADD COLUMN whatsapp_number TEXT;
    RAISE NOTICE 'Added whatsapp_number column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE places ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added is_active column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE places ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_verified column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'avg_rating'
  ) THEN
    ALTER TABLE places ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.0;
    RAISE NOTICE 'Added avg_rating column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'total_reviews'
  ) THEN
    ALTER TABLE places ADD COLUMN total_reviews INTEGER DEFAULT 0;
    RAISE NOTICE 'Added total_reviews column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'total_bookmarks'
  ) THEN
    ALTER TABLE places ADD COLUMN total_bookmarks INTEGER DEFAULT 0;
    RAISE NOTICE 'Added total_bookmarks column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE places ADD COLUMN view_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added view_count column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'last_edited_at'
  ) THEN
    ALTER TABLE places ADD COLUMN last_edited_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added last_edited_at column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'verification_date'
  ) THEN
    ALTER TABLE places ADD COLUMN verification_date TIMESTAMPTZ;
    RAISE NOTICE 'Added verification_date column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'opening_hours'
  ) THEN
    ALTER TABLE places ADD COLUMN opening_hours JSONB DEFAULT '{}';
    RAISE NOTICE 'Added opening_hours column';
  END IF;

END $$;

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
ORDER BY ordinal_position;

-- Success message
SELECT 'Missing columns added to places table! Try adding a place now.' as status;