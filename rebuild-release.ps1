Write-Host "========================================" -ForegroundColor Green
Write-Host "Rebuilding Mawqif Release APK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Set-Location android

Write-Host "Step 1: Cleaning all previous builds..." -ForegroundColor Cyan
.\gradlew.bat clean

Write-Host ""
Write-Host "Step 2: Building release APK..." -ForegroundColor Cyan
Write-Host "This will take several minutes. Please wait..." -ForegroundColor Yellow
Write-Host ""

.\gradlew.bat assembleRelease --stacktrace

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Checking if APK was created..." -ForegroundColor Cyan
    
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SUCCESS! Release APK built!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "APK Location:" -ForegroundColor Cyan
        Write-Host "android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Yellow
        Write-Host ""
        
        # Copy to parent directory for easy access
        Copy-Item $apkPath "..\mawqif-release.apk" -Force
        Write-Host "✓ Copied to: Mawqif-app\mawqif-release.apk" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Install on device:" -ForegroundColor Cyan
        Write-Host "adb install app\build\outputs\apk\release\app-release.apk" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "ERROR: APK file not found!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "The build completed but no APK was generated." -ForegroundColor Yellow
        Write-Host "Check the error messages above for details." -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "BUILD FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Wrong keystore password"
    Write-Host "2. Corrupted keystore file"
    Write-Host "3. Missing dependencies"
    Write-Host "4. Check error messages above"
    Write-Host ""
    Write-Host "Try building without signing (debug mode):" -ForegroundColor Cyan
    Write-Host ".\gradlew.bat assembleDebug" -ForegroundColor Yellow
    Write-Host ""
}

Set-Location ..
Read-Host "Press Enter to exit"
