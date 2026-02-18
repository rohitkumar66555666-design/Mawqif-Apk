-- Create Test Place for User to See Dashboard Features
-- This will create a sample place so you can see the dashboard working

-- 1. First, get your user ID
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get your user ID
    SELECT id INTO user_uuid 
    FROM users 
    WHERE phone_number = '+918655102089'
    LIMIT 1;
    
    -- If user doesn't exist, create one
    IF user_uuid IS NULL THEN
        INSERT INTO users (
            id,
            phone_number,
            is_host,
            host_since,
            total_places_added,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            '+918655102089',
            true,
            NOW(),
            1,
            NOW(),
            NOW()
        ) RETURNING id INTO user_uuid;
        
        RAISE NOTICE 'Created new user with ID: %', user_uuid;
    ELSE
        -- Update existing user to be host
        UPDATE users 
        SET is_host = true,
            host_since = COALESCE(host_since, NOW()),
            total_places_added = COALESCE(total_places_added, 0) + 1,
            updated_at = NOW()
        WHERE id = user_uuid;
        
        RAISE NOTICE 'Updated existing user with ID: %', user_uuid;
    END IF;
    
    -- Create a test place
    INSERT INTO places (
        id,
        title,
        type,
        address,
        latitude,
        longitude,
        owner_id,
        is_active,
        is_open,
        status_message,
        created_at,
        updated_at,
        total_reviews,
        total_bookmarks,
        avg_rating
    ) VALUES (
        gen_random_uuid(),
        'APPOPOLEIS Test Place',
        'office',
        'Shop no 1 Crystal Kanungo MIRA road East',
        19.2952325,
        72.8543792,
        user_uuid,
        true,
        true,
        'Test place for dashboard',
        NOW(),
        NOW(),
        0,
        0,
        0.0
    );
    
    RAISE NOTICE 'Created test place for user';
END $$;

-- 2. Verify the place was created
SELECT 
    'VERIFICATION' as section,
    u.phone_number,
    u.is_host,
    p.title,
    p.type,
    p.address,
    p.is_active,
    p.is_open,
    p.created_at
FROM users u
JOIN places p ON u.id = p.owner_id
WHERE u.phone_number = '+918655102089'
ORDER BY p.created_at DESC;