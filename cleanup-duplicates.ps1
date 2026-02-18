Write-Host "========================================" -ForegroundColor Green
Write-Host "Cleaning Up Duplicate & Unnecessary Files" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$itemsToRemove = @(
    # Duplicate/old APK files (keep only mawqif-release-final.apk)
    "mawqif-release-signed.apk",
    "mawqif-release.apk",
    "mawqif-debug.apk",
    
    # Backup files
    "App.minimal.backup.tsx",
    "App.test.backup.tsx",
    "package.minimal.backup.json",
    
    # Duplicate/old build scripts
    "fix-expo.bat",
    "generate-keystore.bat",
    "build-release.bat",
    
    # External/duplicate folders
    "external-Mawqif-YASH",
    "Mawqif-App",
    
    # Temporary build files
    "android\app\build\outputs\apk\release\app-release-aligned.apk",
    "build-log.txt",
    
    # Old/duplicate SQL files (keeping only essential ones)
    "CLEANUP_DUPLICATES_FIRST.sql",
    "CLEANUP_DUPLICATES_FIXED.sql",
    "EMERGENCY_DUPLICATE_FIX.sql",
    "SIMPLE_DUPLICATE_CLEANUP.sql",
    
    # Duplicate fix documentation
    "FIX_DUPLICATE_IMAGES.md",
    "DUPLICATE_PHONE_NUMBER_FIX_COMPLETE.md",
    "PROFILE_DUPLICATE_PHONE_FIX_COMPLETE.md",
    
    # Old keystore generation scripts (we have PS1 versions)
    "sign-apk.ps1",
    "check-build-error.ps1",
    "configure-and-build.ps1"
)

$removedCount = 0
$notFoundCount = 0

foreach ($item in $itemsToRemove) {
    $fullPath = Join-Path "." $item
    
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Recurse -Force -ErrorAction Stop
            Write-Host "✓ Removed: $item" -ForegroundColor Green
            $removedCount++
        } catch {
            Write-Host "✗ Failed to remove: $item" -ForegroundColor Red
        }
    } else {
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removed: $removedCount items" -ForegroundColor Green
Write-Host "Not found: $notFoundCount items" -ForegroundColor Yellow
Write-Host ""

# Clean up node_modules duplicates
Write-Host "Checking for duplicate dependencies in package.json..." -ForegroundColor Cyan

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

if ($packageJson.dependencies -and $packageJson.devDependencies) {
    $duplicates = @()
    
    foreach ($dep in $packageJson.dependencies.PSObject.Properties.Name) {
        if ($packageJson.devDependencies.PSObject.Properties.Name -contains $dep) {
            $duplicates += $dep
        }
    }
    
    if ($duplicates.Count -gt 0) {
        Write-Host ""
        Write-Host "Found duplicate dependencies:" -ForegroundColor Yellow
        foreach ($dup in $duplicates) {
            Write-Host "  - $dup" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "These should be in either dependencies OR devDependencies, not both." -ForegroundColor Yellow
    } else {
        Write-Host "✓ No duplicate dependencies found" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Kept files:" -ForegroundColor Cyan
Write-Host "  - mawqif-release-final.apk (your release APK)" -ForegroundColor Yellow
Write-Host "  - All PowerShell scripts (.ps1)" -ForegroundColor Yellow
Write-Host "  - Essential documentation" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
