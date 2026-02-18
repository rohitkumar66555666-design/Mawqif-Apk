-- ============================================
-- SAFE VERSION - ADD MISSING COLUMNS
-- Compatible with all PostgreSQL versions
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Add columns one by one (safe approach)
DO $$
BEGIN
    -- Add contact_phone column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'contact_phone'
    ) THEN
        ALTER TABLE places ADD COLUMN contact_phone TEXT;
        RAISE NOTICE '✅ Added contact_phone column';
    ELSE
        RAISE NOTICE '⚠️ contact_phone column already exists';
    END IF;

    -- Add whatsapp_number column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'whatsapp_number'
    ) THEN
        ALTER TABLE places ADD COLUMN whatsapp_number TEXT;
        RAISE NOTICE '✅ Added whatsapp_number column';
    ELSE
        RAISE NOTICE '⚠️ whatsapp_number column already exists';
    END IF;

    -- Add address column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'address'
    ) THEN
        ALTER TABLE places ADD COLUMN address TEXT;
        RAISE NOTICE '✅ Added address column';
    ELSE
        RAISE NOTICE '⚠️ address column already exists';
    END IF;

    -- Add is_open column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'is_open'
    ) THEN
        ALTER TABLE places ADD COLUMN is_open BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ Added is_open column';
    ELSE
        RAISE NOTICE '⚠️ is_open column already exists';
    END IF;

    -- Add avg_rating column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'avg_rating'
    ) THEN
        ALTER TABLE places ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.0;
        RAISE NOTICE '✅ Added avg_rating column';
    ELSE
        RAISE NOTICE '⚠️ avg_rating column already exists';
    END IF;

    -- Add review_count column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'review_count'
    ) THEN
        ALTER TABLE places ADD COLUMN review_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added review_count column';
    ELSE
        RAISE NOTICE '⚠️ review_count column already exists';
    END IF;

    -- Add opening_hours column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'opening_hours'
    ) THEN
        ALTER TABLE places ADD COLUMN opening_hours JSONB;
        RAISE NOTICE '✅ Added opening_hours column';
    ELSE
        RAISE NOTICE '⚠️ opening_hours column already exists';
    END IF;

    -- Add photos column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'photos'
    ) THEN
        ALTER TABLE places ADD COLUMN photos TEXT[];
        RAISE NOTICE '✅ Added photos column';
    ELSE
        RAISE NOTICE '⚠️ photos column already exists';
    END IF;

    -- Add owner_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'places' AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE places ADD COLUMN owner_id UUID;
        RAISE NOTICE '✅ Added owner_id column';
    ELSE
        RAISE NOTICE '⚠️ owner_id column already exists';
    END IF;

END $$;

-- Step 2: Update existing records with default values
UPDATE places 
SET 
  is_open = COALESCE(is_open, true),
  avg_rating = COALESCE(avg_rating, 0.0),
  review_count = COALESCE(review_count, 0);

-- Step 3: Add comments for documentation
DO $$
BEGIN
    EXECUTE 'COMMENT ON COLUMN places.contact_phone IS ''Phone number for calling the place''';
    EXECUTE 'COMMENT ON COLUMN places.whatsapp_number IS ''WhatsApp number for messaging''';
    EXECUTE 'COMMENT ON COLUMN places.address IS ''Full street address of the place''';
    EXECUTE 'COMMENT ON COLUMN places.is_open IS ''Whether the place is currently open''';
    EXECUTE 'COMMENT ON COLUMN places.opening_hours IS ''JSON object with opening hours for each day''';
    EXECUTE 'COMMENT ON COLUMN places.photos IS ''Array of photo URLs for the place''';
    EXECUTE 'COMMENT ON COLUMN places.avg_rating IS ''Average rating from reviews (0.0 to 5.0)''';
    EXECUTE 'COMMENT ON COLUMN places.review_count IS ''Total number of reviews''';
    EXECUTE 'COMMENT ON COLUMN places.owner_id IS ''ID of the user who owns/manages this place''';
    RAISE NOTICE '✅ Added column comments';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Could not add comments (this is OK)';
END $$;

-- Step 4: Create indexes for performance (safe approach)
DO $$
BEGIN
    -- Index for contact phone
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'places' AND indexname = 'idx_places_contact_phone'
    ) THEN
        CREATE INDEX idx_places_contact_phone ON places(contact_phone);
        RAISE NOTICE '✅ Created contact_phone index';
    END IF;

    -- Index for WhatsApp number
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'places' AND indexname = 'idx_places_whatsapp_number'
    ) THEN
        CREATE INDEX idx_places_whatsapp_number ON places(whatsapp_number);
        RAISE NOTICE '✅ Created whatsapp_number index';
    END IF;

    -- Index for open status
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'places' AND indexname = 'idx_places_is_open'
    ) THEN
        CREATE INDEX idx_places_is_open ON places(is_open);
        RAISE NOTICE '✅ Created is_open index';
    END IF;

    -- Index for rating
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'places' AND indexname = 'idx_places_avg_rating'
    ) THEN
        CREATE INDEX idx_places_avg_rating ON places(avg_rating DESC);
        RAISE NOTICE '✅ Created avg_rating index';
    END IF;

    -- Index for owner
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'places' AND indexname = 'idx_places_owner_id'
    ) THEN
        CREATE INDEX idx_places_owner_id ON places(owner_id);
        RAISE NOTICE '✅ Created owner_id index';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Some indexes could not be created (this is OK)';
END $$;

-- Step 5: Verify all columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'places' 
ORDER BY ordinal_position;

-- Step 6: Show sample data
SELECT 
    id,
    title,
    contact_phone,
    whatsapp_number,
    address,
    is_open,
    avg_rating,
    review_count
FROM places 
LIMIT 3;

-- Step 7: Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ============================================';
    RAISE NOTICE '✅ SUCCESSFULLY ADDED ALL MISSING COLUMNS!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '📱 contact_phone - For call buttons';
    RAISE NOTICE '💬 whatsapp_number - For WhatsApp buttons';
    RAISE NOTICE '📍 address - For full address display';
    RAISE NOTICE '🕐 is_open - For open/closed status';
    RAISE NOTICE '⭐ avg_rating - For star ratings';
    RAISE NOTICE '📊 review_count - For review counts';
    RAISE NOTICE '🕒 opening_hours - For business hours';
    RAISE NOTICE '📸 photos - For multiple images';
    RAISE NOTICE '👤 owner_id - For place ownership';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your app should now work perfectly!';
    RAISE NOTICE '============================================';
END $$;