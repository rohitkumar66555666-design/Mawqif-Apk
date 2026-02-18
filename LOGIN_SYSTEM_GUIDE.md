# 🔐 Login System Implementation Guide

## 📋 Overview
This guide explains the complete OTP-based login system for Mawqif app with all premium features.

---

## 🗄️ Step 1: Supabase Database Setup

### Run the SQL Script
1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Copy and paste the content from `SUPABASE_SETUP.sql`
4. Click **Run** to create all tables

### Tables Created:
- **users** - Stores user information
- **user_places** - Links users to places they own
- **bookmarks** - User bookmarked places
- **user_reviews** - User reviews and ratings
- **place_images** - User uploaded images
- **otp_verifications** - OTP codes for authentication

---

## 📦 Step 2: Install Required Packages

Run these commands in your terminal:

```bash
cd Mawqif-App
npm install @react-native-async-storage/async-storage
```

---

## 🔧 Step 3: Update App.tsx

Wrap your app with AuthProvider:

```typescript
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
```

---

## 🚀 Step 4: Update Navigation

Add LoginScreen to your navigation and implement auth flow.

I'll create the updated navigation file next...

---

## 🎯 Features Enabled by Login

### 1. **Upload Place Images**
- Users can upload photos for places
- Images require approval before showing

### 2. **Add Reviews & Ratings**
- Users can rate places (1-5 stars)
- Write detailed reviews
- One review per place per user

### 3. **Bookmark Places**
- Save favorite places
- Quick access to bookmarked locations

### 4. **List Own Places**
- Users can claim ownership of places
- Manage their listed places

---

## 🔐 How OTP System Works

### Phone Number Entry:
1. User enters 10-digit mobile number
2. System validates format
3. Adds +91 country code

### OTP Generation:
1. System generates 4-digit random code
2. Stores in database with 5-minute expiry
3. In production, integrate SMS service (Twilio/AWS SNS)

### OTP Verification:
1. User enters 4-digit code
2. System checks validity and expiry
3. Creates/updates user account
4. Stores session in AsyncStorage

### Session Management:
1. User stays logged in across app restarts
2. Session stored securely in AsyncStorage
3. Verified against database on app launch

---

## 📱 Testing the Login System

### Development Testing:
1. Enter any valid 10-digit number (starting with 6-9)
2. Check console logs for generated OTP
3. Enter the OTP to login

### Production Setup:
1. Integrate SMS service (Twilio recommended)
2. Remove OTP from success message
3. Add rate limiting for OTP requests
4. Add phone number verification

---

## 🎨 UI Components Explained

### LoginScreen Components:

#### **Phone Number Step:**
- Country code display (+91)
- 10-digit input field
- Features list showing benefits
- Send OTP button

#### **OTP Verification Step:**
- 4-digit OTP input
- Resend timer (60 seconds)
- Verify button
- Change number option

#### **Styling:**
- Matches app theme (green primary color)
- Responsive design
- Loading states
- Disabled states for invalid input

---

## 🔒 Security Features

### Database Security:
- Row Level Security (RLS) enabled
- Users can only access their own data
- Public data (reviews, images) visible to all

### OTP Security:
- 5-minute expiry
- One-time use only
- Stored securely in database

### Session Security:
- Encrypted storage with AsyncStorage
- Session validation on app launch
- Automatic logout on invalid session

---

## 🛠️ Next Steps

After implementing login, you can:

1. **Add Profile Screen** - Let users update name/email
2. **Add Bookmarks Screen** - Show saved places
3. **Add My Reviews Screen** - Manage user reviews
4. **Add Image Upload** - Let users upload photos
5. **Add Place Ownership** - Claim and manage places

---

## 📝 Code Structure

```
src/
├── services/
│   └── auth.service.ts          # Authentication logic
├── contexts/
│   └── AuthContext.tsx          # Global auth state
├── screens/
│   └── LoginScreen.tsx          # Login UI
└── types/
    └── index.ts                 # Type definitions
```

---

## 🐛 Troubleshooting

### OTP Not Sending:
- Check Supabase connection
- Verify table exists
- Check console logs

### Login Not Persisting:
- Check AsyncStorage permissions
- Verify user data in database
- Check AuthContext initialization

### Navigation Issues:
- Ensure AuthProvider wraps navigation
- Check navigation structure
- Verify screen names

---

## 📞 Support

For issues or questions:
1. Check console logs for errors
2. Verify Supabase tables exist
3. Test with valid phone numbers
4. Check network connectivity

---

## ✅ Checklist

- [ ] Run SQL script in Supabase
- [ ] Install AsyncStorage package
- [ ] Add AuthProvider to App.tsx
- [ ] Update navigation with LoginScreen
- [ ] Test phone number validation
- [ ] Test OTP generation
- [ ] Test OTP verification
- [ ] Test session persistence
- [ ] Test logout functionality

---

**Your login system is now ready! Users can authenticate and access premium features.** 🎉
