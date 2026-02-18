# Quick Start: Google Places API Key Setup (5 Minutes)

## Step 1: Create/Login to Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Sign in with your Google account
3. Create a new project (or select existing one)
   - Click project dropdown → "NEW PROJECT"
   - Name it "Mawqif Prayer Finder" (or any name)
   - Click "CREATE"

## Step 2: Enable APIs

1. In search bar, type "Places API" → Click it
2. Click "ENABLE"
3. Repeat for these APIs:
   - Search "Maps SDK for Android" → ENABLE
   - Search "Maps SDK for iOS" → ENABLE

## Step 3: Create API Key

1. Go to "Credentials" (left sidebar)
2. Click "CREATE CREDENTIALS" → "API Key"
3. Copy the generated key
4. (Optional but recommended) Restrict it:
   - Click the key you just created
   - Application restrictions: Select "Android app" or "iOS app"
   - Save

## Step 4: Add to Your App

### Option A: Quick (Testing)

Edit this file: `src/screens/AddPlaceScreen.tsx`

Find this line (around line 265):

```tsx
key: 'AIzaSyDx5Tx9lw4_TBpZwb4h1ILkB6VvfV6jM6c', // Replace with your API key
```

Replace with your actual key:

```tsx
key: 'YOUR_ACTUAL_API_KEY_HERE',
```

### Option B: Secure (Production)

1. Add to `.env` file:
   ```
   GOOGLE_PLACES_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```
2. Update `app.config.js` to pass it through
3. Use it in your component

## Step 5: Test

1. Run your app: `npm start` or `expo start`
2. Go to "Add Prayer Space" screen
3. Type "Shop" or "Mosque" in Place Name
4. Dropdown should appear with suggestions ✅

## Done! 🎉

Your autocomplete feature should now work perfectly!

## Pricing Info

- **Free:** ~$200/month credit
- **After that:** ~$7 per 1000 requests
- Always set usage limits in Google Cloud Console

## Support

- Issues? See `GOOGLE_PLACES_SETUP.md` for detailed guide
- Or check [Google Documentation](https://developers.google.com/maps/documentation/places)
