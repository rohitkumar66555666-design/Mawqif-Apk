# Build Release APK Guide

This guide will help you build a production-ready release APK for the Mawqif app.

## Step 1: Generate a Release Keystore

You need to create a keystore file to sign your release APK. Run this command in the `Mawqif-app/android/app` directory:

```bash
cd Mawqif-app/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore mawqif-release.keystore -alias mawqif-key -keyalg RSA -keysize 2048 -validity 10000
```

You'll be asked to provide:
- Keystore password (remember this!)
- Key password (remember this!)
- Your name, organization, city, state, country

**IMPORTANT**: Keep your keystore file and passwords safe! You'll need them for all future app updates.

## Step 2: Configure Gradle Properties

Create or edit `Mawqif-app/android/gradle.properties` and add these lines at the end:

```properties
MAWQIF_UPLOAD_STORE_FILE=mawqif-release.keystore
MAWQIF_UPLOAD_KEY_ALIAS=mawqif-key
MAWQIF_UPLOAD_STORE_PASSWORD=your_keystore_password
MAWQIF_UPLOAD_KEY_PASSWORD=your_key_password
```

Replace `your_keystore_password` and `your_key_password` with the passwords you created in Step 1.

**SECURITY NOTE**: Add `gradle.properties` to `.gitignore` to avoid committing passwords to version control.

## Step 3: Build the Release APK

From the `Mawqif-app` directory, run:

```bash
cd Mawqif-app
npx expo run:android --variant release
```

Or build directly with Gradle:

```bash
cd Mawqif-app/android
./gradlew assembleRelease
```

On Windows, use:
```bash
cd Mawqif-app\android
gradlew.bat assembleRelease
```

## Step 4: Find Your Release APK

After a successful build, your release APK will be located at:

```
Mawqif-app/android/app/build/outputs/apk/release/app-release.apk
```

## Step 5: Test the Release APK

Install the release APK on your device:

```bash
adb install Mawqif-app/android/app/build/outputs/apk/release/app-release.apk
```

## Alternative: Build with EAS (Expo Application Services)

If you prefer using Expo's build service:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
cd Mawqif-app
eas build:configure
```

4. Build release APK:
```bash
eas build --platform android --profile production
```

## Troubleshooting

### Issue: "keytool not found"
- Make sure Java JDK is installed and added to your PATH
- On Windows, keytool is usually in `C:\Program Files\Java\jdk-XX\bin\`

### Issue: Build fails with signing errors
- Double-check your keystore path and passwords in `gradle.properties`
- Ensure the keystore file exists in `android/app/` directory

### Issue: APK size is too large
- Enable ProGuard/R8 minification (already configured)
- Enable resource shrinking by adding to `gradle.properties`:
```properties
android.enableShrinkResourcesInReleaseBuilds=true
android.enableMinifyInReleaseBuilds=true
```

## Next Steps

After building your release APK:
1. Test thoroughly on multiple devices
2. Upload to Google Play Console for distribution
3. Keep your keystore file backed up securely
