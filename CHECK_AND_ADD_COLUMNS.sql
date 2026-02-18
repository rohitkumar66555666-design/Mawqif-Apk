-- ============================================
-- CHECK WHICH COLUMNS EXIST AND ADD MISSING ONES
-- Safe version that won't error on existing columns
-- ============================================

-- Step 1: Check which columns currently exist
SELECT 
    'Current columns in places table:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'places' 
ORDER BY ordinal_position;

-- Step 2: Add missing columns with error handling
DO $$
BEGIN
    -- Try to add contact_phone
    BEGIN
        ALTER TABLE places ADD COLUMN contact_phone TEXT;
        RAISE NOTICE '✅ Added contact_phone column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ contact_phone already exists - skipping';
    END;

    -- Try to add whatsapp_number
    BEGIN
        ALTER TABLE places ADD COLUMN whatsapp_number TEXT;
        RAISE NOTICE '✅ Added whatsapp_number column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ whatsapp_number already exists - skipping';
    END;

    -- Try to add address
    BEGIN
        ALTER TABLE places ADD COLUMN address TEXT;
        RAISE NOTICE '✅ Added address column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ address already exists - skipping';
    END;

    -- Try to add is_open
    BEGIN
        ALTER TABLE places ADD COLUMN is_open BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ Added is_open column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ is_open already exists - skipping';
    END;

    -- Try to add avg_rating
    BEGIN
        ALTER TABLE places ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.0;
        RAISE NOTICE '✅ Added avg_rating column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ avg_rating already exists - skipping';
    END;

    -- Try to add review_count
    BEGIN
        ALTER TABLE places ADD COLUMN review_count INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added review_count column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ review_count already exists - skipping';
    END;

    -- Try to add opening_hours
    BEGIN
        ALTER TABLE places ADD COLUMN opening_hours JSONB;
        RAISE NOTICE '✅ Added opening_hours column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ opening_hours already exists - skipping';
    END;

    -- Try to add photos
    BEGIN
        ALTER TABLE places ADD COLUMN photos TEXT[];
        RAISE NOTICE '✅ Added photos column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ photos already exists - skipping';
    END;

    -- Try to add owner_id
    BEGIN
        ALTER TABLE places ADD COLUMN owner_id UUID;
        RAISE NOTICE '✅ Added owner_id column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE '⚠️ owner_id already exists - skipping';
    END;

END $$;

-- Step 3: Update existing records with default values
UPDATE places 
SET 
  is_open = COALESCE(is_open, true),
  avg_rating = COALESCE(avg_rating, 0.0),
  review_count = COALESCE(review_count, 0);

-- Step 4: Show final table structure
SELECT 
    'Final table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'places' 
ORDER BY ordinal_position;

-- Step 5: Test the new columns
SELECT 
  id,
  title,
  COALESCE(contact_phone, 'Not set') as contact_phone,
  COALESCE(whatsapp_number, 'Not set') as whatsapp_number,
  COALESCE(address, 'Not set') as address,
  COALESCE(is_open, true) as is_open,
  COALESCE(avg_rating, 0.0) as avg_rating,
  COALESCE(review_count, 0) as review_count
FROM places 
LIMIT 3;

-- Step 6: Success message
SELECT 
  '🎉 SUCCESS: All required columns are now available!' as status,
  COUNT(*) as total_places
FROM places;