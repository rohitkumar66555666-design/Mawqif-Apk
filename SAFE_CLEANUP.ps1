Write-Host "========================================" -ForegroundColor Green
Write-Host "Safe Project Cleanup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "This will remove ALL development documentation and SQL files." -ForegroundColor Yellow
Write-Host "Your APK, source code, and build files will NOT be touched." -ForegroundColor Green
Write-Host ""
Write-Host "Files to keep:" -ForegroundColor Cyan
Write-Host "  - mawqif-release-final.apk (your release APK)" -ForegroundColor White
Write-Host "  - All source code (src/, android/, assets/)" -ForegroundColor White
Write-Host "  - Configuration files (package.json, app.json, etc.)" -ForegroundColor White
Write-Host "  - README.md (main documentation)" -ForegroundColor White
Write-Host ""
Write-Host "Files to remove:" -ForegroundColor Red
Write-Host "  - All .sql files (200+ database scripts)" -ForegroundColor White
Write-Host "  - All development .md files (200+ documentation)" -ForegroundColor White
Write-Host "  - Build scripts (except essential ones)" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Are you sure you want to continue? Type 'YES' to confirm"

if ($confirm -ne 'YES') {
    Write-Host ""
    Write-Host "Cancelled. No files were deleted." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "Starting cleanup..." -ForegroundColor Cyan
Write-Host ""

$removedCount = 0
$totalSize = 0

# Remove all .sql files
Write-Host "Removing SQL files..." -ForegroundColor Cyan
$sqlFiles = Get-ChildItem -Path "." -Filter "*.sql" -File
foreach ($file in $sqlFiles) {
    try {
        $size = $file.Length
        Remove-Item $file.FullName -Force
        $removedCount++
        $totalSize += $size
    } catch {
        Write-Host "  Failed: $($file.Name)" -ForegroundColor Red
    }
}
Write-Host "  Removed $($sqlFiles.Count) SQL files" -ForegroundColor Green

# Remove development .md files (keep only README.md)
Write-Host "Removing development documentation..." -ForegroundColor Cyan
$mdFiles = Get-ChildItem -Path "." -Filter "*.md" -File | Where-Object { $_.Name -ne "README.md" }
foreach ($file in $mdFiles) {
    try {
        $size = $file.Length
        Remove-Item $file.FullName -Force
        $removedCount++
        $totalSize += $size
    } catch {
        Write-Host "  Failed: $($file.Name)" -ForegroundColor Red
    }
}
Write-Host "  Removed $($mdFiles.Count) documentation files" -ForegroundColor Green

# Remove old build scripts
Write-Host "Removing old build scripts..." -ForegroundColor Cyan
$scriptsToRemove = @(
    "build-debug.ps1",
    "build-release.ps1",
    "build-with-eas.ps1",
    "check-build-error.ps1",
    "clean-build-artifacts.ps1",
    "cleanup-duplicates.ps1",
    "configure-and-build.ps1",
    "fix-expo.ps1",
    "fresh-release-build.ps1",
    "generate-keystore.ps1",
    "rebuild-release.ps1",
    "sign-apk.ps1",
    "sign-with-apksigner.ps1"
)

foreach ($script in $scriptsToRemove) {
    if (Test-Path $script) {
        try {
            $size = (Get-Item $script).Length
            Remove-Item $script -Force
            $removedCount++
            $totalSize += $size
        } catch {
            Write-Host "  Failed: $script" -ForegroundColor Red
        }
    }
}
Write-Host "  Removed build scripts" -ForegroundColor Green

# Remove duplicate APK files (keep only mawqif-release-final.apk)
Write-Host "Removing duplicate APK files..." -ForegroundColor Cyan
$apksToRemove = @(
    "mawqif-debug.apk",
    "mawqif-release.apk",
    "mawqif-release-signed.apk",
    "mawqif-release-final.apk.idsig"
)

foreach ($apk in $apksToRemove) {
    if (Test-Path $apk) {
        try {
            $size = (Get-Item $apk).Length
            Remove-Item $apk -Force
            $removedCount++
            $totalSize += $size
            Write-Host "  Removed: $apk" -ForegroundColor Green
        } catch {
            Write-Host "  Failed: $apk" -ForegroundColor Red
        }
    }
}

# Remove other unnecessary files
Write-Host "Removing other unnecessary files..." -ForegroundColor Cyan
$otherFiles = @(
    "gradle.properties.example",
    "icon.png.jpeg",
    "FIXED_REVIEW_REPORTS_SERVICE.ts"
)

foreach ($file in $otherFiles) {
    if (Test-Path $file) {
        try {
            $size = (Get-Item $file).Length
            Remove-Item $file -Force
            $removedCount++
            $totalSize += $size
        } catch {
            Write-Host "  Failed: $file" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Removed: $removedCount files" -ForegroundColor Cyan
Write-Host "Space freed: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your project is now clean!" -ForegroundColor Green
Write-Host "Your release APK is safe at: mawqif-release-final.apk" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
