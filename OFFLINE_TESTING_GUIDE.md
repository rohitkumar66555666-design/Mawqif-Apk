# 🧪 Offline Caching System - Testing Guide

## 🎯 How to Test Offline Functionality

### 1. **Initial Setup**
```bash
# Start the app
npm start
# or
expo start
```

### 2. **Build Cache (Online Mode)**
1. Open the app with internet connection
2. Browse the HomeScreen - places will be automatically cached
3. Open MapScreen - view places on map
4. Tap on a few places to cache their details
5. Get directions to a place (this caches the route)

### 3. **Test Offline Mode**

#### Method 1: Disable Device Internet
1. Turn off WiFi and mobile data on your device
2. Return to the app
3. You should see the orange "Offline Mode" banner at the top

#### Method 2: Airplane Mode
1. Enable airplane mode on your device
2. Return to the app
3. Offline banner should appear

### 4. **Verify Offline Features**

#### HomeScreen Offline:
- ✅ Places list should still display cached places
- ✅ Search should work on cached data
- ✅ Filters should work on cached places
- ✅ Orange offline banner should be visible
- ✅ Tap banner to access cache management

#### MapScreen Offline:
- ✅ Map should display with cached places
- ✅ Place markers should be visible
- ✅ Tap markers to view place details
- ✅ Get directions should work (straight-line route)
- ✅ Orange offline banner should be visible

#### PlaceDetailScreen Offline:
- ✅ Place details should load from cache
- ✅ Photos should display (if cached)
- ✅ Contact info should be accessible
- ✅ "Get Directions" should work with basic routing

#### Cache Management Screen:
- ✅ Shows "Offline Mode" status
- ✅ Displays cache statistics (places count, last update)
- ✅ Lists offline features available
- ✅ "Clear Cache" buttons work
- ✅ Refresh control updates statistics

### 5. **Test Cache Management**

#### Access Cache Management:
1. Tap the orange offline banner, OR
2. Navigate to cache management (if added to menu)

#### Test Cache Clearing:
1. Tap "Clear Places Cache" - should clear only places
2. Tap "Clear All Cache" - should clear everything
3. Verify cache statistics update after clearing

### 6. **Test Online Recovery**

#### Restore Internet:
1. Turn WiFi/mobile data back on
2. Return to the app
3. Orange offline banner should disappear
4. Pull to refresh should fetch new data
5. New data should be cached automatically

### 7. **Edge Case Testing**

#### Empty Cache:
1. Clear all cache while online
2. Disable internet immediately
3. App should show "No cached data" messages

#### Partial Cache:
1. Cache some places
2. Clear only places cache
3. Go offline
4. Should show appropriate empty states

#### Network Switching:
1. Switch between WiFi and mobile data
2. App should handle transitions smoothly
3. Cache should continue working

## 🔍 What to Look For

### ✅ Success Indicators:
- Orange "Offline Mode" banner appears when offline
- Cached places display correctly
- Place details load from cache
- Basic directions work offline
- Cache statistics are accurate
- Manual cache clearing works
- Smooth online/offline transitions

### ❌ Issues to Report:
- App crashes when going offline
- Blank screens instead of cached data
- Offline banner doesn't appear
- Cache management screen errors
- Directions fail completely offline
- Cache clearing doesn't work

## 📱 Testing on Different Devices

### iOS Testing:
- Test on iPhone/iPad
- Verify offline banner positioning
- Check cache management UI
- Test airplane mode behavior

### Android Testing:
- Test on Android devices
- Verify offline detection
- Check AsyncStorage functionality
- Test network state changes

## 🐛 Common Issues & Solutions

### Issue: Offline banner doesn't appear
**Solution**: Check network detection in `CacheService.isOfflineMode()`

### Issue: Cached data not loading
**Solution**: Verify AsyncStorage permissions and data format

### Issue: Cache management screen blank
**Solution**: Check cache statistics loading in `CacheManagementScreen`

### Issue: Directions fail offline
**Solution**: Verify `OfflineDirectionsService` fallback logic

## 📊 Performance Testing

### Cache Performance:
- Initial cache load time: < 1 second
- Offline data access: < 200ms
- Cache write operations: < 500ms
- Memory usage: Monitor for leaks

### Storage Testing:
- Cache 100+ places and monitor storage
- Test cache cleanup after 7 days
- Verify version management works

## 🎯 Test Scenarios

### Scenario 1: New User Offline
1. Fresh app install
2. Immediately go offline
3. Should show appropriate empty states

### Scenario 2: Regular User Offline
1. Use app normally for a few days
2. Go offline
3. Should have rich cached experience

### Scenario 3: Storage Full
1. Fill device storage
2. Test cache operations
3. Should handle gracefully

### Scenario 4: App Update
1. Update app with cached data
2. Cache version should update
3. Old cache should be cleared

## ✅ Testing Checklist

- [ ] Cache initializes on app start
- [ ] Places cache automatically when browsing
- [ ] Offline banner appears when internet lost
- [ ] HomeScreen works offline with cached data
- [ ] MapScreen displays cached places offline
- [ ] PlaceDetailScreen loads from cache
- [ ] Basic directions work offline
- [ ] Cache management screen functions
- [ ] Cache statistics are accurate
- [ ] Manual cache clearing works
- [ ] App recovers when internet restored
- [ ] Performance is acceptable
- [ ] No memory leaks detected
- [ ] Works on both iOS and Android

## 🎉 Success Criteria

The offline caching system is working correctly if:

1. **Seamless Experience**: Users can browse places offline without knowing the difference
2. **Clear Indicators**: Offline status is clearly communicated
3. **Full Functionality**: Core features work offline (view places, get addresses, basic directions)
4. **Easy Management**: Users can manage cache storage easily
5. **Reliable Recovery**: App smoothly transitions back online

**Ready for production when all test scenarios pass! ✅**