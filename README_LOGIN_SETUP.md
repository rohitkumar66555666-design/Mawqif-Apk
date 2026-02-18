# 📱 Mawqif Prayer Finder - Phone OTP Login System

Complete React Native Expo login screen with phone OTP verification for the Mawqif app.

## 🚀 Features

- ✅ **Two-Step Flow**: Phone input → OTP verification
- ✅ **Dev Mode**: Works with ANY Indian number + ANY 6-digit OTP
- ✅ **Future-Proof**: Firebase placeholders ready for production
- ✅ **Production UI**: Modern design with animations and error handling
- ✅ **State Management**: Zustand store with persistence
- ✅ **Expo Go Compatible**: No native modules required in dev mode

## 🔧 Current Setup (Dev Mode)

### Default Configuration
```typescript
// src/lib/firebaseConfig.ts
export const USE_FIREBASE = false; // Dev mode enabled
```

### Testing Credentials
- **Phone**: Any 10-digit Indian number (6-9 prefix)
- **Examples**: `9876543210`, `8765432109`, `7654321098`
- **OTP**: Any 6-digit code (shown in dev alert)

## 📱 How to Test

1. **Start the app**: `npx expo start --tunnel`
2. **Navigate**: Menu (☰) → "Login"
3. **Enter phone**: Any valid Indian number
4. **Tap "Send OTP"**: Dev alert shows generated OTP
5. **Enter OTP**: Use the code from the alert
6. **Success**: Redirects to Dashboard screen

## 🔥 Firebase Setup (Production)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `mawqif-prayer-finder`
4. Enable Google Analytics (optional)

### Step 2: Enable Phone Authentication
1. **Authentication** → **Sign-in method**
2. **Phone** → **Enable**
3. **Add test phone numbers** (optional):
   - Phone: `+91 9876543210`
   - Code: `123456`

### Step 3: Add Web App
1. **Project Overview** → **Add app** → **Web**
2. App nickname: `Mawqif Web`
3. **Copy the config object**

### Step 4: Configure App
Replace values in `src/lib/firebaseConfig.ts`:

```typescript
export const USE_FIREBASE = true; // Enable Firebase

export const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id" // Optional
};
```

### Step 5: Install Firebase Dependencies
```bash
npm install firebase
```

### Step 6: Test Production
```bash
npx expo start --tunnel
```

## 📁 File Structure

```
src/
├── lib/
│   ├── firebaseConfig.ts     # Firebase config + mock functions
│   └── authStore.ts          # Zustand auth store
├── components/
│   ├── PhoneInput.tsx        # Phone number input component
│   └── OTPInput.tsx          # OTP verification component
├── screens/
│   ├── LoginScreen.tsx       # Main login screen
│   └── DashboardScreen.tsx   # Success screen
└── navigation/
    └── AppNavigator.tsx      # Navigation setup
```

## 🎨 UI Components

### Phone Input Screen
- **Logo**: Mosque icon with app branding
- **Phone Input**: Country picker with +91 default
- **Validation**: Real-time Indian number validation
- **Send Button**: Animated with loading states
- **Dev Indicator**: Shows "DEV MODE" when Firebase disabled

### OTP Input Screen
- **Back Button**: Return to phone input
- **6-Digit Input**: Auto-focus with shake animation on error
- **Resend Timer**: 60-second countdown
- **Error Handling**: Clear error messages with vibration
- **Loading States**: Full-screen overlay during verification

### Dashboard Screen
- **Welcome Message**: Success confirmation
- **User Info**: Phone number and verification status
- **Quick Actions**: Navigate to main app or settings
- **Sign Out**: Secure logout with confirmation

## 🔧 Development Features

### Mock OTP Generation
```typescript
// Generates random 6-digit OTP
const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();

// Shows in dev alert for testing
Alert.alert('🔐 DEV MODE - OTP Generated', `Your OTP is: ${mockOTP}`);
```

### State Persistence
```typescript
// Zustand store with AsyncStorage
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      // ... other state
    }),
    {
      name: 'mawqif-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Error Handling
- **Network Errors**: Retry mechanisms
- **Invalid OTP**: Shake animation + vibration
- **Timeout**: Auto-resend options
- **Validation**: Real-time phone number checking

## 🚨 Production Considerations

### Security
- **Rate Limiting**: Implement on Firebase Functions
- **Phone Validation**: Server-side verification
- **OTP Expiry**: Set appropriate timeouts
- **Fraud Detection**: Monitor unusual patterns

### Performance
- **Caching**: Store verification results
- **Offline**: Handle network failures gracefully
- **Memory**: Clean up timers and listeners

### UX Improvements
- **Auto-detect**: SMS OTP auto-fill (native builds)
- **Biometric**: Add fingerprint/face unlock
- **Social Login**: Google/Apple sign-in options
- **Guest Mode**: Allow limited access without login

## 🐛 Troubleshooting

### Common Issues

**1. "Something went wrong" in Expo Go**
```bash
# Clear cache and restart
npx expo start --clear
```

**2. Phone input not working**
```bash
# Check dependencies
npm install react-native-phone-number-input
```

**3. OTP input not focusing**
```bash
# Check react-native-otp-entry version
npm install react-native-otp-entry@^1.8.5
```

**4. Firebase errors in dev mode**
```typescript
// Ensure Firebase is disabled
export const USE_FIREBASE = false;
```

### Debug Mode
```typescript
// Enable detailed logging
console.log('🔐 Auth State:', useAuthStore.getState());
console.log('📱 Phone Number:', phoneNumber);
console.log('🔥 Firebase Enabled:', USE_FIREBASE);
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Ensure Firebase config is correct (if using production)
4. Test with different phone numbers

## 🎯 Next Steps

1. **Test thoroughly** in dev mode
2. **Set up Firebase** when ready for production
3. **Add biometric authentication** for better UX
4. **Implement social login** options
5. **Add phone number verification** for existing users

---

**Happy coding! 🚀**