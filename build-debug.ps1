Write-Host "========================================" -ForegroundColor Green
Write-Host "Building Mawqif Debug APK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Debug APKs are easier to install and don't require keystore setup." -ForegroundColor Yellow
Write-Host ""

Set-Location android

Write-Host "Cleaning previous builds..." -ForegroundColor Cyan
.\gradlew.bat clean

Write-Host ""
Write-Host "Building debug APK..." -ForegroundColor Cyan
Write-Host ""

.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SUCCESS! Debug APK built!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        
        # Copy to parent directory
        Copy-Item $apkPath "..\mawqif-debug.apk" -Force
        
        Write-Host "✓ APK Location: Mawqif-app\mawqif-debug.apk" -ForegroundColor Green
        Write-Host ""
        Write-Host "Install on device:" -ForegroundColor Cyan
        Write-Host "adb install ..\mawqif-debug.apk" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Or copy mawqif-debug.apk to your phone and install it." -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "✗ APK not found!" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "✗ Build failed!" -ForegroundColor Red
}

Set-Location ..
Read-Host "Press Enter to exit"
