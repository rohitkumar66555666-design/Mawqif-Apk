# 🚀 Quick Start Guide

## **Option 1: Use Fix Script (Easiest)**

### **Windows Command Prompt:**
```bash
fix-expo.bat
```

### **Windows PowerShell:**
```powershell
.\fix-expo.ps1
```

The script will:
1. ✅ Stop any running processes
2. ✅ Clear all caches
3. ✅ Check for port conflicts
4. ✅ Give you startup options

---

## **Option 2: Manual Commands**

### **Quick Start (Recommended):**
```bash
npx expo start -c
```

### **If Network Issues:**
```bash
npx expo start -c --tunnel
```

### **If Still Not Working:**
```bash
# Full reset
rm -rf node_modules .expo
npm install
npx expo start -c
```

---

## **Common Issues**

### **1. Expo Hangs on "Starting project..."**

**Fix:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Start fresh
npx expo start -c
```

### **2. Port Already in Use**

**Fix:**
```bash
# Find process on port 8081
netstat -ano | findstr :8081

# Kill it (replace PID with actual number)
taskkill /PID [PID] /F

# Or use different port
npx expo start --port 8082
```

### **3. Cannot Connect to Metro**

**Fix:**
```bash
# Use tunnel mode
npx expo start --tunnel
```

### **4. Module Not Found Errors**

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npx expo start -c
```

---

## **Startup Modes**

### **Normal Mode (Default):**
```bash
npx expo start
```
- Fastest
- Requires same WiFi network
- May have firewall issues

### **Tunnel Mode (Most Reliable):**
```bash
npx expo start --tunnel
```
- Works with any network
- Bypasses firewall
- Slightly slower

### **LAN Mode:**
```bash
npx expo start --lan
```
- Uses local network IP
- Good for same WiFi
- Faster than tunnel

### **Web Mode:**
```bash
npx expo start --web
```
- Opens in browser
- Good for testing
- No phone needed

---

## **First Time Setup**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Expo:**
   ```bash
   npx expo start -c
   ```

3. **Scan QR code with Expo Go app**

4. **Wait for bundle to load**

---

## **Troubleshooting Checklist**

- [ ] Node.js installed (v18+)
- [ ] npm installed
- [ ] Same WiFi network (phone & computer)
- [ ] Expo Go app installed on phone
- [ ] Firewall allows Expo
- [ ] No VPN active
- [ ] Antivirus not blocking

---

## **Quick Commands**

```bash
# Start with cache clear
npx expo start -c

# Start in tunnel mode
npx expo start --tunnel

# Check for issues
npx expo-doctor

# Update dependencies
npx expo install --fix

# Run on web
npx expo start --web

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

---

## **Need Help?**

1. **Check logs** - Look for error messages in terminal
2. **Run diagnostics** - `npx expo-doctor`
3. **See full guide** - Read `EXPO_FIX_GUIDE.md`
4. **Use fix script** - Run `fix-expo.bat` or `fix-expo.ps1`

---

## **Recommended Workflow**

```bash
# Every time you start development:

1. npx expo start -c        # Clear cache and start
2. Scan QR code             # In Expo Go app
3. Wait for bundle          # First load takes time
4. Start coding!            # Hot reload will work
```

---

## **Pro Tips**

1. **Always clear cache first:**
   ```bash
   npx expo start -c
   ```

2. **Use tunnel for reliability:**
   ```bash
   npx expo start --tunnel
   ```

3. **Check for updates regularly:**
   ```bash
   npx expo install --check
   ```

4. **Keep Expo Go updated** on your phone

5. **Restart Metro if it hangs:**
   - Press `r` in terminal to reload
   - Press `Ctrl+C` to stop
   - Run `npx expo start -c` again

---

## **Your Project Structure**

```
PRAYER APP/Mawqif-App/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── screens/           # App screens
│   ├── services/          # API services
│   └── utils/             # Utilities
├── App.tsx                # Main app file
├── package.json           # Dependencies
├── fix-expo.bat          # Windows fix script
├── fix-expo.ps1          # PowerShell fix script
└── QUICK_START.md        # This file
```

---

## **Next Steps**

1. ✅ Start Expo: `npx expo start -c`
2. ✅ Scan QR code with Expo Go
3. ✅ Test the app
4. ✅ Start developing!

**Happy coding! 🎉**
