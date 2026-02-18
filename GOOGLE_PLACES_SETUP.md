# Google Places Autocomplete Setup Guide

## Overview

Your Prayer Finder app now includes Google Places Autocomplete feature that allows users to:

- Search for places to add prayer spaces
- Auto-fill the city field based on the selected location
- Clear incorrect selections with an X button

## Setup Steps

### 1. Get Your Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (if you don't have one)
3. Enable these APIs:

   - **Places API**
   - **Maps SDK for Android** (for mobile)
   - **Maps SDK for iOS** (for iOS)
   - **Places API** (Web)

4. Create an API key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the key to these APIs:
     - Maps SDK for Android
     - Maps SDK for iOS
     - Places API

### 2. Add API Key to Your App

**Option A: Replace in AddPlaceScreen.tsx (Quick)**
Open [src/screens/AddPlaceScreen.tsx](src/screens/AddPlaceScreen.tsx) and find this line:

```tsx
key: 'AIzaSyDx5Tx9lw4_TBpZwb4h1ILkB6VvfV6jM6c', // Replace with your API key
```

Replace `AIzaSyDx5Tx9lw4_TBpZwb4h1ILkB6VvfV6jM6c` with your actual API key.

**Option B: Use Environment Variables (Recommended for Security)**

1. Add to your `.env` file:

```
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

2. Update [app.config.js](app.config.js):

```javascript
import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
  },
});
```

3. Update [src/screens/AddPlaceScreen.tsx](src/screens/AddPlaceScreen.tsx):

```tsx
import { useAppConfig } from '../config'; // Create this if needed

// In GooglePlacesAutocomplete query:
query={{
    key: useAppConfig().googlePlacesApiKey,
    language: 'en',
}}
```

### 3. For Android

Add to [app.json](app.json) - already configured in your manifest:

```json
"android": {
  "permissions": ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]
}
```

### 4. For iOS

Add to [app.json](app.json):

```json
"ios": {
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "This app needs access to your location to find nearby prayer spaces"
  }
}
```

## Features Implemented

### ✅ Autocomplete Search

- Users type a location in the "Place Name" field
- Google Places autocomplete dropdown appears with suggestions
- Shows full address with street, area, city, and country

### ✅ Auto-fill City Field

- When user selects a place from autocomplete
- City field is automatically populated
- Extracts city from Google Places address components
- Example: "Shop 2, Crystal, Kanungo, Mira Road East" → City becomes "Mira Road East"

### ✅ Clear Selection Button

- Red X button appears on the right side of the Place Name field (only when a place is selected)
- Click to clear both Place Name and City fields
- Clears the autocomplete input

## Supabase Changes

**NO CHANGES NEEDED** to your Supabase database structure:

- The `title` field now contains the full address from Google Places
- The `city` field is auto-filled with the extracted city name
- All existing database operations remain the same
- Your current schema works perfectly with this feature

## Code Structure

### Modified Files:

1. **AddPlaceScreen.tsx** - Added autocomplete component and handlers
   - New state: `selectedPlace`, `googlePlacesRef`
   - New handlers: `handlePlaceSelect()`, `clearPlaceSelection()`
   - New styles: Google Places component styling

### New Dependencies Used:

- `react-native-google-places-autocomplete` (already in package.json)

## Testing

1. **Test Autocomplete:**

   - Start typing "Shop" or "Mosque" in Place Name field
   - Verify dropdown appears with suggestions
   - Click a suggestion

2. **Test Auto-fill:**

   - Select "Shop 2, Crystal, Kanungo, Mira Road East"
   - Verify City field automatically shows "Mira Road East"

3. **Test Clear Button:**

   - After selecting a place, X button should appear
   - Click X button
   - Both fields should clear

4. **Test Validation:**
   - Submit without selecting a place (should show error)
   - Select a place and submit (should work)

## Troubleshooting

**Issue: Autocomplete not working**

- Check if API key is valid and enabled
- Ensure Places API is enabled in Google Cloud Console
- Check browser console for error messages

**Issue: City not auto-filling**

- May not have extracted due to address format
- Manually type city (fallback option)
- Verify address has "locality" component

**Issue: X button not appearing**

- Make sure to select a place first
- Clear browser cache if needed

**Issue: Rate limiting errors**

- You've exceeded your Google Places API quota
- Upgrade billing plan in Google Cloud Console
- Set usage limits to prevent unexpected charges

## API Costs

Google Places API is **not free** after a certain quota:

- Free quota: ~$200/month credit
- After that: ~$7 per 1000 requests (varies by API)
- Set API quotas in Google Cloud Console to avoid surprise charges

## Security Notes

⚠️ **Important:**

- Never commit your API key to GitHub
- Use `.env` file (add to `.gitignore`)
- Restrict API key to specific APIs
- Set HTTP referrers for web (if using web version)
- Monitor usage in Google Cloud Console

## Next Steps

1. Get Google Places API key from Google Cloud Console
2. Add API key to your app (Option A or B above)
3. Test the autocomplete feature
4. Deploy and monitor API usage

## Support

For issues with Google Places API, visit:

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places)
- [react-native-google-places-autocomplete](https://github.com/FaridSafi/react-native-google-places-autocomplete)
