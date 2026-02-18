# Expo Not Working - Complete Fix Guide

## Quick Diagnosis

Your setup:
- ✅ Node.js: v24.11.1
- ✅ npm: 11.6.2
- ✅ Expo: 54.0.20
- ✅ No TypeScript errors

## Common Issues & Fixes

### **Issue 1: Expo Start Hangs/Freezes**

**Symptoms:**
- `npm start` runs but nothing happens
- Terminal shows "Starting project..." and stops
- No QR code appears

**Fix:**

```bash
# 1. Clear Expo cache
npx expo start -c

# 2. Clear npm cache
npm cache clean --force

# 3. Delete node_modules and reinstall
rm -rf node_modules
npm install

# 4. Clear Metro bundler cache
npx react-native start --reset-cache
```

---

### **Issue 2: Port Already in Use**

**Symptoms:**
- Error: "Port 8081 already in use"
- Error: "Port 19000 already in use"

**Fix:**

```bash
# Windows - Kill processes on ports
netstat -ano | findstr :8081
taskkill /PID [PID_NUMBER] /F

netstat -ano | findstr :19000
taskkill /PID [PID_NUMBER] /F

# Or use different port
npx expo start --port 8082
```

---

### **Issue 3: Module Resolution Errors**

**Symptoms:**
- "Cannot find module..."
- "Unable to resolve module..."

**Fix:**

```bash
# 1. Clear watchman cache (if installed)
watchman watch-del-all

# 2. Clear Metro cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 3. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### **Issue 4: TypeScript Errors**

**Symptoms:**
- Red squiggly lines in code
- "Cannot find name..."
- Type errors

**Fix:**

```bash
# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P
# Type: "TypeScript: Restart TS Server"

# Or reinstall types
npm install --save-dev @types/react @types/react-native
```

---

### **Issue 5: Expo Go Connection Issues**

**Symptoms:**
- QR code appears but app won't load
- "Unable to connect to development server"
- Stuck on splash screen

**Fix:**

1. **Ensure same network:**
   - Phone and computer on same WiFi
   - Disable VPN on both devices
   - Check firewall isn't blocking

2. **Use tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```

3. **Use LAN mode:**
   ```bash
   npx expo start --lan
   ```

4. **Manual connection:**
   - Note the IP address shown (e.g., exp://192.168.1.100:8081)
   - Open Expo Go
   - Tap "Enter URL manually"
   - Enter the IP address

---

### **Issue 6: Build Errors**

**Symptoms:**
- "Build failed"
- "Unable to resolve dependency tree"
- Version conflicts

**Fix:**

```bash
# 1. Check for peer dependency issues
npm install --legacy-peer-deps

# 2. Update Expo SDK
npx expo install --fix

# 3. Update all Expo packages
npx expo install --check
```

---

## **Step-by-Step Fresh Start**

If nothing works, do a complete reset:

```bash
# 1. Stop all running processes
# Press Ctrl+C in terminal

# 2. Clear all caches
npx expo start -c
npm cache clean --force

# 3. Delete generated files
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
rm package-lock.json

# 4. Reinstall everything
npm install

# 5. Start fresh
npx expo start -c
```

---

## **Windows-Specific Issues**

### **Issue: Path Too Long**

**Symptoms:**
- "ENAMETOOLONG" errors
- "Path too long" errors

**Fix:**

1. Enable long paths in Windows:
   ```powershell
   # Run as Administrator
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

2. Or move project to shorter path:
   ```bash
   # Move from:
   C:\Users\ASUS\Downloads\PRAYER APP (2)\PRAYER APP\Mawqif-App
   
   # To:
   C:\Projects\Mawqif-App
   ```

### **Issue: Antivirus Blocking**

**Symptoms:**
- Metro bundler crashes
- Random disconnections
- Slow performance

**Fix:**

Add these to antivirus exclusions:
- `C:\Users\ASUS\AppData\Local\Temp`
- Your project folder
- `node_modules` folder

---

## **Quick Commands Reference**

```bash
# Start with cache clear
npx expo start -c

# Start in tunnel mode (for network issues)
npx expo start --tunnel

# Start on different port
npx expo start --port 8082

# Start for web
npx expo start --web

# Check for updates
npx expo install --check

# Fix dependencies
npx expo install --fix

# Doctor (diagnose issues)
npx expo-doctor

# Prebuild (for native modules)
npx expo prebuild --clean
```

---

## **Recommended Start Command**

For most reliable startup:

```bash
npx expo start -c --tunnel
```

This:
- Clears cache (`-c`)
- Uses tunnel mode for better connectivity (`--tunnel`)
- Works even with firewall/network restrictions

---

## **Check Your Setup**

Run these commands to verify everything:

```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Check Expo CLI
npx expo --version

# Check for issues
npx expo-doctor

# List installed packages
npm list --depth=0
```

---

## **Common Error Messages**

### "Unable to resolve module"
```bash
npx expo start -c
```

### "Port already in use"
```bash
npx expo start --port 8082
```

### "Cannot connect to Metro"
```bash
npx expo start --tunnel
```

### "Build failed"
```bash
npm install --legacy-peer-deps
npx expo install --fix
```

### "Watchman error"
```bash
watchman watch-del-all
npx expo start -c
```

---

## **Development Server Not Starting?**

Try these in order:

1. **Basic restart:**
   ```bash
   npx expo start
   ```

2. **Clear cache:**
   ```bash
   npx expo start -c
   ```

3. **Use tunnel:**
   ```bash
   npx expo start --tunnel
   ```

4. **Full reset:**
   ```bash
   rm -rf node_modules
   npm install
   npx expo start -c
   ```

5. **Check for errors:**
   ```bash
   npx expo-doctor
   ```

---

## **Still Not Working?**

1. **Check logs:**
   - Look for error messages in terminal
   - Check Expo Go app logs
   - Look for red error screens

2. **Test basic Expo:**
   ```bash
   # Create new test project
   npx create-expo-app test-app
   cd test-app
   npx expo start
   
   # If this works, issue is in your project
   # If this fails, issue is with Expo setup
   ```

3. **Reinstall Expo CLI:**
   ```bash
   npm uninstall -g expo-cli
   npm install -g expo-cli
   ```

4. **Update everything:**
   ```bash
   npm update
   npx expo install --fix
   ```

---

## **Best Practices**

1. **Always start with cache clear:**
   ```bash
   npx expo start -c
   ```

2. **Use tunnel for network issues:**
   ```bash
   npx expo start --tunnel
   ```

3. **Keep dependencies updated:**
   ```bash
   npx expo install --check
   ```

4. **Clear cache regularly:**
   ```bash
   npx expo start -c
   ```

5. **Check for issues:**
   ```bash
   npx expo-doctor
   ```

---

## **Your Specific Setup**

Based on your project structure:

```bash
# Navigate to project
cd "PRAYER APP/Mawqif-App"

# Clear everything
npx expo start -c

# If that doesn't work, use tunnel
npx expo start -c --tunnel

# If still issues, full reset
rm -rf node_modules .expo
npm install
npx expo start -c
```

---

## **Quick Checklist**

- [ ] Node.js installed (v18+)
- [ ] npm installed
- [ ] Expo CLI working (`npx expo --version`)
- [ ] Same WiFi network (phone & computer)
- [ ] Firewall allows Expo
- [ ] Antivirus not blocking
- [ ] No VPN active
- [ ] Expo Go app updated
- [ ] Project in short path (not too nested)
- [ ] No spaces in folder names (or use quotes)

---

## **Emergency Fix**

If absolutely nothing works:

```bash
# 1. Backup your src folder
# 2. Create fresh project
npx create-expo-app mawqif-new
cd mawqif-new

# 3. Copy your src folder
# 4. Copy package.json dependencies
# 5. Install
npm install

# 6. Start
npx expo start -c
```
