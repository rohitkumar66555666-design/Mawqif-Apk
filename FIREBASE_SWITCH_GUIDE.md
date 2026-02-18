# 🔄 Firebase OTP Switch Guide

Complete guide to switch from **Dev Mode** to **Real Firebase SMS OTP** in your Mawqif app.

## 🎯 Current Status: DEV MODE

Your app is currently in **Dev Mode** where:
- ✅ Any Indian phone number works
- ✅ Random OTP is generated and shown in alert
- ✅ Any 6-digit code works for verification
- ✅ No real SMS is sent

## 🔥 Switch to Firebase (Real SMS)

Follow these steps to enable **real SMS OTP** using Firebase:

---

## 📋 **STEP 1: Create Firebase Project**

### 1.1 Go to Firebase Console
```
🌐 https://console.firebase.google.com
```

### 1.2 Create New Project
1. Click **"Create a project"**
2. Project name: `mawqif-prayer-finder`
3. Enable Google Analytics: **Yes** (recommended)
4. Choose Analytics account: **Default**
5. Click **"Create project"**

### 1.3 Add Web App
1. Click **"Add app"** → **Web** (</> icon)
2. App nickname: `Mawqif Prayer Finder`
3. **Don't** check "Set up Firebase Hosting"
4. Click **"Register app"**

### 1.4 Copy Configuration
You'll see a config object like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDGRA-JE9JwTMyTwRIXyPHI46MmZWAjcU8",
  authDomain: "mawqif-prayer-finder.firebaseapp.com",
  projectId: "mawqif-prayer-finder", 
  storageBucket: "mawqif-prayer-finder.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-ABCDEFGHIJ"
};
```
**📋 Copy this entire object!**

---

## 📋 **STEP 2: Enable Phone Authentication**

### 2.1 Go to Authentication
1. In Firebase Console → **Authentication**
2. Click **"Get started"**

### 2.2 Enable Phone Sign-in
1. **Sign-in method** tab
2. Click **"Phone"**
3. Toggle **"Enable"**
4. Click **"Save"**

### 2.3 Add Test Numbers (Optional)
For testing without real SMS:
1. Scroll down to **"Phone numbers for testing"**
2. Click **"Add phone number"**
3. Phone: `+91 9876543210`
4. Code: `123456`
5. Click **"Add"**

---

## 📋 **STEP 3: Configure Your App**

### 3.1 Open Firebase Config File
```
📁 PRAYER APP/Mawqif-App/src/lib/firebaseConfig.ts
```

### 3.2 Paste Your Configuration
Replace the placeholder values:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSyDGRA-JE9JwTMyTwRIXyPHI46MmZWAjcU8", // 👈 Your API key
  authDomain: "mawqif-prayer-finder.firebaseapp.com", // 👈 Your auth domain
  projectId: "mawqif-prayer-finder", // 👈 Your project ID
  storageBucket: "mawqif-prayer-finder.appspot.com", // 👈 Your storage bucket
  messagingSenderId: "123456789012", // 👈 Your sender ID
  appId: "1:123456789012:web:abcdef123456789", // 👈 Your app ID
  measurementId: "G-ABCDEFGHIJ" // 👈 Your measurement ID
};
```

### 3.3 Enable Firebase Mode
Change this line:
```typescript
export const USE_FIREBASE = true; // 👈 CHANGE FROM false TO true
```

---

## 📋 **STEP 4: Install Firebase**

### 4.1 Install Firebase Package
```bash
cd "PRAYER APP/Mawqif-App"
npm install firebase
```

### 4.2 Restart Expo Server
```bash
npx expo start --tunnel --scheme mawqif
```

---

## 📋 **STEP 5: Test Real SMS**

### 5.1 Test with Real Number
1. Open app in Expo Go
2. Go to Login screen
3. Enter **your real phone number**
4. Tap "Send OTP"
5. **Check your phone for SMS** 📱
6. Enter the received OTP

### 5.2 Test with Test Number (if configured)
1. Enter `+91 9876543210`
2. Tap "Send OTP" 
3. Enter `123456`
4. Should work without real SMS

---

## 🔄 **Quick Switch Commands**

### Switch to Firebase (Real SMS):
```typescript
// In src/lib/firebaseConfig.ts
export const USE_FIREBASE = true;
```

### Switch back to Dev Mode:
```typescript
// In src/lib/firebaseConfig.ts  
export const USE_FIREBASE = false;
```

---

## 🎯 **Visual Indicators**

### Dev Mode Active:
- 🧪 **"DEV MODE"** badge in top-right corner
- 🔐 **Alert shows generated OTP**
- 📱 **No real SMS sent**

### Firebase Mode Active:
- 🔥 **No "DEV MODE" badge**
- 📱 **Real SMS sent to phone**
- 🔐 **No OTP alert shown**

---

## 🐛 **Troubleshooting**

### Problem: "Firebase not configured" error
**Solution:**
```typescript
// Make sure you pasted real config values
export const USE_FIREBASE = true;
export const firebaseConfig = {
  apiKey: "your-real-api-key", // Not "PASTE_YOUR_API_KEY_HERE"
  // ... other real values
};
```

### Problem: "Invalid phone number" 
**Solution:**
- Use international format: `+91 9876543210`
- Enable phone auth in Firebase Console
- Check Firebase quotas/billing

### Problem: "reCAPTCHA error"
**Solution:**
- Add your domain to Firebase authorized domains
- Check browser console for errors
- Try in different browser

### Problem: SMS not received
**Solution:**
- Check phone number format
- Verify Firebase billing is enabled
- Check SMS quotas in Firebase Console
- Try with test phone number first

---

## 📊 **Comparison Table**

| Feature | Dev Mode | Firebase Mode |
|---------|----------|---------------|
| **Real SMS** | ❌ No | ✅ Yes |
| **Any Phone** | ✅ Yes | ❌ Valid only |
| **Any OTP** | ✅ Yes | ❌ Real code only |
| **Cost** | 🆓 Free | 💰 Pay per SMS |
| **Testing** | ⚡ Instant | 📱 Need real phone |
| **Production** | ❌ Not suitable | ✅ Production ready |

---

## 🚀 **Recommended Workflow**

### Phase 1: Development
```typescript
export const USE_FIREBASE = false; // Dev mode for testing
```
- ✅ Test UI/UX flows
- ✅ Test error handling  
- ✅ Test navigation
- ✅ No SMS costs

### Phase 2: Staging
```typescript
export const USE_FIREBASE = true; // Firebase with test numbers
```
- ✅ Test real Firebase integration
- ✅ Use test phone numbers
- ✅ Verify SMS delivery

### Phase 3: Production
```typescript
export const USE_FIREBASE = true; // Firebase with real numbers
```
- ✅ Real SMS to real users
- ✅ Monitor Firebase quotas
- ✅ Set up billing alerts

---

## 💡 **Pro Tips**

### 1. Keep Dev Mode for Testing
Always test new features in dev mode first before switching to Firebase.

### 2. Use Test Numbers
Set up test phone numbers in Firebase for staging environment.

### 3. Monitor Costs
Firebase SMS has costs - monitor usage in Firebase Console.

### 4. Backup Plan
Keep dev mode as fallback if Firebase has issues.

### 5. Environment Variables
Consider using environment variables for different builds:
```typescript
export const USE_FIREBASE = process.env.NODE_ENV === 'production';
```

---

## 🎉 **You're Ready!**

Your app now supports both **Dev Mode** and **Real Firebase SMS**. Switch between them anytime by changing the `USE_FIREBASE` flag!

**Happy coding! 🚀**