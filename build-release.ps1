Write-Host "========================================" -ForegroundColor Green
Write-Host "Building Mawqif Release APK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Set-Location android

Write-Host "Cleaning previous builds..." -ForegroundColor Cyan
.\gradlew.bat clean

Write-Host ""
Write-Host "Building release APK..." -ForegroundColor Cyan
Write-Host "This may take several minutes..." -ForegroundColor Yellow
Write-Host ""

.\gradlew.bat assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Release APK built successfully" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now install it on your device:"
    Write-Host "adb install android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above."
    Write-Host "Make sure you have configured your keystore in gradle.properties"
    Write-Host ""
}

Read-Host "Press Enter to exit"
