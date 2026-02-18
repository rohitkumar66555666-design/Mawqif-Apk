-- Safe fix for UID mismatch issue - handles duplicates properly
-- This script safely updates all data to use the new consistent UID format

-- STEP 1: Replace with your actual phone number
-- IMPORTANT: Change '+916296798907' to your actual phone number
DO $$
DECLARE
    target_phone_number TEXT := '+916296798907';  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
    clean_phone TEXT;
    new_consistent_uid TEXT;
    old_profile_record RECORD;
    old_place_record RECORD;
    profiles_updated INTEGER := 0;
    places_updated INTEGER := 0;
    reviews_updated INTEGER := 0;
    bookmarks_updated INTEGER := 0;
    review_likes_updated INTEGER := 0;
BEGIN
    -- Generate the new consistent UID format (matches updated app logic)
    clean_phone := REPLACE(REPLACE(target_phone_number, '+', ''), '-', '');
    new_consistent_uid := 'dev-' || clean_phone;
    
    RAISE NOTICE '=== SAFE UID MISMATCH FIX STARTING ===';
    RAISE NOTICE 'Target phone number: %', target_phone_number;
    RAISE NOTICE 'Clean phone: %', clean_phone;
    RAISE NOTICE 'New consistent UID: %', new_consistent_uid;
    
    -- STEP 2: Show current state before fix
    RAISE NOTICE '=== CURRENT STATE (BEFORE FIX) ===';
    
    -- Show existing profiles for this phone number
    FOR old_profile_record IN
        SELECT user_id, phone_number, full_name, created_at
        FROM profiles 
        WHERE phone_number = target_phone_number
        ORDER BY created_at DESC
    LOOP
        RAISE NOTICE 'Found profile: user_id=%, name=%, created=%', 
                     old_profile_record.user_id, 
                     old_profile_record.full_name, 
                     old_profile_record.created_at;
    END LOOP;
    
    -- Show existing places
    FOR old_place_record IN
        SELECT id, title, owner_id, is_active, created_at
        FROM places 
        WHERE owner_id IN (
            SELECT user_id FROM profiles WHERE phone_number = target_phone_number
        )
        ORDER BY created_at DESC
    LOOP
        RAISE NOTICE 'Found place: id=%, title=%, owner_id=%, active=%', 
                     old_place_record.id, 
                     old_place_record.title, 
                     old_place_record.owner_id, 
                     old_place_record.is_active;
    END LOOP;
    
    -- STEP 3: Collect old user_ids before making changes
    CREATE TEMP TABLE old_user_ids AS
    SELECT DISTINCT user_id 
    FROM profiles 
    WHERE phone_number = target_phone_number
      AND user_id != new_consistent_uid;
    
    RAISE NOTICE 'Found % old user_id(s) to migrate', (SELECT COUNT(*) FROM old_user_ids);
    
    -- STEP 4: Update profiles to use new consistent UID
    RAISE NOTICE '=== UPDATING PROFILES ===';
    
    UPDATE profiles 
    SET user_id = new_consistent_uid,
        last_login_at = NOW(),
        updated_at = NOW()
    WHERE phone_number = target_phone_number
      AND user_id != new_consistent_uid;
    
    GET DIAGNOSTICS profiles_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % profile(s) to use new consistent UID: %', profiles_updated, new_consistent_uid;
    
    -- STEP 5: Update places ownership
    RAISE NOTICE '=== UPDATING PLACES OWNERSHIP ===';
    
    UPDATE places 
    SET owner_id = new_consistent_uid,
        updated_at = NOW(),
        is_active = true  -- Ensure places are visible
    WHERE owner_id IN (SELECT user_id FROM old_user_ids);
    
    GET DIAGNOSTICS places_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % place(s) to use new consistent UID: %', places_updated, new_consistent_uid;
    
    -- STEP 6: Update reviews
    RAISE NOTICE '=== UPDATING REVIEWS ===';
    
    UPDATE reviews 
    SET user_id = new_consistent_uid,
        updated_at = NOW()
    WHERE user_id IN (SELECT user_id FROM old_user_ids);
    
    GET DIAGNOSTICS reviews_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % review(s) to use new consistent UID: %', reviews_updated, new_consistent_uid;
    
    -- STEP 7: Update bookmarks
    RAISE NOTICE '=== UPDATING BOOKMARKS ===';
    
    UPDATE bookmarks 
    SET user_id = new_consistent_uid,
        updated_at = NOW()
    WHERE user_id IN (SELECT user_id FROM old_user_ids);
    
    GET DIAGNOSTICS bookmarks_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % bookmark(s) to use new consistent UID: %', bookmarks_updated, new_consistent_uid;
    
    -- STEP 8: Safely handle review_likes (avoid duplicates)
    RAISE NOTICE '=== SAFELY UPDATING REVIEW_LIKES ===';
    
    BEGIN
        -- First, delete any potential duplicates that would be created
        DELETE FROM review_likes 
        WHERE user_id = new_consistent_uid
          AND review_id IN (
              SELECT DISTINCT rl.review_id 
              FROM review_likes rl
              WHERE rl.user_id IN (SELECT user_id FROM old_user_ids)
          );
        
        -- Now safely update the remaining records
        UPDATE review_likes 
        SET user_id = new_consistent_uid,
            updated_at = NOW()
        WHERE user_id IN (SELECT user_id FROM old_user_ids);
        
        GET DIAGNOSTICS review_likes_updated = ROW_COUNT;
        RAISE NOTICE 'Updated % review_like(s) to use new consistent UID: %', review_likes_updated, new_consistent_uid;
        
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'review_likes table does not exist, skipping';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error updating review_likes (non-critical): %', SQLERRM;
    END;
    
    -- STEP 9: Safely handle review_reports if it exists
    BEGIN
        -- Check what columns exist in review_reports table
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'review_reports' 
            AND column_name = 'reported_by'
        ) THEN
            -- Use reported_by column
            RAISE NOTICE 'Updating review_reports using reported_by column';
            
            -- Delete potential duplicates first
            DELETE FROM review_reports 
            WHERE reported_by = new_consistent_uid
              AND review_id IN (
                  SELECT DISTINCT rr.review_id 
                  FROM review_reports rr
                  WHERE rr.reported_by IN (SELECT user_id FROM old_user_ids)
              );
            
            -- Update remaining records
            UPDATE review_reports 
            SET reported_by = new_consistent_uid,
                updated_at = NOW()
            WHERE reported_by IN (SELECT user_id FROM old_user_ids);
            
            RAISE NOTICE 'Updated review_reports successfully (using reported_by)';
            
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'review_reports' 
            AND column_name = 'reporter_id'
        ) THEN
            -- Use reporter_id column
            RAISE NOTICE 'Updating review_reports using reporter_id column';
            
            -- Delete potential duplicates first
            DELETE FROM review_reports 
            WHERE reporter_id = new_consistent_uid
              AND review_id IN (
                  SELECT DISTINCT rr.review_id 
                  FROM review_reports rr
                  WHERE rr.reporter_id IN (SELECT user_id FROM old_user_ids)
              );
            
            -- Update remaining records
            UPDATE review_reports 
            SET reporter_id = new_consistent_uid,
                updated_at = NOW()
            WHERE reporter_id IN (SELECT user_id FROM old_user_ids);
            
            RAISE NOTICE 'Updated review_reports successfully (using reporter_id)';
            
        ELSE
            RAISE NOTICE 'review_reports table exists but no recognized user column found, skipping';
        END IF;
        
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'review_reports table does not exist, skipping';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error updating review_reports (non-critical): %', SQLERRM;
    END;
    
    -- Clean up temp table
    DROP TABLE old_user_ids;
    
    -- STEP 10: Final verification and summary
    RAISE NOTICE '=== FIX COMPLETE - SUMMARY ===';
    RAISE NOTICE 'Phone number: %', target_phone_number;
    RAISE NOTICE 'New consistent UID: %', new_consistent_uid;
    RAISE NOTICE 'Profiles updated: %', profiles_updated;
    RAISE NOTICE 'Places updated: %', places_updated;
    RAISE NOTICE 'Reviews updated: %', reviews_updated;
    RAISE NOTICE 'Bookmarks updated: %', bookmarks_updated;
    RAISE NOTICE 'Review likes updated: %', review_likes_updated;
    
    -- Count final results
    SELECT COUNT(*) INTO places_updated
    FROM places p
    JOIN profiles pr ON p.owner_id = pr.user_id
    WHERE pr.phone_number = target_phone_number
      AND p.is_active = true;
    
    RAISE NOTICE '=== FINAL RESULTS ===';
    RAISE NOTICE 'Places that will show in dashboard: %', places_updated;
    
    IF places_updated > 0 THEN
        RAISE NOTICE '✅ SUCCESS: % place(s) will now consistently appear in dashboard', places_updated;
        RAISE NOTICE '✅ UID will be consistent across all login sessions: %', new_consistent_uid;
    ELSE
        RAISE NOTICE '⚠️ WARNING: No places found. You may need to create a place first.';
    END IF;
    
END $$;

-- VERIFICATION QUERIES
-- Run these to confirm everything is working correctly

-- 1. Show the new consistent UID format
SELECT 
    '=== NEW CONSISTENT UID FORMAT ===' as section,
    'dev-' || REPLACE(REPLACE('+916296798907', '+', ''), '-', '') as new_uid_format,
    '+916296798907' as phone_number;  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER

-- 2. Show updated profile
SELECT 
    '=== UPDATED PROFILE ===' as section,
    user_id,
    phone_number,
    full_name,
    created_at,
    last_login_at,
    is_active
FROM profiles 
WHERE phone_number = '+916296798907'  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
ORDER BY created_at DESC;

-- 3. Show updated places
SELECT 
    '=== UPDATED PLACES ===' as section,
    p.id,
    p.title,
    p.owner_id,
    p.is_active,
    p.created_at,
    pr.phone_number
FROM places p
JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number = '+916296798907'  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
  AND p.is_active = true
ORDER BY p.created_at DESC;

-- 4. Check for any remaining old user_ids
SELECT 
    '=== CHECK FOR OLD USER_IDS ===' as section,
    user_id,
    phone_number,
    'Should be dev-916296798907' as expected_format  -- ⚠️ CHANGE THIS TO YOUR EXPECTED UID
FROM profiles 
WHERE phone_number = '+916296798907'  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
  AND user_id != 'dev-916296798907';  -- ⚠️ CHANGE THIS TO YOUR EXPECTED UID

-- 5. Final consistency check
WITH expected_uid AS (
    SELECT 'dev-' || REPLACE(REPLACE('+916296798907', '+', ''), '-', '') as uid
)
SELECT 
    '=== FINAL CONSISTENCY CHECK ===' as section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM profiles pr
            CROSS JOIN expected_uid eu
            WHERE pr.phone_number = '+916296798907'  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
              AND pr.user_id = eu.uid
        ) THEN '✅ PROFILE UID IS CONSISTENT'
        ELSE '❌ PROFILE UID IS NOT CONSISTENT'
    END as profile_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM places p
            JOIN profiles pr ON p.owner_id = pr.user_id
            CROSS JOIN expected_uid eu
            WHERE pr.phone_number = '+916296798907'  -- ⚠️ CHANGE THIS TO YOUR PHONE NUMBER
              AND p.owner_id = eu.uid
              AND p.is_active = true
        ) THEN '✅ PLACES UID IS CONSISTENT'
        ELSE '❌ PLACES UID IS NOT CONSISTENT'
    END as places_status;