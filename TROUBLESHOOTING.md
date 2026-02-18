# Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "Cannot find module 'react-native-google-places-autocomplete'"

**Cause:** Package not installed or not in node_modules
**Solution:**

```bash
npm install
# or
yarn install
```

**If that doesn't work:**

```bash
npm uninstall react-native-google-places-autocomplete
npm install react-native-google-places-autocomplete@2.6.1
```

---

### Issue 2: Autocomplete Dropdown Not Appearing

**Possible Causes & Solutions:**

1. **Missing API Key**

   - Check [src/screens/AddPlaceScreen.tsx](src/screens/AddPlaceScreen.tsx) line ~265
   - Replace placeholder: `AIzaSyDx5Tx9lw4_TBpZwb4h1ILkB6VvfV6jM6c`
   - With your actual API key from Google Cloud Console

2. **API Key Invalid or Expired**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Check if API key is active
   - Verify Places API is enabled

3. **API Key Restrictions Too Strict**

   - In Google Cloud Console, go to Credentials
   - Click your API key
   - Check "Application restrictions"
   - Should be set to "None" for testing
   - Or set to correct platform (Android/iOS)

4. **Keyboard not showing suggestions**
   - Make sure you're typing (not just clicking)
   - Try typing at least 2-3 characters
   - Check browser console for errors (Dev Tools)

---

### Issue 3: City Not Auto-filling

**Possible Causes & Solutions:**

1. **Place format doesn't have city component**

   - Google might return different format
   - **Manual fallback:** User can type city manually
   - This is OK for edge cases

2. **Address components not parsed correctly**

   - Check browser console for the address details
   - Look for "address_components" in the object
   - Some regions don't have "locality" field
   - The code falls back to "administrative_area_level_1"

3. **Selected place has no detailed information**
   - Google returned only basic info
   - Check that you're selecting from dropdown (not just typing)
   - Dropdowns have full details; typing doesn't

---

### Issue 4: Clear (X) Button Not Appearing

**Possible Causes:**

1. **Haven't selected a place yet**

   - X button only appears AFTER selecting from dropdown
   - Just typing in the field won't trigger it
   - **Fix:** Click a suggestion from the dropdown

2. **State not updating correctly**

   - Try refreshing the app
   - Clear app cache:

     ```bash
     # For Android emulator
     adb shell pm clear [package.name]

     # For iOS simulator
     xcrun simctl erase all
     ```

3. **Styling issue**
   - X button might be there but not visible
   - Check if `selectedPlace` state is set (debug log)
   - Open browser DevTools → Inspector → check styles

---

### Issue 5: "Places API not enabled" Error

**Solution:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Search for "Places API"
4. Click "ENABLE"
5. Wait 2-3 minutes for it to activate
6. Try again

---

### Issue 6: Form Submission Fails

**Possible Causes:**

1. **Title or City field is empty**

   - Make sure you selected a place (not just typed)
   - Selected place auto-fills both fields
   - If manual entry, ensure both fields are filled
   - Error message should tell you which field

2. **Location not available**

   - App needs GPS/Location permission
   - On mobile: Check location permission in device settings
   - For browser testing: Uses default Mumbai coordinates (OK)

3. **Photo is too large**
   - Selected photo file size > 5MB
   - **Fix:** Pick a smaller image or optimize it
   - App should handle this, but some devices might reject

---

### Issue 7: API Rate Limiting (Error 429)

**Cause:** Made too many requests to Google API in short time
**Solution:**

1. Wait 1-5 minutes before trying again
2. Set daily/monthly quotas in Google Cloud Console:
   - Go to APIs & Services → Quotas
   - Find "Places API"
   - Set daily limit to prevent overages

---

### Issue 8: "Invalid API Key" Error

**Possible Causes:**

1. **API Key is wrong**

   - Copy-paste again from Google Cloud Console
   - Check for extra spaces
   - Verify it's the actual API key (not other credentials)

2. **API Key used for wrong service**

   - Make sure it's for "Places API"
   - Not Directions API or other API
   - Should be a generic API Key

3. **API Key disabled**
   - In Google Cloud Console → Credentials
   - Check if your API key shows "Active"
   - Re-create if needed

---

### Issue 9: Android App Not Working with Autocomplete

**Possible Causes:**

1. **Missing Google Play Services**

   - Many React Native maps libraries depend on this
   - Usually comes with Expo, but verify

2. **Android manifest needs updating**
   - Usually handled by Expo automatically
   - If issues persist, check [app.json](app.json)
   - Should have location permissions

---

### Issue 10: iOS App Not Working

**Possible Causes:**

1. **Info.plist needs permissions**

   - Already configured in [app.json](app.json)
   - Might need manual configuration for custom builds

2. **CocoaPods dependencies**
   - Run `cd ios && pod install && cd ..`
   - Then rebuild: `expo prebuild --clean`

---

## Debug Steps

### To Debug the Autocomplete:

1. Open browser DevTools (if web testing)
2. Check Console tab for errors
3. Look for logs like:

   ```
   ✅ Place selected: Shop 2, Crystal, Kanungo, Mira Road East
   🏙️ City auto-filled: Mira Road East
   ```

4. If not appearing, check for API errors:
   ```
   Error handling place selection: [error details]
   ```

### To Test Without Real API Key:

1. Create a simple TextInput temporarily
2. Verify form submission works
3. Then add Google Places API
4. This helps isolate the issue

### To Check API Key Status:

```javascript
// Add this to your code temporarily
const testApiKey = "YOUR_API_KEY_HERE";
fetch(
  `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Mumbai&key=${testApiKey}`
)
  .then((r) => r.json())
  .then((data) => console.log("API Response:", data))
  .catch((e) => console.error("API Error:", e));
```

---

## Performance Tips

### If App is Slow:

1. Limit autocomplete results
   - Add `restrictedTypes: ['locality']` to query
2. Add debouncing to search

   - Wait for user to stop typing before API call
   - Can reduce API calls by 50-70%

3. Cache results locally
   - Store recent searches
   - Reduce repeated API calls

### To Reduce API Costs:

1. Set location bias (only search nearby areas)
2. Restrict to specific country: `componentRestrictions: { country: 'in' }`
3. Use session tokens for grouped searches
4. Set query `types: ['address']` to filter results

---

## Getting Help

**If issue persists:**

1. Check [GOOGLE_PLACES_SETUP.md](GOOGLE_PLACES_SETUP.md) for setup details
2. Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for feature overview
3. Visit [Google Places Documentation](https://developers.google.com/maps/documentation/places)
4. Check [react-native-google-places-autocomplete GitHub](https://github.com/FaridSafi/react-native-google-places-autocomplete)
5. Post in Google Cloud Support if API issue

---

## Quick Checklist Before Asking for Help

- [ ] API key is valid and not expired?
- [ ] Places API is enabled in Google Cloud Console?
- [ ] API key is replaced in the code?
- [ ] Dependencies installed (`npm install`)?
- [ ] App rebuilt/restarted after changes?
- [ ] Using correct API key (not test/development key)?
- [ ] Google Places returns data (test with curl)?
- [ ] No typos in code edits?
- [ ] Cleared app cache/restarted device?

---

## Still Having Issues?

Create a detailed bug report with:

1. **Error message** (exact text from console)
2. **Steps to reproduce** (what you did)
3. **Device/Platform** (Android, iOS, Web)
4. **API key status** (valid, enabled, etc.)
5. **Code location** (line number where error occurs)
6. **Screenshots** (if applicable)

This helps debug faster! 🚀
