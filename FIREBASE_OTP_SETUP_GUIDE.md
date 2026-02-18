# Firebase OTP Authentication Setup Guide

## Overview
This guide will help you set up Firebase Phone Authentication for your Mawqif Prayer Finder app to enable OTP verification for Indian phone numbers (+91).

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project"
   - Enter project name: `mawqif-prayer-finder`
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Add Android App to Firebase

1. **Register Android App**
   - Click "Add app" → Android icon
   - Enter Android package name: `com.mawqifapp` (or your package name)
   - Enter App nickname: `Mawqif Prayer Finder`
   - Click "Register app"

2. **Download Configuration File**
   - Download `google-services.json`
   - Place it in `android/app/` directory of your React Native project

## Step 3: Enable Phone Authentication

1. **Go to Authentication**
   - In Firebase Console, click "Authentication" in left sidebar
   - Click "Get started" if first time

2. **Enable Phone Provider**
   - Go to "Sign-in method" tab
   - Click "Phone" provider
   - Toggle "Enable"
   - Click "Save"

3. **Configure Phone Numbers for Testing (Optional)**
   - Scroll down to "Phone numbers for testing"
   - Add test phone numbers with verification codes
   - Example: `+919876543210` with code `123456`

## Step 4: Update Firebase Configuration

1. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click on your Android app
   - Copy the configuration object

2. **Update firebase.config.ts**
   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:android:abcdef123456",
   };
   ```

## Step 5: Configure Android for Firebase

1. **Update android/build.gradle**
   ```gradle
   buildscript {
     dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
     }
   }
   ```

2. **Update android/app/build.gradle**
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   
   dependencies {
     implementation 'com.google.firebase:firebase-auth'
   }
   ```

## Step 6: Test Phone Numbers (Development)

For testing during development, you can add test phone numbers:

1. **Go to Firebase Console**
   - Authentication → Sign-in method
   - Scroll to "Phone numbers for testing"

2. **Add Test Numbers**
   ```
   Phone: +919876543210
   Code: 123456
   
   Phone: +919999999999
   Code: 654321
   ```

## Step 7: Production Setup

For production, you'll need to:

1. **Enable App Verification**
   - Firebase automatically handles app verification
   - Ensure your app is signed with release keystore

2. **Set Usage Quotas**
   - Go to Firebase Console → Authentication → Usage
   - Monitor SMS usage and set appropriate limits

3. **Configure Authorized Domains**
   - Go to Authentication → Settings
   - Add your domain to authorized domains list

## Step 8: Testing the Implementation

1. **Run the App**
   ```bash
   npm start
   ```

2. **Test OTP Flow**
   - Navigate to any place detail screen
   - Tap "Get Directions" button
   - Should prompt for login
   - Enter Indian phone number (+91xxxxxxxxxx)
   - Receive OTP via SMS
   - Enter 6-digit OTP code
   - Should authenticate successfully

## Important Notes

### Phone Number Format
- Only Indian numbers (+91) are supported
- Format: +919876543210 (country code + 10 digits)
- Numbers must start with 6, 7, 8, or 9

### OTP Code
- Firebase sends 6-digit OTP codes
- Codes expire after 5 minutes
- Users can request new OTP after timeout

### Security Features
- Automatic app verification prevents abuse
- Rate limiting prevents spam
- Secure token-based authentication

## Troubleshooting

### Common Issues

1. **"Invalid phone number" Error**
   - Ensure number starts with +91
   - Check that number is 10 digits after country code
   - Verify number starts with 6, 7, 8, or 9

2. **"Too many requests" Error**
   - Firebase has rate limits
   - Wait before trying again
   - Use test numbers during development

3. **OTP Not Received**
   - Check phone number format
   - Verify Firebase configuration
   - Check SMS quotas in Firebase Console

4. **App Verification Failed**
   - Ensure google-services.json is in correct location
   - Verify package name matches Firebase config
   - Check app signing configuration

### Debug Steps

1. **Check Firebase Logs**
   ```bash
   npx react-native log-android
   ```

2. **Verify Configuration**
   - Check firebase.config.ts has correct values
   - Ensure google-services.json is present
   - Verify package name matches

3. **Test with Known Numbers**
   - Use test numbers from Firebase Console
   - Verify basic Firebase connection first

## Features Enabled

Once setup is complete, users will be able to:

✅ **Login with Phone Number**: Secure OTP-based authentication  
✅ **Access Directions**: Get directions to prayer places after login  
✅ **Profile Management**: View and update profile information  
✅ **Premium Features**: Access all authenticated features  
✅ **Persistent Login**: Stay logged in across app restarts  
✅ **Secure Logout**: Properly clear authentication state  

## Next Steps

After Firebase setup is complete:

1. Test the OTP flow thoroughly
2. Add additional authenticated features as needed
3. Monitor usage in Firebase Console
4. Set up proper error handling and user feedback
5. Consider adding social login options if needed

The Firebase OTP authentication system is now ready to protect your directions feature and provide secure user authentication for your Mawqif Prayer Finder app!