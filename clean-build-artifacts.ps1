Write-Host "========================================" -ForegroundColor Green
Write-Host "Cleaning Build Artifacts" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "This will remove temporary build files that can be regenerated." -ForegroundColor Yellow
Write-Host "Your source code and configuration will NOT be touched." -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"

if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""

$foldersToClean = @(
    "android\.gradle",
    "android\.kotlin",
    "android\app\.cxx",
    "android\app\build",
    "android\build",
    ".expo"
)

$totalSize = 0
$removedCount = 0

foreach ($folder in $foldersToClean) {
    if (Test-Path $folder) {
        try {
            # Calculate size before removing
            $size = (Get-ChildItem $folder -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $sizeMB = [math]::Round($size / 1MB, 2)
            
            Remove-Item $folder -Recurse -Force -ErrorAction Stop
            Write-Host "✓ Removed: $folder ($sizeMB MB)" -ForegroundColor Green
            $totalSize += $size
            $removedCount++
        } catch {
            Write-Host "✗ Failed to remove: $folder" -ForegroundColor Red
        }
    } else {
        Write-Host "○ Not found: $folder" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removed: $removedCount folders" -ForegroundColor Green
Write-Host "Space freed: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor Green
Write-Host ""
Write-Host "These files will be regenerated when you build the app again." -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
