# Dashboard Places Not Showing - Fix Guide

## Problem
You login with the same phone number that was used to create a place, but the place doesn't appear in the dashboard where hosts can edit their places.

## Root Cause
The `owner_id` in the places table doesn't match the current session's `user_id`. This happens because:
1. User IDs are generated differently between sessions
2. The place was created with one user_id, but the current session has a different user_id
3. The dashboard looks for places where `owner_id = current_user_id`

## Quick Fix Steps

### Step 1: Update the SQL Script
1. Open `COMPLETE_DASHBOARD_PLACES_FIX.sql`
2. Find this line: `target_phone_number TEXT := '+916296798907';`
3. Replace `+916296798907` with your actual phone number
4. Save the file

### Step 2: Run the Fix Script
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `COMPLETE_DASHBOARD_PLACES_FIX.sql`
4. Click "Run" to execute the script

### Step 3: Verify the Fix
The script will show output like:
```
✅ SUCCESS: 1 place(s) should now appear in dashboard when you login with +916296798907
```

### Step 4: Test in App
1. Logout from the app
2. Login again with the same phone number
3. Go to Dashboard
4. Your places should now appear

## What the Fix Does

1. **Identifies the Issue**: Finds places that should belong to your phone number but have mismatched owner_ids
2. **Updates Profile**: Ensures your profile uses the current session user_id
3. **Updates Places**: Changes place owner_ids to match your current session user_id
4. **Makes Places Visible**: Ensures places are active and visible
5. **Verifies Results**: Shows you exactly what will appear in the dashboard

## Expected Results

After running the fix:
- ✅ Places appear in dashboard when you login
- ✅ You can edit place information
- ✅ You can toggle place status (open/closed)
- ✅ Host statistics show correctly
- ✅ All functionality works as expected

## Troubleshooting

### If places still don't show:
1. Check the verification queries at the end of the SQL script
2. Ensure you updated the phone number in the script
3. Verify the place was actually created (check the places table)
4. Make sure you're logging in with the exact same phone number

### If you get SQL errors:
1. Make sure you have the correct permissions in Supabase
2. Check that all tables exist (places, profiles)
3. Verify the phone number format is correct

## Technical Details

### User ID Generation Logic
The app generates user IDs like this:
```
'dev-' + phone_number_without_plus_and_dashes
```

Example: `+91-629-679-8907` becomes `dev-916296798907`

### Dashboard Query Logic
The dashboard looks for places like this:
```sql
SELECT * FROM places 
WHERE owner_id = current_user_id 
AND is_active = true
```

### The Fix Logic
1. Generate the correct current session user_id
2. Find all profiles with your phone number
3. Update profiles to use current session user_id
4. Find places that should belong to you
5. Update places to use current session user_id
6. Ensure places are visible (is_active = true)

## Prevention

To prevent this issue in the future:
1. The app code has been updated to handle user_id consistency
2. Place ownership is now restored automatically on login
3. Phone number acts as the permanent identity key

---

**Status**: Ready to fix
**Time Required**: 2-3 minutes
**Risk**: Low (only updates ownership, doesn't delete data)
**Backup**: The script shows all changes before making them