-- Debug script to find why places are not showing in dashboard after re-login
-- Replace 'YOUR_PHONE_NUMBER' with the actual phone number you used

-- 1. Check what user_id the current session should have
SELECT 
    'CURRENT SESSION USER ID (what app generates):' as info,
    'dev-' || REPLACE(REPLACE('+916296798907', '+', ''), '-', '') as expected_user_id;

-- 2. Check what profiles exist for this phone number
SELECT 
    'PROFILES FOR THIS PHONE NUMBER:' as info,
    user_id,
    phone_number,
    full_name,
    created_at,
    last_login_at
FROM profiles 
WHERE phone_number = '+916296798907'  -- Replace with your phone number
ORDER BY created_at DESC;

-- 3. Check what places exist and their owner_ids
SELECT 
    'ALL PLACES IN DATABASE:' as info,
    id,
    title,
    owner_id,
    is_active,
    created_at
FROM places 
ORDER BY created_at DESC;

-- 4. Check if there are places with owner_ids that match any profile user_ids for this phone
SELECT 
    'PLACES OWNED BY PROFILES WITH THIS PHONE NUMBER:' as info,
    p.id as place_id,
    p.title,
    p.owner_id,
    p.is_active,
    pr.phone_number,
    pr.user_id as profile_user_id
FROM places p
JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number = '+916296798907'  -- Replace with your phone number
ORDER BY p.created_at DESC;

-- 5. Check for orphaned places (places with owner_ids that don't match current profiles)
SELECT 
    'ORPHANED PLACES (owner_id does not match any current profile):' as info,
    p.id as place_id,
    p.title,
    p.owner_id,
    p.is_active,
    p.created_at,
    'No matching profile found' as issue
FROM places p
LEFT JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.user_id IS NULL
  AND p.is_active = true
ORDER BY p.created_at DESC;

-- 6. Check what the dashboard query should return
-- This simulates what getUserPlaces() should find
SELECT 
    'DASHBOARD QUERY SIMULATION:' as info,
    'Looking for places with owner_id matching current session user_id' as explanation;

-- Simulate the current session user_id generation
WITH current_session AS (
    SELECT 'dev-' || REPLACE(REPLACE('+916296798907', '+', ''), '-', '') as session_user_id
)
SELECT 
    'PLACES THAT SHOULD SHOW IN DASHBOARD:' as info,
    p.id,
    p.title,
    p.owner_id,
    p.is_active,
    cs.session_user_id,
    CASE 
        WHEN p.owner_id = cs.session_user_id THEN 'MATCH - Should show in dashboard'
        ELSE 'NO MATCH - Will not show in dashboard'
    END as dashboard_status
FROM places p
CROSS JOIN current_session cs
WHERE p.is_active = true
ORDER BY p.created_at DESC;

-- 7. Show the fix needed
SELECT 
    'RECOMMENDED FIX:' as action,
    'Update places owner_id to match current session user_id for this phone number' as description;

-- 8. Generate the fix query (but don't execute it yet)
WITH current_session AS (
    SELECT 'dev-' || REPLACE(REPLACE('+916296798907', '+', ''), '-', '') as session_user_id
),
places_to_fix AS (
    SELECT p.id, p.owner_id, cs.session_user_id
    FROM places p
    CROSS JOIN current_session cs
    JOIN profiles pr ON pr.phone_number = '+916296798907'  -- Replace with your phone number
    WHERE p.owner_id != cs.session_user_id
      AND p.is_active = true
)
SELECT 
    'FIX QUERY (run this to fix the issue):' as info,
    'UPDATE places SET owner_id = ''' || session_user_id || ''' WHERE id IN (' ||
    STRING_AGG('''' || id || '''', ', ') || ');' as fix_query
FROM places_to_fix
GROUP BY session_user_id;