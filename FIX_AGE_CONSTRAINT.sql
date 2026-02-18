-- ============================================
-- FIX AGE CONSTRAINT ISSUE
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the existing age constraint that's too restrictive
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_age;

-- Add a more reasonable age constraint
-- Allow ages 0-120, or NULL (for when date_of_birth is not provided)
ALTER TABLE public.profiles ADD CONSTRAINT valid_age 
CHECK (age IS NULL OR (age >= 0 AND age <= 120));

-- Verify the constraint is updated
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
    AND conname = 'valid_age';

-- Success message
SELECT 'Age constraint updated successfully! Now allows ages 0-120.' as result;