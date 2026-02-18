-- Complete fix for Place Status Control section not showing
-- This script will:
-- 1. Add status columns if missing
-- 2. Set user as host
-- 3. Ensure user has places
-- 4. Add status data to existing places

-- Step 1: Add status management columns to places table (if not exists)
DO $$
BEGIN
  -- Add is_open column (manual open/closed status)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'is_open'
  ) THEN
    ALTER TABLE places ADD COLUMN is_open BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added is_open column';
  ELSE
    RAISE NOTICE 'is_open column already exists';
  END IF;

  -- Add status_message column (reason for closure)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'status_message'
  ) THEN
    ALTER TABLE places ADD COLUMN status_message TEXT;
    RAISE NOTICE 'Added status_message column';
  ELSE
    RAISE NOTICE 'status_message column already exists';
  END IF;

  -- Add status_updated_at column (when status was last changed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'status_updated_at'
  ) THEN
    ALTER TABLE places ADD COLUMN status_updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added status_updated_at column';
  ELSE
    RAISE NOTICE 'status_updated_at column already exists';
  END IF;

  -- Add status_updated_by column (who changed the status)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'places' AND column_name = 'status_updated_by'
  ) THEN
    ALTER TABLE places ADD COLUMN status_updated_by TEXT REFERENCES users(id);
    RAISE NOTICE 'Added status_updated_by column';
  ELSE
    RAISE NOTICE 'status_updated_by column already exists';
  END IF;
END $$;

-- Step 2: Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_places_is_open ON places(is_open);
CREATE INDEX IF NOT EXISTS idx_places_status_updated_at ON places(status_updated_at);

-- Step 3: Set user as host and update host info
UPDATE users 
SET 
  is_host = true,
  host_since = COALESCE(host_since, NOW()),
  updated_at = NOW()
WHERE id = 'mock_user_1766668547393';

-- Step 4: Update existing places with default status values
UPDATE places 
SET 
  is_open = COALESCE(is_open, true),
  status_updated_at = COALESCE(status_updated_at, NOW()),
  status_updated_by = COALESCE(status_updated_by, owner_id)
WHERE owner_id = 'mock_user_1766668547393';

-- Step 5: If no places exist, create a sample place for testing
INSERT INTO places (
  id, title, address, type, latitude, longitude, city, 
  owner_id, is_active, is_open, status_updated_at, status_updated_by, created_at
)
SELECT 
  'sample_place_' || EXTRACT(EPOCH FROM NOW())::text,
  'Sample Prayer Space',
  'Test Address, Mumbai',
  'masjid',
  19.0760,
  72.8777,
  'Mumbai',
  'mock_user_1766668547393',
  true,
  true,
  NOW(),
  'mock_user_1766668547393',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM places WHERE owner_id = 'mock_user_1766668547393'
);

-- Step 6: Update user's total places count
UPDATE users 
SET total_places_added = (
  SELECT COUNT(*) FROM places WHERE owner_id = 'mock_user_1766668547393' AND is_active = true
)
WHERE id = 'mock_user_1766668547393';

-- Verification: Show final status
SELECT 
  'Final Status Check' as check_type,
  u.id as user_id,
  u.is_host,
  u.host_since,
  u.total_places_added,
  COUNT(p.id) as actual_places_count,
  COUNT(CASE WHEN p.is_open = true THEN 1 END) as open_places,
  COUNT(CASE WHEN p.is_open = false THEN 1 END) as closed_places
FROM users u
LEFT JOIN places p ON u.id = p.owner_id AND p.is_active = true
WHERE u.id = 'mock_user_1766668547393'
GROUP BY u.id, u.is_host, u.host_since, u.total_places_added;

-- Show places with status
SELECT 
  'User Places with Status' as info,
  id,
  title,
  is_active,
  is_open,
  status_message,
  status_updated_at,
  created_at
FROM places 
WHERE owner_id = 'mock_user_1766668547393'
ORDER BY created_at DESC;

SELECT 'Place Status Control section should now be visible in Dashboard!' as success_message;