Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Mawqif Release APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if device is connected
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
adb devices

Write-Host ""
Write-Host "Make sure your phone is:" -ForegroundColor Yellow
Write-Host "1. Connected via USB" -ForegroundColor White
Write-Host "2. USB Debugging is enabled" -ForegroundColor White
Write-Host "3. You've authorized this computer on your phone" -ForegroundColor White
Write-Host ""

$response = Read-Host "Is your device listed above? (y/n)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Installing APK..." -ForegroundColor Green
    adb install -r "mawqif-release-signed.apk"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Installation Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Check your phone - the Mawqif app should now be installed." -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Please enable USB Debugging on your phone:" -ForegroundColor Yellow
    Write-Host "1. Go to Settings > About Phone" -ForegroundColor White
    Write-Host "2. Tap 'Build Number' 7 times to enable Developer Options" -ForegroundColor White
    Write-Host "3. Go to Settings > Developer Options" -ForegroundColor White
    Write-Host "4. Enable 'USB Debugging'" -ForegroundColor White
    Write-Host "5. Connect your phone and run this script again" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
