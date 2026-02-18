-- ============================================
-- SIMPLE USER PROFILES TABLE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing profiles table if it exists (CAREFUL: This will delete all existing data)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create comprehensive user profiles table (simple version)
CREATE TABLE public.profiles (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    
    -- Basic information
    phone_number TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    
    -- Personal details
    date_of_birth DATE,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    
    -- Location information
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    
    -- Profile image
    profile_image_url TEXT,
    
    -- App-specific data
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\+91[6-9]\d{9}$'),
    CONSTRAINT valid_age CHECK (age IS NULL OR (age >= 13 AND age <= 120)),
    CONSTRAINT valid_names CHECK (
        (first_name IS NULL OR LENGTH(TRIM(first_name)) >= 2) AND
        (last_name IS NULL OR LENGTH(TRIM(last_name)) >= 2)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_phone_number ON public.profiles(phone_number);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Create simple trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS 
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ 
LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Public read access for basic profile info" ON public.profiles
    FOR SELECT USING (is_active = true);

-- Insert sample profiles for testing
INSERT INTO public.profiles (
    user_id, 
    phone_number, 
    first_name, 
    last_name, 
    full_name,
    date_of_birth, 
    age,
    gender, 
    city, 
    state,
    profile_image_url,
    is_verified
) VALUES 
(
    'dev_user_123', 
    '+919876543210', 
    'Ahmed', 
    'Khan', 
    'Ahmed Khan',
    '1990-05-15', 
    34,
    'male', 
    'Mumbai', 
    'Maharashtra',
    NULL,
    true
),
(
    'dev_user_456', 
    '+919876543211', 
    'Fatima', 
    'Sheikh', 
    'Fatima Sheikh',
    '1995-08-22', 
    29,
    'female', 
    'Delhi', 
    'Delhi',
    NULL,
    true
),
(
    'dev_user_789', 
    '+919876543212', 
    'Mohammad', 
    'Ali', 
    'Mohammad Ali',
    '1988-12-03', 
    36,
    'male', 
    'Bangalore', 
    'Karnataka',
    NULL,
    true
);

-- Success message
SELECT 'User profiles table created successfully!' as status;