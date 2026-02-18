# Show All Places Fix - "12 out of 15" Issue Resolved

## Problem
HomeScreen was showing "12 out of 15 places" because 3 places were being filtered out by the default radius filter.

## Root Cause
- **Default radius filter**: 5000 meters (5km)
- **Total places in database**: 15
- **Places within 5km**: 12
- **Places filtered out (too far)**: 3

The app was automatically hiding places that were more than 5km away from your current location.

## Solution Applied

### Changed Default Radius Filter
**Before**:
```typescript
radius: 5000  // Only show places within 5km
```

**After**:
```typescript
radius: null  // Show ALL places by default (no distance limit)
```

## What This Means

### ✅ **Now Shows All Places**
- All 15 places from your database will be visible
- No automatic distance filtering
- Users see the complete list of available places

### 🎯 **Users Can Still Filter**
- Tap the filter icon to set a custom radius
- Choose 1km, 5km, 10km, 25km, or 50km
- Filter is optional, not forced

### 📍 **Distance Still Displayed**
- Each place card still shows distance from your location
- Places are sorted by distance (closest first)
- Users can see how far each place is

## Debug Info Display

The header now shows:
```
Showing 15 of 15 places  [Refresh]
```

This helps you understand:
- **First number (15)**: Places currently displayed after filters
- **Second number (15)**: Total places loaded from database
- **Refresh button**: Reload fresh data from Supabase

## When Places Are Hidden

Places will only be hidden if you:
1. **Apply radius filter**: Set a specific distance limit
2. **Search**: Type text that doesn't match place names/cities
3. **Apply other filters**: Type, rating, amenities, etc.

## Console Logs

Watch for these logs to understand filtering:
```
🔍 Applying filters and search to 15 places
🔍 Radius filtered: 15 → 12 places
📏 Place Name: 8500m > 5000m (filtered out)
```

## Benefits

✅ **See all available places** - No hidden places by default
✅ **User choice** - Let users decide what distance they want
✅ **Better discovery** - Users can find places they didn't know existed
✅ **Transparent** - Debug info shows exactly what's happening
✅ **Flexible** - Easy to apply filters when needed

## Alternative Configurations

If you want to change the default behavior:

### Show places within 10km:
```typescript
radius: 10000  // 10km default
```

### Show places within 25km:
```typescript
radius: 25000  // 25km default
```

### Show places within 50km:
```typescript
radius: 50000  // 50km default
```

The current setting (null) shows all places regardless of distance, giving users maximum visibility and control!