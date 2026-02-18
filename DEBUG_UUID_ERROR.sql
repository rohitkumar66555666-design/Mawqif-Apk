-- DEBUG THE UUID = TEXT ERROR
-- Run this to find exactly where the error is coming from

-- Check if there are multiple reviews tables
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%review%'
ORDER BY table_schema, table_name;

-- Check current reviews table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any views or materialized views
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname LIKE '%review%';

-- Check for any foreign key constraints that might be causing issues
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'reviews' OR ccu.table_name = 'reviews');

-- Test a simple insert to see exact error
DO $$
BEGIN
    INSERT INTO reviews (place_id, user_id, user_name, rating, comment)
    VALUES ('test-place-123', 'current_user_123', 'Test User', 5, 'Test comment');
    
    DELETE FROM reviews WHERE user_name = 'Test User';
    
    RAISE NOTICE 'SUCCESS: Insert worked! The error is not from the reviews table.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
        RAISE NOTICE 'ERROR CODE: %', SQLSTATE;
END $$;