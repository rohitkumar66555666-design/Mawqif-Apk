-- Debug AAMIR's bookmark count issue
-- Check bookmarks for user with phone +918655102089

-- 1. First, let's see all bookmarks in the table
SELECT 
    id,
    user_id,
    place_id,
    created_at,
    'All bookmarks' as source
FROM bookmarks 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check if there are bookmarks for phone number +918655102089
-- (in case user_id is stored as phone number)
SELECT 
    id,
    user_id,
    place_id,
    created_at,
    'Phone as user_id' as source
FROM bookmarks 
WHERE user_id = '+918655102089'
ORDER BY created_at DESC;

-- 3. Check if there are bookmarks for phone number without +
SELECT 
    id,
    user_id,
    place_id,
    created_at,
    'Phone without +' as source
FROM bookmarks 
WHERE user_id = '918655102089'
ORDER BY created_at DESC;

-- 4. Check if there are bookmarks for any user_id containing '8655102089'
SELECT 
    id,
    user_id,
    place_id,
    created_at,
    'Contains phone' as source
FROM bookmarks 
WHERE user_id LIKE '%8655102089%'
ORDER BY created_at DESC;

-- 5. Check all unique user_ids in bookmarks table
SELECT 
    user_id,
    COUNT(*) as bookmark_count,
    MIN(created_at) as first_bookmark,
    MAX(created_at) as last_bookmark
FROM bookmarks 
GROUP BY user_id
ORDER BY bookmark_count DESC;

-- 6. Check if user_id might be a UUID (common pattern)
SELECT 
    id,
    user_id,
    place_id,
    created_at,
    'UUID pattern' as source
FROM bookmarks 
WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ORDER BY created_at DESC
LIMIT 5;

-- 7. Show total count of bookmarks
SELECT COUNT(*) as total_bookmarks_in_table FROM bookmarks;