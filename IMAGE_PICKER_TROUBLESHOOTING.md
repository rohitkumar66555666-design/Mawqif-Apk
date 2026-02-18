# 📷 Image Picker Troubleshooting Guide

## Issue: "Unable to pick image" Error

This error can happen for several reasons. Here's how to fix it:

## ✅ Fixes Applied

### 1. Enhanced Error Handling
- Better permission request handling
- More specific error messages
- Graceful fallbacks for different error types

### 2. Simplified Image Picker Options
- Removed problematic options
- Reduced file size limit to 5MB
- Better compatibility settings

### 3. Improved Validation
- Better checks for image data
- Validation of URI and base64 data
- File size validation

## 🔧 If Still Getting Errors

### Check Device Permissions
1. **Android:** Go to Settings → Apps → Mawqif → Permissions → Photos/Media
2. **iOS:** Go to Settings → Privacy → Photos → Mawqif
3. Make sure permissions are **ALLOWED**

### Try These Steps
1. **Restart the app** completely
2. **Clear app cache** (Android: Settings → Apps → Mawqif → Storage → Clear Cache)
3. **Try a different image** (smaller size, different format)
4. **Check device storage** - make sure you have enough space

### Development Environment
If testing in development:
1. **Restart Expo server**: `npx expo start --clear`
2. **Reload app** on device/emulator
3. **Check console logs** for specific error details

## 🚀 Testing Steps

### 1. Test Image Selection
1. Open app → "Add Prayer Space"
2. Tap "Add Photo" button
3. Should open photo gallery
4. Select any image
5. Should show preview in form

### 2. Check Console Logs
Look for these messages:
- ✅ `📷 Starting image picker...`
- ✅ `📷 Permission status: granted`
- ✅ `📷 Image picker completed`
- ✅ `✅ Image successfully selected and stored`

### 3. Error Messages to Watch For
- ❌ `Permission status: denied` → Check device permissions
- ❌ `No assets returned` → Try different image
- ❌ `No base64 data returned` → Image processing issue

## 📱 Platform-Specific Issues

### Android
- **File access issues:** Fixed with base64 approach
- **Permission timing:** App requests permission when needed
- **Storage access:** Uses media library permissions

### iOS
- **Photo library access:** Handled by expo-image-picker plugin
- **Privacy settings:** User must allow in iOS settings

### Web (Development)
- **Limited functionality:** Some features may not work in web browser
- **File access:** Different from mobile platforms

## 🔍 Debug Information

The enhanced image picker now logs detailed information:
```
📷 Starting image picker...
📷 Permission status: granted
📷 Opening image picker...
📷 Image picker completed, result: { canceled: false, hasAssets: true }
📱 Image selected: { uri: 'Present', width: 1080, height: 1920, fileSize: 234567, hasBase64: true }
✅ Image successfully selected and stored
✅ Base64 data length: 312456
```

## ✅ Expected Behavior After Fix

1. **Tap "Add Photo"** → Permission request (if first time)
2. **Allow permission** → Photo gallery opens
3. **Select image** → Image preview appears in form
4. **Submit form** → Image uploads to Supabase successfully
5. **View place** → Image displays in place card

## 🆘 Still Having Issues?

If the image picker still doesn't work:

1. **Check Expo version compatibility**
2. **Verify expo-image-picker installation**: `npm list expo-image-picker`
3. **Try on different device/emulator**
4. **Check network connection** for permissions
5. **Restart development server**

The enhanced implementation should resolve most "unable to pick image" errors! 📷✨