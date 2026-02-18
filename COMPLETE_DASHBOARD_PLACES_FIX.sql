-- Complete fix for dashboard places not showing after re-login
-- This script handles the user ID mismatch issue

-- STEP 1: Replace this with your actual phone number
-- IMPORTANT: Change '+916296798907' to your actual phone number
DO $$
DECLARE
    target_phone_number TEXT := '+916296798907';  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
    current_session_user_id TEXT;
    profile_record RECORD;
    place_record RECORD;
    places_updated INTEGER := 0;
    profiles_updated INTEGER := 0;
BEGIN
    -- Generate the current session user_id (matches app logic)
    current_session_user_id := 'dev-' || REPLACE(REPLACE(target_phone_number, '+', ''), '-', '');
    
    RAISE NOTICE '=== DASHBOARD PLACES FIX STARTING ===';
    RAISE NOTICE 'Target phone number: %', target_phone_number;
    RAISE NOTICE 'Expected session user_id: %', current_session_user_id;
    
    -- STEP 2: Check current state
    RAISE NOTICE '=== CURRENT STATE CHECK ===';
    
    -- Show existing profiles for this phone number
    FOR profile_record IN
        SELECT user_id, phone_number, full_name, created_at, last_login_at
        FROM profiles 
        WHERE phone_number = target_phone_number
        ORDER BY created_at DESC
    LOOP
        RAISE NOTICE 'Found profile: user_id=%, name=%, created=%', 
                     profile_record.user_id, 
                     profile_record.full_name, 
                     profile_record.created_at;
    END LOOP;
    
    -- Show existing places
    FOR place_record IN
        SELECT id, title, owner_id, is_active, created_at
        FROM places 
        WHERE is_active = true
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        RAISE NOTICE 'Found place: id=%, title=%, owner_id=%, active=%', 
                     place_record.id, 
                     place_record.title, 
                     place_record.owner_id, 
                     place_record.is_active;
    END LOOP;
    
    -- STEP 3: Fix profile user_id to match current session
    RAISE NOTICE '=== FIXING PROFILE USER_ID ===';
    
    -- Update all profiles with this phone number to use the current session user_id
    UPDATE profiles 
    SET user_id = current_session_user_id,
        last_login_at = NOW(),
        updated_at = NOW()
    WHERE phone_number = target_phone_number
      AND user_id != current_session_user_id;
    
    GET DIAGNOSTICS profiles_updated = ROW_COUNT;
    
    IF profiles_updated > 0 THEN
        RAISE NOTICE 'Updated % profile(s) to use session user_id: %', profiles_updated, current_session_user_id;
    ELSE
        RAISE NOTICE 'Profile already has correct user_id or no profile found';
    END IF;
    
    -- STEP 4: Fix places ownership
    RAISE NOTICE '=== FIXING PLACES OWNERSHIP ===';
    
    -- Find places that should belong to this user based on phone number history
    -- This includes places created by any user_id associated with this phone number
    FOR place_record IN
        SELECT DISTINCT p.id, p.title, p.owner_id, p.created_at
        FROM places p
        WHERE p.is_active = true
          AND p.owner_id != current_session_user_id
          AND EXISTS (
              -- Check if this place was created by a user_id that belongs to our phone number
              SELECT 1 FROM profiles pr 
              WHERE pr.phone_number = target_phone_number
                AND (
                    pr.user_id = p.owner_id 
                    OR pr.created_at <= p.created_at + INTERVAL '1 day'
                )
          )
        ORDER BY p.created_at DESC
    LOOP
        -- Update place ownership to current session user_id
        UPDATE places 
        SET owner_id = current_session_user_id,
            updated_at = NOW()
        WHERE id = place_record.id;
        
        places_updated := places_updated + 1;
        
        RAISE NOTICE 'Updated place ownership: % (%) - owner_id: % → %', 
                     place_record.title, 
                     place_record.id, 
                     place_record.owner_id, 
                     current_session_user_id;
    END LOOP;
    
    -- STEP 5: Ensure places are visible (is_active = true)
    UPDATE places 
    SET is_active = true,
        updated_at = NOW()
    WHERE owner_id = current_session_user_id
      AND is_active = false;
    
    GET DIAGNOSTICS places_updated = ROW_COUNT;
    
    IF places_updated > 0 THEN
        RAISE NOTICE 'Made % place(s) visible (is_active = true)', places_updated;
    END IF;
    
    -- STEP 6: Summary and verification
    RAISE NOTICE '=== FIX COMPLETE - SUMMARY ===';
    RAISE NOTICE 'Profiles updated: %', profiles_updated;
    RAISE NOTICE 'Places ownership updated: %', places_updated;
    RAISE NOTICE 'Phone number: %', target_phone_number;
    RAISE NOTICE 'Session user_id: %', current_session_user_id;
    
    -- Show final state
    RAISE NOTICE '=== FINAL STATE ===';
    
    -- Count places that should now show in dashboard
    SELECT COUNT(*) INTO places_updated
    FROM places p
    JOIN profiles pr ON p.owner_id = pr.user_id
    WHERE pr.phone_number = target_phone_number
      AND p.is_active = true;
    
    RAISE NOTICE 'Places that should show in dashboard: %', places_updated;
    
    IF places_updated > 0 THEN
        RAISE NOTICE '✅ SUCCESS: % place(s) should now appear in dashboard when you login with %', 
                     places_updated, target_phone_number;
    ELSE
        RAISE NOTICE '⚠️ WARNING: No places found for this phone number. You may need to create a place first.';
    END IF;
    
END $$;

-- VERIFICATION QUERIES
-- Run these to confirm the fix worked

-- 1. Show places that should appear in dashboard
SELECT 
    '=== PLACES THAT SHOULD SHOW IN DASHBOARD ===' as section,
    p.id,
    p.title,
    p.owner_id,
    p.is_active,
    p.created_at,
    pr.phone_number,
    pr.full_name
FROM places p
JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number = '+916296798907'  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
  AND p.is_active = true
ORDER BY p.created_at DESC;

-- 2. Show current profile state
SELECT 
    '=== CURRENT PROFILE STATE ===' as section,
    user_id,
    phone_number,
    full_name,
    created_at,
    last_login_at,
    is_active
FROM profiles 
WHERE phone_number = '+916296798907'  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
ORDER BY created_at DESC;

-- 3. Show expected session user_id
SELECT 
    '=== EXPECTED SESSION INFO ===' as section,
    'dev-' || REPLACE(REPLACE('+916296798907', '+', ''), '-', '') as expected_user_id,
    '+916296798907' as phone_number;  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER

-- 4. Test dashboard query simulation
WITH current_session AS (
    SELECT 'dev-' || REPLACE(REPLACE('+916296798907', '+', ''), '-', '') as session_user_id
)
SELECT 
    '=== DASHBOARD QUERY SIMULATION ===' as section,
    p.id,
    p.title,
    p.owner_id,
    cs.session_user_id,
    CASE 
        WHEN p.owner_id = cs.session_user_id THEN '✅ WILL SHOW'
        ELSE '❌ WILL NOT SHOW'
    END as dashboard_status
FROM places p
CROSS JOIN current_session cs
WHERE p.is_active = true
ORDER BY p.created_at DESC;