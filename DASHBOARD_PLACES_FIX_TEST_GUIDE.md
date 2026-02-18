# Dashboard Places Fix - Test Guide

## Issue Fixed
**Problem**: User logs out and logs back in, places show on home screen but not in dashboard for editing/management.

**Root Cause**: In dev mode, each login generated a new random UUID, causing places to be orphaned from the new user session.

## Solution Implemented

### 1. **Consistent User IDs in Dev Mode**
- Modified `generateConsistentMockUUID()` to create the same UUID for the same phone number
- Ensures user gets the same ID across login sessions

### 2. **Enhanced Profile Management**
- Fixed `getOrCreateProfile()` call in auth store to use proper object parameter
- Profile service now properly links existing profiles to new user sessions

### 3. **Smart Place Lookup**
- Enhanced `getHostPlacesWithStatus()` to find places by phone number if user ID lookup fails
- Automatically updates place ownership to current user ID
- Handles user ID migration seamlessly

### 4. **Robust Place Visibility**
- Enhanced `toggleUserPlacesVisibility()` to handle phone number lookup
- Updates orphaned places to current user ID on login

## Test Steps

### **Test 1: Basic Login/Logout Cycle**
1. **Login** with phone number `9876543210`
2. **Add a place** using the + button
3. **Verify place shows** on home screen map
4. **Go to Dashboard** and verify place shows in "My Places" section
5. **Logout** from Profile screen
6. **Verify place disappears** from home screen
7. **Login again** with same phone number `9876543210`
8. **Verify place reappears** on home screen
9. **Go to Dashboard** and **verify place shows** in "My Places" section ✅

### **Test 2: Multiple Login/Logout Cycles**
1. Login → Add place → Logout → Login → Check dashboard
2. Repeat 3-4 times to ensure consistency
3. Each time, places should appear in both home screen and dashboard

### **Test 3: Multiple Places**
1. Login and add 2-3 places
2. Logout and login again
3. Verify all places appear in dashboard for management

### **Test 4: Place Management After Re-login**
1. Login → Add place → Logout → Login
2. Go to Dashboard
3. Try to toggle place status (Open/Closed)
4. Try to edit place details
5. Verify all management features work

## Debug Console Logs to Watch

### **On Login:**
```
🔐 Login process started for user: +919876543210 with ID: dev-12345678-1234-4abc-8def-123456789012
📱 Loading profile for: +919876543210 with user ID: dev-12345678-1234-4abc-8def-123456789012
👁️ About to show places for user ID: dev-12345678-1234-4abc-8def-123456789012
✅ Profile loaded/created: Test User for user ID: dev-12345678-1234-4abc-8def-123456789012
```

### **On Dashboard Load:**
```
🏪 Getting host places with status for user: dev-12345678-1234-4abc-8def-123456789012
✅ Fetched 1 host places with status
```

### **If Phone Number Lookup is Needed:**
```
🔍 No places found for user ID, trying phone number lookup...
📱 Found phone number: +919876543210 searching for places...
📱 Found 1 places by phone number, updating owner_id...
✅ Updated place ownership to current user ID
```

## Expected Results

### ✅ **Success Indicators:**
- Same phone number always gets same user ID (consistent UUID)
- Places appear in both home screen and dashboard after re-login
- All dashboard management features work after re-login
- Console shows successful place ownership updates when needed

### ❌ **Failure Indicators:**
- Places show on home but not in dashboard
- Different user IDs for same phone number
- Dashboard shows "No places" after re-login
- Console errors about missing places or user ID mismatches

## Database Verification

Run the debug script to check data consistency:

```sql
-- Check if same phone number has consistent user ID
SELECT 
  phone_number,
  COUNT(DISTINCT user_id) as user_id_count,
  array_agg(DISTINCT user_id) as user_ids
FROM profiles 
WHERE phone_number = '+919876543210'  -- Your test number
GROUP BY phone_number;
```

**Expected**: `user_id_count` should be 1 (consistent user ID)

```sql
-- Check places ownership
SELECT 
  p.title,
  p.owner_id,
  p.is_active,
  pr.phone_number
FROM places p
JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.phone_number = '+919876543210';
```

**Expected**: All places should have the same `owner_id` matching the current user session

## Troubleshooting

### **Issue**: Places still not showing in dashboard
**Solution**: Run the debug SQL script and check for orphaned places:

```sql
-- Find orphaned places
SELECT p.*, pr.phone_number 
FROM places p
LEFT JOIN profiles pr ON p.owner_id = pr.user_id
WHERE pr.user_id IS NULL;
```

### **Issue**: Multiple user IDs for same phone number
**Solution**: The profile service should automatically consolidate these, but you can manually fix:

```sql
-- Update places to use latest user_id for phone number
UPDATE places 
SET owner_id = (
  SELECT user_id 
  FROM profiles 
  WHERE phone_number = '+919876543210'
  ORDER BY last_login_at DESC 
  LIMIT 1
)
WHERE owner_id IN (
  SELECT user_id 
  FROM profiles 
  WHERE phone_number = '+919876543210'
);
```

## Files Modified

1. **`src/lib/firebaseConfig.ts`**: Consistent UUID generation for dev mode
2. **`src/lib/authStore.ts`**: Fixed getOrCreateProfile call and added debugging
3. **`src/services/places.service.ts`**: Enhanced place lookup and ownership management
4. **`DEBUG_DASHBOARD_PLACES_ISSUE.sql`**: Debug script for troubleshooting

## Verification Checklist

- [ ] Login with test phone number
- [ ] Add a place and verify it shows on home screen
- [ ] Verify place shows in dashboard
- [ ] Logout completely
- [ ] Login again with same phone number
- [ ] Verify place shows on home screen
- [ ] **Verify place shows in dashboard** ✅
- [ ] Verify can edit/manage place in dashboard
- [ ] Check console logs for successful operations
- [ ] Run debug SQL to verify data consistency

The fix ensures that users can seamlessly access and manage their places across login sessions, maintaining data consistency and providing a smooth user experience.