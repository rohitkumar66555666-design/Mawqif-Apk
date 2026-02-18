Write-Host "========================================" -ForegroundColor Green
Write-Host "Signing APK with apksigner" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$unsignedApk = "android\app\build\outputs\apk\release\app-release.apk"
$signedApk = "mawqif-release-final.apk"
$keystorePath = "android\app\mawqif-release.keystore"

# Find Android SDK
$sdkPath = $env:ANDROID_HOME
if (!$sdkPath) {
    $sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
}

if (!(Test-Path $sdkPath)) {
    Write-Host "✗ Android SDK not found!" -ForegroundColor Red
    Write-Host "Please install Android SDK or set ANDROID_HOME environment variable" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

# Find latest build-tools
$buildToolsPath = Get-ChildItem "$sdkPath\build-tools" -Directory | Sort-Object Name -Descending | Select-Object -First 1

if (!$buildToolsPath) {
    Write-Host "✗ Build tools not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit
}

$apksigner = Join-Path $buildToolsPath.FullName "apksigner.bat"
$zipalign = Join-Path $buildToolsPath.FullName "zipalign.exe"

Write-Host "Using build-tools: $($buildToolsPath.Name)" -ForegroundColor Cyan
Write-Host ""

# First, zipalign
Write-Host "Step 1: Aligning APK..." -ForegroundColor Cyan
$alignedApk = "android\app\build\outputs\apk\release\app-release-aligned.apk"

if (Test-Path $alignedApk) {
    Remove-Item $alignedApk -Force
}

& $zipalign -v -p 4 $unsignedApk $alignedApk

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ APK aligned" -ForegroundColor Green
    Write-Host ""
    
    # Now sign with apksigner
    Write-Host "Step 2: Signing APK..." -ForegroundColor Cyan
    
    & $apksigner sign --ks $keystorePath --ks-key-alias mawqif-key --ks-pass pass:932167 --key-pass pass:932167 --out $signedApk $alignedApk
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ APK signed" -ForegroundColor Green
        Write-Host ""
        
        # Verify
        Write-Host "Step 3: Verifying signature..." -ForegroundColor Cyan
        & $apksigner verify --verbose $signedApk
        
        if ($LASTEXITCODE -eq 0) {
            $apkSize = (Get-Item $signedApk).Length / 1MB
            
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "SUCCESS! APK ready to install!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "APK: $signedApk" -ForegroundColor Cyan
            Write-Host "Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Install with:" -ForegroundColor Yellow
            Write-Host "adb install $signedApk" -ForegroundColor Cyan
            Write-Host ""
        } else {
            Write-Host "✗ Verification failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Signing failed!" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Zipalign failed!" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
