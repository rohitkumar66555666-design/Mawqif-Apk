Write-Host "========================================" -ForegroundColor Green
Write-Host "Fresh Release Build (New Keystore)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "This will create a NEW keystore and build a release APK." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"

if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 1: Removing old keystore..." -ForegroundColor Cyan
Remove-Item "android\app\mawqif-release.keystore" -Force -ErrorAction SilentlyContinue

Write-Host "Step 2: Creating new keystore..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Enter a password (remember this!):" -ForegroundColor Yellow
$password = Read-Host "Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Generating keystore..." -ForegroundColor Cyan

Set-Location android\app

# Create keystore with provided password
$process = Start-Process -FilePath "keytool" -ArgumentList "-genkeypair -v -storetype PKCS12 -keystore mawqif-release.keystore -alias mawqif-key -keyalg RSA -keysize 2048 -validity 10000 -storepass $passwordPlain -keypass $passwordPlain -dname `"CN=Mawqif, OU=Mobile, O=Mawqif, L=City, S=State, C=US`"" -Wait -NoNewWindow -PassThru

Set-Location ..\..

if ($process.ExitCode -eq 0) {
    Write-Host "✓ Keystore created" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Step 3: Updating gradle.properties..." -ForegroundColor Cyan
    
    # Update gradle.properties
    $gradleProps = "android\gradle.properties"
    $content = Get-Content $gradleProps -Raw
    
    $content = $content -replace 'MAWQIF_UPLOAD_STORE_PASSWORD=.*', "MAWQIF_UPLOAD_STORE_PASSWORD=$passwordPlain"
    $content = $content -replace 'MAWQIF_UPLOAD_KEY_PASSWORD=.*', "MAWQIF_UPLOAD_KEY_PASSWORD=$passwordPlain"
    
    Set-Content -Path $gradleProps -Value $content
    
    Write-Host "✓ Configuration updated" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Step 4: Building release APK..." -ForegroundColor Cyan
    Write-Host ""
    
    Set-Location android
    
    .\gradlew.bat clean
    .\gradlew.bat assembleRelease
    
    if ($LASTEXITCODE -eq 0) {
        $apkPath = "app\build\outputs\apk\release\app-release.apk"
        
        if (Test-Path $apkPath) {
            # Sign with apksigner
            Write-Host ""
            Write-Host "Step 5: Signing APK..." -ForegroundColor Cyan
            
            $sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
            $buildToolsPath = Get-ChildItem "$sdkPath\build-tools" -Directory | Sort-Object Name -Descending | Select-Object -First 1
            
            if ($buildToolsPath) {
                $apksigner = Join-Path $buildToolsPath.FullName "apksigner.bat"
                $zipalign = Join-Path $buildToolsPath.FullName "zipalign.exe"
                
                $alignedApk = "app\build\outputs\apk\release\app-release-aligned.apk"
                $finalApk = "..\mawqif-release-final.apk"
                
                & $zipalign -v -p 4 $apkPath $alignedApk
                & $apksigner sign --ks ..\app\mawqif-release.keystore --ks-key-alias mawqif-key --ks-pass pass:$passwordPlain --key-pass pass:$passwordPlain --out $finalApk $alignedApk
                
                if ($LASTEXITCODE -eq 0) {
                    $apkSize = (Get-Item $finalApk).Length / 1MB
                    
                    Write-Host ""
                    Write-Host "========================================" -ForegroundColor Green
                    Write-Host "SUCCESS! Release APK ready!" -ForegroundColor Green
                    Write-Host "========================================" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "APK: Mawqif-app\mawqif-release-final.apk" -ForegroundColor Cyan
                    Write-Host "Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
                    Write-Host ""
                    Write-Host "Keystore password: $passwordPlain" -ForegroundColor Yellow
                    Write-Host "SAVE THIS PASSWORD! You'll need it for future updates." -ForegroundColor Red
                    Write-Host ""
                }
            }
        }
    }
    
    Set-Location ..
} else {
    Write-Host "✗ Failed to create keystore" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
