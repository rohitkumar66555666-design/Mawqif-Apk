# Image Loading Troubleshooting Guide

## Problem: Images not showing on specific device

### Common Causes & Solutions

#### 1. **Device-Specific Issues**

**Check Device Date/Time:**
- Incorrect date/time can cause SSL certificate validation failures
- Go to Settings → Date & Time → Set automatically

**Clear App Cache:**
```bash
# For Android
adb shell pm clear com.mawqif.prayerfinder

# For iOS - Delete and reinstall app
```

**Check Device Storage:**
- Low storage can prevent image caching
- Free up at least 500MB of space

---

#### 2. **Network/Connection Issues**

**Test Internet Connection:**
- Open browser and visit https://supabase.co
- If it doesn't load, check WiFi/mobile data

**Check HTTPS Access:**
- Some devices/networks block HTTPS content
- Try switching between WiFi and mobile data
- Disable VPN if active

**Corporate/School Networks:**
- May block external image loading
- Try on personal mobile data

---

#### 3. **Supabase Storage Configuration**

**Verify Bucket is Public:**
1. Go to Supabase Dashboard
2. Navigate to Storage → place-images
3. Click on bucket settings
4. Ensure "Public bucket" is enabled
5. Check bucket policies allow public read access

**Test Image URL Directly:**
- Copy an image URL from console logs
- Paste in device browser
- If it doesn't load, it's a Supabase issue

---

#### 4. **App-Specific Debugging**

**Use Debug Button:**
1. Open HomeScreen
2. Tap the red "Debug" button
3. Check console logs for:
   - ❌ Image failed to load
   - 🔗 URL validation issues
   - 📊 Accessibility test results

**Check Console Logs:**
```
🖼️ PlaceCard Image URL for [Place Name]: [URL]
✅ Image loaded successfully for: [Place Name]
❌ Image failed to load for [Place Name]: [Error]
```

---

#### 5. **Device-Specific Fixes**

**Android:**
- Enable "Allow all network access" in app settings
- Check if "Data Saver" mode is blocking images
- Clear app data: Settings → Apps → Mawqif → Storage → Clear Data

**iOS:**
- Check Settings → Mawqif → Cellular Data (enable)
- Settings → Privacy → Photos (allow access)
- Try airplane mode on/off to reset network

**Expo Go:**
- Update to latest Expo Go version
- Clear Expo cache: Shake device → Clear cache
- Restart Expo development server

---

#### 6. **Code-Level Fixes Applied**

✅ **Enhanced PlaceCard Component:**
- Added loading indicators
- Added error handling with fallback
- Added detailed console logging
- Added image validation

✅ **Image Debugging Utility:**
- URL validation
- Accessibility testing
- Device recommendations
- Batch testing for all images

✅ **HomeScreen Debug Tools:**
- Debug button to test all images
- Detailed logging for troubleshooting
- Manual refresh with cache clearing

---

### Testing Steps

1. **Open the app and navigate to HomeScreen**

2. **Tap the red "Debug" button**
   - This will test the first 5 place images
   - Check console for detailed results

3. **Look for these log patterns:**
   ```
   🖼️ ========== IMAGE DEBUG INFO ==========
   📍 Place: [Name]
   🔗 URL: [Full URL]
   ✅ Valid: true/false
   ❌ Issues: [List of issues if any]
   ```

4. **Check image loading in PlaceCard:**
   ```
   🖼️ PlaceCard Image URL for [Name]: [URL]
   ✅ Image loaded successfully for: [Name]
   OR
   ❌ Image failed to load for [Name]: [Error details]
   ```

5. **If images still don't load:**
   - Copy the image URL from logs
   - Open in device browser
   - If browser can't load it → Supabase issue
   - If browser loads it → App/device issue

---

### Quick Fixes Checklist

- [ ] Device date/time is correct
- [ ] Internet connection is working
- [ ] Supabase bucket is public
- [ ] App has network permissions
- [ ] Device has sufficient storage
- [ ] No VPN or proxy blocking requests
- [ ] App cache is cleared
- [ ] Latest app version installed

---

### Advanced Debugging

**Test Image URL Manually:**
```javascript
// In console or debug screen
ImageDebugger.testImageUrl('YOUR_IMAGE_URL_HERE')
```

**Test All Place Images:**
```javascript
// This runs automatically when you tap Debug button
ImageDebugger.testAllPlaceImages(places)
```

**Get Device Recommendations:**
```javascript
ImageDebugger.getDeviceRecommendations()
```

---

### Still Not Working?

1. **Check Supabase Dashboard:**
   - Storage → place-images → Files
   - Verify images exist
   - Click on an image → Copy URL
   - Test URL in browser

2. **Verify Image Upload:**
   - Try uploading a new place with image
   - Check if new image shows up
   - If yes → Old images have URL issues
   - If no → Upload service issue

3. **Device-Specific Testing:**
   - Test on another device
   - If works on other device → Device-specific issue
   - If doesn't work anywhere → Backend issue

4. **Network Debugging:**
   - Use network inspector (React Native Debugger)
   - Check if image requests are being made
   - Check response status codes
   - Look for CORS or SSL errors

---

### Contact Support

If none of these solutions work, provide:
- Device model and OS version
- Console logs from Debug button
- Screenshot of the issue
- Image URL that's failing
- Network type (WiFi/Mobile data)
