-- ============================================
-- MINIMAL USERS TABLE CREATION
-- Just create the users table to fix the immediate error
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (minimal version)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  display_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE,
  host_since TIMESTAMPTZ,
  total_places_added INTEGER DEFAULT 0,
  total_reviews_received INTEGER DEFAULT 0,
  host_rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Basic policy
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);

-- Success message
SELECT 'Users table created! Now test your app.' as status;