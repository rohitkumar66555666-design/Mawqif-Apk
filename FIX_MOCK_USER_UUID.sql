-- ============================================
-- FIX MOCK USER UUID ISSUE
-- Convert existing mock user data to proper UUID format
-- ============================================

-- First, let's see if there are any places with mock user IDs
SELECT 
  'Current Places with Mock Users' as info,
  COUNT(*) as count
FROM places 
WHERE owner_id::text LIKE 'mock_user_%';

-- Create a proper UUID for the mock user
DO $$
DECLARE
  new_uuid UUID := gen_random_uuid();
  mock_user_pattern TEXT := 'mock_user_%';
BEGIN
  -- Update any places that have mock user IDs to use a proper UUID
  UPDATE places 
  SET owner_id = new_uuid
  WHERE owner_id::text LIKE mock_user_pattern;
  
  -- Insert a user record for this UUID if places were updated
  IF FOUND THEN
    INSERT INTO users (id, phone_number, name, display_name, is_verified, is_host, total_places_added)
    VALUES (
      new_uuid, 
      '+1234567890', 
      'Test User', 
      'Test User', 
      true, 
      true, 
      (SELECT COUNT(*) FROM places WHERE owner_id = new_uuid)
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Updated mock user data to UUID: %', new_uuid;
  END IF;
END $$;

-- Also make sure the places table owner_id column is properly typed
DO $$
BEGIN
  -- Check if owner_id column exists and is UUID type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' 
    AND column_name = 'owner_id' 
    AND data_type != 'uuid'
  ) THEN
    -- If it's not UUID type, we need to fix it
    ALTER TABLE places ALTER COLUMN owner_id TYPE UUID USING owner_id::UUID;
  END IF;
END $$;

-- Success message
SELECT 'Mock user UUID issue fixed! Restart your app now.' as status;