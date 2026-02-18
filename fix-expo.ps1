# Expo Fix Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Expo Fix Script for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop running processes
Write-Host "Step 1: Stopping any running Metro bundler..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Clear Expo cache
Write-Host "Step 2: Clearing Expo cache..." -ForegroundColor Yellow
npx expo start -c --no-dev --minify
Start-Sleep -Seconds 2

# Step 3: Clear npm cache
Write-Host "Step 3: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Step 4: Check for port conflicts
Write-Host "Step 4: Checking for port conflicts..." -ForegroundColor Yellow
Write-Host "Processes on port 8081:" -ForegroundColor Gray
netstat -ano | Select-String ":8081"
Write-Host "Processes on port 19000:" -ForegroundColor Gray
netstat -ano | Select-String ":19000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Cache cleared! Now starting Expo..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Menu
Write-Host "Choose startup mode:" -ForegroundColor Cyan
Write-Host "1. Normal mode" -ForegroundColor White
Write-Host "2. Tunnel mode (for network issues)" -ForegroundColor White
Write-Host "3. Clear cache and reinstall" -ForegroundColor White
Write-Host "4. Run diagnostics" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Starting in normal mode..." -ForegroundColor Green
        npx expo start -c
    }
    "2" {
        Write-Host "Starting in tunnel mode..." -ForegroundColor Green
        npx expo start -c --tunnel
    }
    "3" {
        Write-Host "Clearing node_modules and reinstalling..." -ForegroundColor Yellow
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
        npm install
        npx expo start -c
    }
    "4" {
        Write-Host "Running diagnostics..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Node version:" -ForegroundColor Cyan
        node --version
        Write-Host ""
        Write-Host "npm version:" -ForegroundColor Cyan
        npm --version
        Write-Host ""
        Write-Host "Expo version:" -ForegroundColor Cyan
        npx expo --version
        Write-Host ""
        Write-Host "Running Expo Doctor..." -ForegroundColor Cyan
        npx expo-doctor
        Write-Host ""
        Write-Host "Press any key to start Expo..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        npx expo start -c
    }
    default {
        Write-Host "Invalid choice. Starting in normal mode..." -ForegroundColor Red
        npx expo start -c
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
