-- Fix dashboard places ownership issue
-- This script updates place owner_ids to match the current session user_id
-- based on phone number matching

-- IMPORTANT: Replace '+916296798907' with your actual phone number

DO $$
DECLARE
    target_phone_number TEXT := '+916296798907';  -- Replace with your phone number
    current_session_user_id TEXT;
    places_updated INTEGER := 0;
    place_record RECORD;
BEGIN
    -- Generate the current session user_id (same logic as the app)
    current_session_user_id := 'dev-' || REPLACE(REPLACE(target_phone_number, '+', ''), '-', '');
    
    RAISE NOTICE 'Target phone number: %', target_phone_number;
    RAISE NOTICE 'Current session user_id: %', current_session_user_id;
    
    -- Check if there's a profile for this phone number
    IF NOT EXISTS (
        SELECT 1 FROM profiles WHERE phone_number = target_phone_number
    ) THEN
        RAISE NOTICE 'WARNING: No profile found for phone number %', target_phone_number;
        RAISE NOTICE 'You may need to login first to create the profile';
        RETURN;
    END IF;
    
    -- Find places that should belong to this user but have different owner_ids
    -- This happens when user_id generation changed between sessions
    FOR place_record IN
        SELECT DISTINCT p.id, p.title, p.owner_id, p.created_at
        FROM places p
        WHERE p.is_active = true
          AND p.owner_id != current_session_user_id
          AND EXISTS (
              -- Check if there's a profile with this phone number that could have owned this place
              SELECT 1 FROM profiles pr 
              WHERE pr.phone_number = target_phone_number
                AND (pr.user_id = p.owner_id OR pr.created_at <= p.created_at + INTERVAL '1 hour')
          )
        ORDER BY p.created_at DESC
    LOOP
        -- Update the place ownership
        UPDATE places 
        SET owner_id = current_session_user_id,
            updated_at = NOW()
        WHERE id = place_record.id;
        
        places_updated := places_updated + 1;
        
        RAISE NOTICE 'Updated place: % (%) - owner_id changed from % to %', 
                     place_record.title, 
                     place_record.id, 
                     place_record.owner_id, 
                     current_session_user_id;
    END LOOP;
    
    -- Also update the profile to use the current session user_id if needed
    UPDATE profiles 
    SET user_id = current_session_user_id,
        last_login_at = NOW()
    WHERE phone_number = target_phone_number
      AND user_id != current_session_user_id;
    
    IF FOUND THEN
        RAISE NOTICE 'Updated profile user_id to match current session: %', current_session_user_id;
    END IF;
    
    -- Summary
    RAISE NOTICE '=== FIX COMPLETE ===';
    RAISE NOTICE 'Places updated: %', places_updated;
    RAISE NOTICE 'Phone number: %', target_phone_number;
    RAISE NOTICE 'Session user_id: %', current_session_user_id;
    
    IF places_updated > 0 THEN
        RAISE NOTICE 'SUCCESS: Places should now appear in dashboard when you login with %', target_phone_number;
    ELSE
        RAISE NOTICE 'INFO: No places needed updating. Check if places exist for this phone number.';
    END IF;
    
END $$;

-- Verification query - run this after the fix to confirm it worked
SELECT 
    'VERIFICATION - Places that should show in dashboard:' as status,
    p.id,
    p.title,
    p.owner_id,
    p.is_active,
    pr.phone_number,
    pr.full_name
FROM places p
JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number = '+916296798907'  -- Replace with your phone number
  AND p.is_active = true
ORDER BY p.created_at DESC;

-- Show current session info
SELECT 
    'CURRENT SESSION INFO:' as info,
    'dev-' || REPLACE(REPLACE('+916296798907', '+', ''), '-', '') as expected_user_id,
    '+916296798907' as phone_number;  -- Replace with your phone number