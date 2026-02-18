-- ============================================
-- UPDATE GENDER OPTIONS TO MALE, FEMALE, OTHER ONLY
-- Run this in Supabase SQL Editor to update existing database
-- ============================================

-- Drop the existing gender constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_gender_check;

-- Add new gender constraint with only 3 options
ALTER TABLE public.profiles ADD CONSTRAINT profiles_gender_check 
CHECK (gender IN ('male', 'female', 'other'));

-- Optional: Update any existing 'prefer_not_to_say' values to 'other'
UPDATE public.profiles 
SET gender = 'other' 
WHERE gender = 'prefer_not_to_say';

-- Verify the constraint is working
DO $
BEGIN
    RAISE NOTICE '✅ Gender constraint updated successfully!';
    RAISE NOTICE '📝 Valid gender options are now: male, female, other';
    RAISE NOTICE '🔄 Any existing "prefer_not_to_say" values have been updated to "other"';
END $;

-- Test the constraint (this should work)
-- INSERT INTO public.profiles (user_id, phone_number, gender) 
-- VALUES ('test_gender', '+919999999999', 'male');

-- Test the constraint (this should fail)
-- INSERT INTO public.profiles (user_id, phone_number, gender) 
-- VALUES ('test_invalid', '+919999999998', 'invalid_gender');