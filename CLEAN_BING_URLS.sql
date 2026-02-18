-- CLEAN UP BING IMAGE URLS
-- Remove Bing URLs that somehow got saved instead of Supabase URLs

-- Step 1: Check what we have
SELECT 
    id,
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '⚪ No photo'
        WHEN photo LIKE '%bing.net%' THEN '❌ Bing URL (should be removed)'
        WHEN photo LIKE '%tse%.mm.bing.net%' THEN '❌ Bing thumbnail URL (should be removed)'
        WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN '✅ Valid Supabase URL'
        WHEN photo LIKE '%supabase.co%' AND photo NOT LIKE '%/public/%' THEN '⚠️ Supabase URL but not public'
        WHEN photo LIKE 'file://%' THEN '❌ Local file path'
        ELSE '❓ Unknown format'
    END as status
FROM places
ORDER BY created_at DESC;

-- Step 2: Count the issues
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo LIKE '%bing.net%' OR photo LIKE '%tse%.mm.bing.net%' THEN 1 END) as bing_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN 1 END) as valid_supabase_urls,
    COUNT(CASE WHEN photo LIKE 'file://%' THEN 1 END) as local_file_paths
FROM places;

-- Step 3: Remove Bing URLs (they're not your uploaded images)
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%bing.net%' 
   OR photo LIKE '%tse%.mm.bing.net%'
   OR photo LIKE '%mm.bing.net%';

-- Step 4: Remove any remaining local file paths
UPDATE places 
SET photo = NULL
WHERE photo LIKE 'file://%' 
   OR photo LIKE '%/cache/%'
   OR photo LIKE '%ImagePicker%'
   OR photo LIKE '%/data/user/%';

-- Step 5: Show results after cleanup
SELECT 
    'AFTER CLEANUP:' as status,
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo_needs_upload,
    COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) as remaining_bing_urls,
    COUNT(CASE WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN 1 END) as valid_supabase_urls
FROM places;

-- Step 6: Show cleaned data
SELECT 
    title,
    photo,
    CASE 
        WHEN photo IS NULL THEN '⚪ No photo - ready for new upload'
        WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN '✅ Valid Supabase URL'
        ELSE '❌ Still needs fixing'
    END as status
FROM places
ORDER BY created_at DESC
LIMIT 10;

-- Success message
SELECT 'Bing URLs cleaned up! All places now ready for proper image uploads.' as result;