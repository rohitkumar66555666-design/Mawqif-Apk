Write-Host "========================================" -ForegroundColor Green
Write-Host "Mawqif Release Keystore Generator" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "This will create a keystore file for signing your release APK."
Write-Host "You will be asked to provide passwords and information."
Write-Host ""
Write-Host "IMPORTANT: Remember your passwords! You'll need them for all future updates." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"

Set-Location android\app

Write-Host ""
Write-Host "Generating keystore..." -ForegroundColor Cyan
Write-Host ""

keytool -genkeypair -v -storetype PKCS12 -keystore mawqif-release.keystore -alias mawqif-key -keyalg RSA -keysize 2048 -validity 10000

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Keystore created successfully." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: android\app\mawqif-release.keystore" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Edit android\gradle.properties"
    Write-Host "2. Add your keystore configuration"
    Write-Host "3. Run: .\build-release.ps1"
    Write-Host ""
    Write-Host "See BUILD_RELEASE_APK.md for detailed instructions."
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Failed to create keystore" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure Java JDK is installed and keytool is in your PATH."
    Write-Host ""
}

Read-Host "Press Enter to exit"
