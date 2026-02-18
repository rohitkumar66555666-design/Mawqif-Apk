-- ============================================
-- FIXED USER PROFILES TABLE SETUP (No Generated Columns)
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing profiles table if it exists (CAREFUL: This will delete all existing data)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create comprehensive user profiles table (without generated columns)
CREATE TABLE public.profiles (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL, -- From Firebase/Auth system
    
    -- Basic information
    phone_number TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT, -- Will be updated via triggers
    
    -- Personal details
    date_of_birth DATE,
    age INTEGER, -- Will be updated via triggers
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

-- Create function to update full_name and age
CREATE OR REPLACE FUNCTION update_profile_computed_fields()
RETURNS TRIGGER AS $
BEGIN
    -- Update full_name
    NEW.full_name := CASE 
        WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL 
        THEN NEW.first_name || ' ' || NEW.last_name
        WHEN NEW.first_name IS NOT NULL 
        THEN NEW.first_name
        WHEN NEW.last_name IS NOT NULL 
        THEN NEW.last_name
        ELSE 'User'
    END;
    
    -- Update age
    NEW.age := CASE 
        WHEN NEW.date_of_birth IS NOT NULL 
        THEN DATE_PART('year', AGE(NEW.date_of_birth))::INTEGER
        ELSE NULL
    END;
    
    -- Update updated_at
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_profile_computed_fields
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_computed_fields();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Public read access for profile images and basic info (for reviews, etc.)
CREATE POLICY "Public read access for basic profile info" ON public.profiles
    FOR SELECT USING (is_active = true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample profiles for testing
INSERT INTO public.profiles (
    user_id, 
    phone_number, 
    first_name, 
    last_name, 
    date_of_birth, 
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
    '1990-05-15', 
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
    '1995-08-22', 
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
    '1988-12-03', 
    'male', 
    'Bangalore', 
    'Karnataka',
    NULL,
    true
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if table was created successfully
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data and computed fields
SELECT 
    id,
    user_id,
    phone_number,
    first_name,
    last_name,
    full_name, -- Should be auto-computed
    age, -- Should be auto-computed
    gender,
    city,
    is_verified,
    created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Check indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
    AND schemaname = 'public';

-- Test computed fields by inserting a new record
INSERT INTO public.profiles (user_id, phone_number, first_name, last_name, date_of_birth, gender, city) 
VALUES ('test_computed', '+919999999999', 'Test', 'User', '2000-01-01', 'other', 'Test City');

-- Verify the computed fields worked
SELECT user_id, first_name, last_name, full_name, date_of_birth, age 
FROM public.profiles 
WHERE user_id = 'test_computed';

-- Clean up test record
DELETE FROM public.profiles WHERE user_id = 'test_computed';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $
BEGIN
    RAISE NOTICE '✅ User profiles table created successfully!';
    RAISE NOTICE '📱 Features included:';
    RAISE NOTICE '   - Phone number (unique, validated)';
    RAISE NOTICE '   - First name, Last name (auto-computed full name)';
    RAISE NOTICE '   - Date of birth (auto-calculated age)';
    RAISE NOTICE '   - Gender (male, female, other only)';
    RAISE NOTICE '   - City, State, Country';
    RAISE NOTICE '   - Profile image URL';
    RAISE NOTICE '   - Verification status';
    RAISE NOTICE '   - Timestamps and metadata';
    RAISE NOTICE '🔒 Row Level Security enabled';
    RAISE NOTICE '📊 Performance indexes created';
    RAISE NOTICE '🧪 Sample data inserted for testing';
    RAISE NOTICE '⚡ Computed fields handled via triggers (no immutability issues)';
END $;