-- CLEAN UP DUPLICATE/WRONG IMAGES
-- All places showing the same image - this is wrong

-- Step 1: Check current state
SELECT 
    id,
    title,
    photo,
    created_at,
    CASE 
        WHEN photo IS NULL THEN '⚪ No photo'
        WHEN photo LIKE '%bing.net%' OR photo LIKE '%tse%.mm.bing.net%' THEN '❌ Bing URL (wrong)'
        WHEN photo LIKE '%supabase.co%' AND photo LIKE '%/public/%' THEN '✅ Valid Supabase URL'
        ELSE '❓ Unknown format'
    END as status
FROM places
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Count places with same image URL
SELECT 
    photo,
    COUNT(*) as places_with_this_image,
    STRING_AGG(title, ', ') as place_names
FROM places
WHERE photo IS NOT NULL
GROUP BY photo
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- Step 3: Remove duplicate/wrong images
-- If multiple places have the same image URL, it's wrong
UPDATE places 
SET photo = NULL
WHERE photo IN (
    SELECT photo 
    FROM places 
    WHERE photo IS NOT NULL
    GROUP BY photo 
    HAVING COUNT(*) > 1
);

-- Step 4: Also remove any remaining Bing URLs
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%bing.net%' 
   OR photo LIKE '%tse%.mm.bing.net%'
   OR photo LIKE '%mm.bing.net%';

-- Step 5: Show results after cleanup
SELECT 
    'AFTER CLEANUP:' as status,
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo IS NULL THEN 1 END) as no_photo,
    COUNT(CASE WHEN photo IS NOT NULL THEN 1 END) as has_photo
FROM places;

-- Step 6: Show cleaned places
SELECT 
    title,
    photo,
    created_at,
    CASE 
        WHEN photo IS NULL THEN '⚪ No photo - ready for proper upload'
        WHEN photo LIKE '%supabase.co%' THEN '✅ Valid unique image'
        ELSE '❌ Still needs fixing'
    END as status
FROM places
ORDER BY created_at DESC
LIMIT 10;

-- Success message
SELECT 'Duplicate images cleaned up! Each place now needs its own unique image.' as result;