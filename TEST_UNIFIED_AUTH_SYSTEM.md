# Testing Guide: Unified Authentication System

## Quick Test Checklist

### 1. **Dev Mode Authentication Test**
- [ ] Open app and navigate to Profile → Authentication Mode
- [ ] Verify "Development Mode" is active (should show ACTIVE badge)
- [ ] Go to Login screen
- [ ] Enter phone number: `9876543210`
- [ ] Tap "Send OTP"
- [ ] Verify alert shows generated OTP (e.g., "Your OTP is: 123456")
- [ ] Enter the OTP from alert
- [ ] Verify successful login and navigation to main app

### 2. **Profile Integration Test**
- [ ] After login, go to Profile screen (hamburger menu)
- [ ] Verify phone number is displayed correctly
- [ ] Verify profile shows "Member since" date
- [ ] Tap "Edit Profile" and add:
  - First Name: "Test"
  - Last Name: "User"
  - City: "Mumbai"
- [ ] Save profile and verify changes are reflected
- [ ] Verify display name updated in header

### 3. **Place Management Test**
- [ ] Go to Add Place screen (center + button)
- [ ] Add a test place with your location
- [ ] Verify place appears on Home screen map
- [ ] Go to Dashboard (hamburger menu)
- [ ] Verify place appears in "My Places" section
- [ ] Toggle place status (Open/Closed)
- [ ] Verify status change is reflected

### 4. **Logout/Login Persistence Test**
- [ ] Note the place you added on the map
- [ ] Go to Profile → Logout
- [ ] Confirm logout
- [ ] Go to Home screen and verify your place is NOT visible
- [ ] Login again with same phone number
- [ ] Verify your place reappears on the map
- [ ] Verify profile data is restored
- [ ] Verify dashboard shows same places

### 5. **Firebase Mode Test** (Optional - requires Firebase setup)
- [ ] Go to Profile → Authentication Mode
- [ ] Tap "Firebase Mode"
- [ ] Confirm the switch (read warning about Firebase config)
- [ ] Logout and try login with real phone number
- [ ] Verify SMS is sent to your phone
- [ ] Enter OTP from SMS
- [ ] Verify login works with real authentication

### 6. **Dashboard Features Test**
- [ ] Login and go to Dashboard
- [ ] Verify profile image and info displayed
- [ ] Check host statistics (places, reviews, rating)
- [ ] If you have places, verify they appear in places list
- [ ] Try toggling place status
- [ ] Check contact information section

### 7. **Error Handling Test**
- [ ] Try login with invalid phone number (e.g., "123")
- [ ] Verify proper error message
- [ ] Try wrong OTP in dev mode
- [ ] Verify "Invalid verification code" error
- [ ] Test network disconnection during login
- [ ] Verify appropriate error handling

## Expected Results

### ✅ Successful Test Results

1. **Authentication**:
   - Dev mode shows OTP in alert
   - Firebase mode sends real SMS
   - Login creates user and profile automatically
   - Phone number synced between auth and profile

2. **Profile Management**:
   - Profile created on first login
   - Edits saved and reflected immediately
   - Display name updated across app
   - Profile data persists across sessions

3. **Place Visibility**:
   - User places visible when logged in
   - Places hidden when logged out
   - Places reappear on re-login
   - Database preserves all place data

4. **Dashboard Integration**:
   - Shows user profile information
   - Displays host statistics
   - Allows place management
   - Contact info syncing works

5. **Mode Switching**:
   - Can switch between dev/Firebase modes
   - Mode persists across app restarts
   - Same UI for both modes
   - Proper warnings for Firebase mode

### ❌ Common Issues & Solutions

1. **OTP Not Showing in Dev Mode**:
   - Check console logs for generated OTP
   - Verify USE_FIREBASE is false
   - Restart app if needed

2. **Profile Not Loading**:
   - Check Supabase connection
   - Verify profiles table exists
   - Check user_id matches between tables

3. **Places Not Hiding on Logout**:
   - Check PlacesService.toggleUserPlacesVisibility
   - Verify is_active column in places table
   - Check owner_id matches user.uid

4. **Firebase Mode Not Working**:
   - Verify firebaseConfig values are set
   - Check Firebase project has Phone Auth enabled
   - Ensure proper reCAPTCHA setup

5. **Dashboard Not Loading**:
   - Check user has places in database
   - Verify foreign key relationships
   - Check host status in users table

## Test Data Setup

### Sample Phone Numbers (Dev Mode)
- `9876543210` - Standard test number
- `8765432109` - Alternative test number
- `7654321098` - Third test number

### Sample Profile Data
```
First Name: Test
Last Name: User
Date of Birth: 1990-01-01
Gender: Male/Female/Other
City: Mumbai
```

### Sample Place Data
```
Title: Test Prayer Space
Type: Mosque/Temple/Church
Address: Your current location
Amenities: Parking, Washroom, AC
```

## Debugging Tips

### Console Logs to Watch
```
🔧 Auth mode set to: dev
📱 Loading profile for user: [user-id]
✅ Profile loaded: [profile-name]
👁️ Showing user places...
🙈 Hiding user places...
✅ Places shown/hidden
```

### Database Queries to Check
```sql
-- Check user record
SELECT * FROM users WHERE phone_number = '+919876543210';

-- Check profile record
SELECT * FROM profiles WHERE phone_number = '+919876543210';

-- Check user places
SELECT * FROM places WHERE owner_id = '[user-id]';

-- Check place visibility
SELECT id, title, is_active FROM places WHERE owner_id = '[user-id]';
```

### Auth Store State to Verify
```javascript
// In React DevTools or console
console.log(useAuthStore.getState());
// Should show:
// - user: { uid, phoneNumber, displayName }
// - userProfile: { id, user_id, phone_number, full_name, ... }
// - isAuthenticated: true
// - authMode: 'dev' or 'firebase'
```

## Performance Testing

### Load Testing
- [ ] Login with multiple test accounts
- [ ] Add multiple places per user
- [ ] Test logout/login cycles
- [ ] Verify no memory leaks

### Network Testing
- [ ] Test with slow network
- [ ] Test with intermittent connectivity
- [ ] Verify offline behavior
- [ ] Check error recovery

### Device Testing
- [ ] Test on different screen sizes
- [ ] Test on iOS and Android
- [ ] Verify responsive design
- [ ] Check performance on older devices

## Security Testing

### Input Validation
- [ ] Test with invalid phone numbers
- [ ] Test with special characters
- [ ] Test with very long inputs
- [ ] Verify proper sanitization

### Authentication Security
- [ ] Test OTP expiration
- [ ] Test multiple OTP requests
- [ ] Verify session management
- [ ] Check logout security

### Data Protection
- [ ] Verify profile data encryption
- [ ] Check image upload security
- [ ] Test access control
- [ ] Verify no data leakage

## Completion Criteria

The unified authentication system is working correctly when:

✅ **All test cases pass**
✅ **No console errors during normal flow**
✅ **Profile data persists across sessions**
✅ **Places show/hide correctly on login/logout**
✅ **Dashboard displays accurate information**
✅ **Mode switching works seamlessly**
✅ **Error handling is user-friendly**
✅ **Performance is acceptable on target devices**

## Next Steps After Testing

1. **Production Setup**:
   - Configure Firebase with real credentials
   - Set up production Supabase instance
   - Configure proper SMS limits and costs

2. **User Experience**:
   - Add onboarding flow for new users
   - Implement profile completion prompts
   - Add helpful tooltips and guides

3. **Advanced Features**:
   - Add social login options
   - Implement email verification
   - Add two-factor authentication

4. **Monitoring**:
   - Set up analytics for auth flows
   - Monitor error rates and success rates
   - Track user engagement metrics