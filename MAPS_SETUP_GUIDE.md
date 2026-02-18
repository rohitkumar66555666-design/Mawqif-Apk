# Google Maps Setup Guide for Mawqif App

This guide will help you set up Google Maps API for the new Map feature in your Mawqif Prayer Finder app.

## What You Have Now

✅ MapScreen.tsx component created  
✅ react-native-maps package installed  
✅ Custom 3-tab navigation with TikTok-style center button  
✅ Map shows user location and nearby prayer places

## Google Maps API Setup Steps

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** button
3. Enter project name: `Mawqif Prayer Finder`
4. Click **"Create"**
5. Wait for the project to be created (you'll see a notification)

### Step 2: Enable Google Maps APIs

1. Once in your project, click **"APIs & Services"** in the left sidebar
2. Click **"Enable APIs and Services"** (top)
3. Search for and enable these APIs:
   - **Maps SDK for Android** (if building for Android)
   - **Maps SDK for iOS** (if building for iOS)
   - **Google Places API** (already enabled for autocomplete)

### Step 3: Create an API Key

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"API Key"**
3. A new API key will be generated
4. **Copy this key** - you'll need it next

### Step 4: Add API Key to Your App

#### For Android:

1. Open `android/app/build.gradle`
2. Find the `android` block
3. Add your API key to the manifest:

```gradle
android {
    ...
    defaultConfig {
        ...
        manifestPlaceholders = [MAPS_API_KEY: "YOUR_API_KEY_HERE"]
    }
}
```

#### For iOS:

1. Open `ios/Mawqif/GoogleService-Info.plist` (create if doesn't exist)
2. Add Google API configuration
3. Or update `Info.plist` with:

```xml
<key>GMSAPIKey</key>
<string>YOUR_API_KEY_HERE</string>
```

### Step 5: Verify Map Permissions

Your app already has location permission handling in MapScreen.tsx. Verify these files exist:

#### Android Permissions (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### iOS Permissions (ios/Mawqif/Info.plist)

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby prayer spaces</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need your location to show nearby prayer spaces</string>
```

### Step 6: Test the Map

1. Run your app: `expo start`
2. Go to the **"Map"** tab (middle bottom navigation)
3. You should see:

   - Your current location (blue dot)
   - All nearby prayer spaces as markers
   - 4 different marker colors based on type:
     - 🟢 Green: Masjid
     - 🔵 Blue: Musalla
     - 🟠 Orange: Home
     - 🟣 Purple: Office
     - 🔴 Red: Shop

4. Tap any marker to view place details

## Troubleshooting

### Map shows blank/white screen

- Check that Google Maps API is enabled in Google Cloud
- Verify API key is correctly added to app configuration
- Check Android/iOS permissions are granted

### Markers not showing

- Verify PlacesService.getNearbyPlaces() is returning data
- Check that place coordinates are valid (latitude, longitude)
- Enable location permission in app settings

### "Maps API not available" error

- Make sure your API key has Maps SDK for Android/iOS enabled
- Check that API restrictions are set to "None" or include your app

### Slow map performance

- MapScreen uses marker clustering (ready to implement)
- Consider limiting markers to 50km radius (current setting)
- Increase cluster distance if needed

## Free Alternative APIs (if needed)

If you prefer not to use Google Maps:

### 1. **Mapbox GL** (Recommended)

```bash
npm install @react-native-mapbox-gl/maps
```

- Free tier: 50,000 map views/month
- Offline maps support
- Better performance on poor connections

### 2. **OpenStreetMap + Leaflet**

```bash
npm install react-native-leaflet
```

- 100% free and open source
- No API key needed
- Less native feel but completely free

### 3. **Apple Maps** (iOS only)

- Built-in, no additional setup
- Free with iOS

## Next Steps

1. ✅ Complete Steps 1-5 above
2. ✅ Run `expo start` to test the Map tab
3. ✅ Grant location permission when prompted
4. ✅ See your location and nearby prayer spaces
5. ✅ Tap markers to view place details
6. ⏳ (Optional) Implement marker clustering for 100+ places
7. ⏳ (Optional) Add radius filter to MapScreen

## Features Already Implemented

✅ **User Location**: Shows blue dot on map  
✅ **Prayer Space Markers**: Shows all nearby places with colored pins  
✅ **Marker Info**: Title and place type on tap  
✅ **Place Navigation**: Tap marker → opens Place Detail screen  
✅ **Color Coding**: Different colors for different place types  
✅ **Info Panel**: Shows count of prayer spaces in area  
✅ **Location Permissions**: Requests permission automatically

## New 3-Tab Navigation Structure

✅ **Home Tab** 🏠 - Search and filter prayer spaces (left)  
✅ **Map Tab** 🗺️ - View prayer spaces on map (center-left)  
✅ **Add Button** ➕ - Add new prayer space (TikTok-style center button)

The Add Place button now:

- Floats above the tab bar
- Has large green circle with + icon
- Gives the app a modern, TikTok-like feel
- Opens AddPlaceScreen when tapped

## Important Notes

- **API Key Security**: For production, use signed builds and restrict API key to your app
- **Cost**: Google Maps has free tier (first $200/month credit), then $0.005-0.007 per map load
- **Alternative**: Use Mapbox instead to stay within free tier (50,000 views/month)

---

**Questions?** Check the main README.md for additional help!
