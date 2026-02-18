-- Remove foreign key constraints that reference the users table
-- This allows the application to work without the users table

-- 1. Remove foreign key constraint from reviews table
DO $$ 
BEGIN
    -- Check if the constraint exists before trying to drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_user_id_fkey' 
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint: reviews_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint reviews_user_id_fkey does not exist';
    END IF;
END $$;

-- 2. Remove foreign key constraint from places table (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'places_owner_id_fkey' 
        AND table_name = 'places'
    ) THEN
        ALTER TABLE places DROP CONSTRAINT places_owner_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint: places_owner_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint places_owner_id_fkey does not exist';
    END IF;
END $$;

-- 3. Remove foreign key constraint from bookmarks table (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookmarks_user_id_fkey' 
        AND table_name = 'bookmarks'
    ) THEN
        ALTER TABLE bookmarks DROP CONSTRAINT bookmarks_user_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint: bookmarks_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint bookmarks_user_id_fkey does not exist';
    END IF;
END $$;

-- 4. Remove foreign key constraint from review_likes table (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'review_likes_user_id_fkey' 
        AND table_name = 'review_likes'
    ) THEN
        ALTER TABLE review_likes DROP CONSTRAINT review_likes_user_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint: review_likes_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint review_likes_user_id_fkey does not exist';
    END IF;
END $$;

-- 5. Remove foreign key constraint from review_reports table (if exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'review_reports_reporter_id_fkey' 
        AND table_name = 'review_reports'
    ) THEN
        ALTER TABLE review_reports DROP CONSTRAINT review_reports_reporter_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint: review_reports_reporter_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint review_reports_reporter_id_fkey does not exist';
    END IF;
END $$;

-- 6. Check for any other foreign key constraints that reference users table
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT 
            tc.table_name, 
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public'
          AND ccu.table_name = 'users'
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                      constraint_record.table_name, 
                      constraint_record.constraint_name);
        RAISE NOTICE 'Dropped foreign key constraint: % from table %', 
                     constraint_record.constraint_name, 
                     constraint_record.table_name;
    END LOOP;
END $$;

-- Verify that all foreign key constraints to users table have been removed
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    'REMAINING CONSTRAINT - SHOULD BE EMPTY' as status
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND ccu.table_name = 'users';

-- Success message
SELECT 'SUCCESS: All foreign key constraints to users table have been removed. The application can now work without the users table.' as result;