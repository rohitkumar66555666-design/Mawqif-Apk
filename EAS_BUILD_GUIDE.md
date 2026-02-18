# Build Release APK with EAS (Recommended)

EAS Build is Expo's cloud build service that handles all the complexity of building production APKs.

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login to Expo

```bash
cd Mawqif-app
eas login
```

Create a free account at https://expo.dev if you don't have one.

## Step 3: Configure EAS Build

```bash
eas build:configure
```

This creates an `eas.json` file with build profiles.

## Step 4: Build Production APK

```bash
eas build --platform android --profile production
```

This will:
- Build your app in the cloud
- Handle all signing automatically
- Generate a production-ready APK
- Provide a download link when complete

## Step 5: Download Your APK

After the build completes (usually 10-15 minutes), you'll get a download link.

Or list your builds:
```bash
eas build:list
```

## Alternative: Build Locally with EAS

If you want to build on your machine but with EAS configuration:

```bash
eas build --platform android --profile production --local
```

## Why Use EAS?

- ✅ Handles all native dependencies automatically
- ✅ No need to manage keystores manually
- ✅ Consistent builds across different machines
- ✅ Free tier available
- ✅ Automatic signing
- ✅ Build logs and history

## Your APK is Ready!

The JS bundle has already been created at:
`android/app/src/main/assets/index.android.bundle`

This will be included in the EAS build automatically.
