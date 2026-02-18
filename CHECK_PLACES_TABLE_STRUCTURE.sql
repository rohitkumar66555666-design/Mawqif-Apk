-- Check Places Table Structure
-- This script checks what columns exist in the places table

SELECT 'Checking places table structure...' as step;

-- Check if places table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'places'
) as places_table_exists;

-- Get all columns in places table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'places'
ORDER BY ordinal_position;

-- Check for common host/owner column variations
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'host_user_id') THEN 'host_user_id'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'owner_id') THEN 'owner_id'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'user_id') THEN 'user_id'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'created_by') THEN 'created_by'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'places' AND column_name = 'host_id') THEN 'host_id'
        ELSE 'NOT_FOUND'
    END as host_column_name;

-- Sample data from places table (first 3 rows)
SELECT 'Sample places data:' as info;
SELECT * FROM public.places LIMIT 3;