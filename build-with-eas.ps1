Write-Host "========================================" -ForegroundColor Green
Write-Host "Building Release APK with EAS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "EAS Build is Expo's cloud build service." -ForegroundColor Cyan
Write-Host "It handles all signing and building automatically." -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue

if (!$easInstalled) {
    Write-Host "EAS CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    npm install -g eas-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "✗ Failed to install EAS CLI" -ForegroundColor Red
        Write-Host "Install manually with: npm install -g eas-cli" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit
    }
}

Write-Host "✓ EAS CLI ready" -ForegroundColor Green
Write-Host ""

# Login to Expo
Write-Host "Step 1: Login to Expo account" -ForegroundColor Cyan
Write-Host "(Create a free account at expo.dev if you don't have one)" -ForegroundColor Yellow
Write-Host ""

eas login

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Login failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Step 2: Configure EAS Build" -ForegroundColor Cyan
Write-Host ""

eas build:configure

Write-Host ""
Write-Host "Step 3: Build Release APK" -ForegroundColor Cyan
Write-Host "This will build in the cloud and may take 10-15 minutes..." -ForegroundColor Yellow
Write-Host ""

eas build --platform android --profile production

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build submitted!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "The APK will be available for download from your Expo dashboard:" -ForegroundColor Cyan
Write-Host "https://expo.dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or download directly when build completes using:" -ForegroundColor Cyan
Write-Host "eas build:list" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
