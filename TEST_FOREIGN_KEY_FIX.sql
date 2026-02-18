-- Test script to verify foreign key constraints have been removed
-- Run this AFTER running REMOVE_USERS_TABLE_FOREIGN_KEYS.sql

-- 1. Check that no foreign key constraints reference the users table
SELECT 
    'FOREIGN KEY CONSTRAINTS TO USERS TABLE (should be empty):' as check_type,
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
  AND ccu.table_name = 'users';

-- 2. Test creating a review with a non-existent user_id (should work now)
DO $$
BEGIN
    -- Try to insert a test review with a fake user_id
    INSERT INTO reviews (
        place_id, 
        user_id, 
        user_name, 
        reviewer_name,
        rating, 
        comment,
        likes_count,
        dislikes_count,
        replies_count
    ) VALUES (
        'test-place-id',
        'test-user-id-that-does-not-exist-in-users-table',
        'Test User',
        'Test User',
        5,
        'This is a test review to verify foreign key constraints are removed',
        0,
        0,
        0
    );
    
    RAISE NOTICE 'SUCCESS: Review created without foreign key constraint error';
    
    -- Clean up the test review
    DELETE FROM reviews 
    WHERE user_id = 'test-user-id-that-does-not-exist-in-users-table';
    
    RAISE NOTICE 'Test review cleaned up successfully';
    
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'FAILED: Foreign key constraint still exists - %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'OTHER ERROR (may be expected): %', SQLERRM;
END $$;

-- 3. Show current table structure for reviews table
SELECT 
    'REVIEWS TABLE STRUCTURE:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Show current constraints on reviews table
SELECT 
    'REVIEWS TABLE CONSTRAINTS (should not include users foreign key):' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'reviews' 
  AND table_schema = 'public'
ORDER BY constraint_name;

-- 5. Final status check
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints AS tc 
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_schema = 'public'
              AND ccu.table_name = 'users'
        ) THEN 'FAILED: Foreign key constraints to users table still exist'
        ELSE 'SUCCESS: All foreign key constraints to users table have been removed'
    END as final_status;