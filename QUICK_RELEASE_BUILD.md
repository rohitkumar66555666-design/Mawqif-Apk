# Quick Release Build Instructions

## First Time Setup (One-time only)

### 1. Generate Keystore
Run this command from the `Mawqif-app` directory:
```bash
generate-keystore.bat
```

Or manually:
```bash
cd android\app
keytool -genkeypair -v -storetype PKCS12 -keystore mawqif-release.keystore -alias mawqif-key -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Gradle
Copy the example file:
```bash
copy gradle.properties.example android\gradle.properties
```

Edit `android\gradle.properties` and add your passwords:
```properties
MAWQIF_UPLOAD_STORE_FILE=mawqif-release.keystore
MAWQIF_UPLOAD_KEY_ALIAS=mawqif-key
MAWQIF_UPLOAD_STORE_PASSWORD=your_actual_password
MAWQIF_UPLOAD_KEY_PASSWORD=your_actual_password
```

## Build Release APK

### Option 1: Use the Build Script (Easiest)
```bash
build-release.bat
```

### Option 2: Manual Build
```bash
cd Mawqif-app\android
gradlew.bat assembleRelease
```

### Option 3: Using Expo
```bash
cd Mawqif-app
npx expo run:android --variant release
```

## Find Your APK

After successful build:
```
Mawqif-app\android\app\build\outputs\apk\release\app-release.apk
```

## Install on Device

```bash
adb install android\app\build\outputs\apk\release\app-release.apk
```

## Important Notes

- Keep your keystore file safe - you need it for all future updates
- Never commit keystore or gradle.properties with passwords to git
- The release APK is optimized and minified for production
- Test thoroughly before distributing

## Troubleshooting

**Build fails?**
- Check that Java JDK is installed
- Verify keystore path and passwords in gradle.properties
- Run `gradlew.bat clean` before building

**APK won't install?**
- Uninstall the debug version first
- Enable "Install from unknown sources" on your device
- Check that the APK is signed correctly

**Need help?**
See the detailed guide: `BUILD_RELEASE_APK.md`
