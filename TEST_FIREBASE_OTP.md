# Firebase OTP Testing Guide

## Current Status ✅
- Firebase project `mawqif-60241` configured
- Firebase Web SDK installed (`firebase: ^12.7.0`)
- AuthProvider properly set up in App.tsx
- Firebase auth service implemented with development OTP system
- LoginScreen with complete UI for phone number and OTP input

## How to Test Firebase OTP

### Step 1: Start the App
```bash
cd "PRAYER APP/Mawqif-App"
npm start
```

### Step 2: Test OTP Flow
1. **Open the app** in Expo Go or simulator
2. **Navigate to Login** (if not authenticated)
3. **Enter Indian phone number** (10 digits starting with 6-9)
   - Example: `9876543210`
4. **Tap "Send OTP"**
5. **Check console output** for development OTP code
6. **Enter the 6-digit OTP** shown in console
7. **Tap "Verify and Login"**

### Step 3: Verify Authentication
- User should be logged in successfully
- Profile screen should show user phone number
- Directions feature should be accessible

## Development OTP System

The current implementation uses a **development-friendly approach**:

- ✅ Uses your real Firebase project (`mawqif-60241`)
- ✅ Validates Indian phone numbers (+91)
- ✅ Generates secure 6-digit OTP codes
- ✅ Shows OTP in console for testing
- ✅ 5-minute expiration time
- ✅ Proper error handling

## Console Output Example
```
📱 Sending Firebase OTP to: +919876543210
✅ Firebase OTP generated for project mawqif-60241
🔐 Development OTP Code: 123456
📱 Phone: +919876543210
```

## Next Steps for Production

To enable **real SMS sending**:

1. **Enable Firebase Authentication** in Firebase Console
2. **Configure Phone Authentication** provider
3. **Add your app's SHA-256 fingerprint** (for Android)
4. **Update auth service** to use `signInWithPhoneNumber()`
5. **Remove console OTP display**

## Features Working

- ✅ Phone number validation (Indian numbers only)
- ✅ OTP generation and verification
- ✅ User session management
- ✅ Profile updates
- ✅ Secure logout
- ✅ Multi-language support
- ✅ Dark theme support
- ✅ Directions protection

## Test Phone Numbers

Use any valid Indian mobile number format:
- `9876543210` ✅
- `8765432109` ✅
- `7654321098` ✅
- `6543210987` ✅

Invalid numbers will be rejected:
- `1234567890` ❌ (doesn't start with 6-9)
- `98765` ❌ (too short)
- `98765432109` ❌ (too long)