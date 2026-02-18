-- Debug bookmark count issue
-- Check if bookmarks table exists and has data

-- 1. Check if bookmarks table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'bookmarks';

-- 2. Check all bookmarks in the table
SELECT * FROM bookmarks ORDER BY created_at DESC LIMIT 10;

-- 3. Check bookmarks for specific user (replace with your actual user ID)
-- You can get your user ID from the profile screen or auth logs
SELECT 
    b.*,
    p.title as place_title
FROM bookmarks b
LEFT JOIN places p ON b.place_id = p.id
WHERE b.user_id = 'your_user_id_here'
ORDER BY b.created_at DESC;

-- 4. Count bookmarks by user
SELECT 
    user_id,
    COUNT(*) as bookmark_count
FROM bookmarks 
GROUP BY user_id
ORDER BY bookmark_count DESC;

-- 5. Check if there are any bookmarks at all
SELECT COUNT(*) as total_bookmarks FROM bookmarks;