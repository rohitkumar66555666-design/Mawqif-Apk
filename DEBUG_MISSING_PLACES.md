# Debug Guide: Missing Places in HomeScreen

## Issue
Places added through the app appear in Supabase database but don't show in the HomeScreen.

## Potential Causes & Solutions

### 1. **Database Schema Missing Address Column**
**Problem**: The app expects an `address` column but it might not exist in your Supabase table.

**Solution**: Run the SQL file `ADD_ADDRESS_COLUMN.sql` in your Supabase SQL editor:
```sql
-- Add address column to places table
ALTER TABLE places 
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';

-- Update existing places with placeholder address
UPDATE places 
SET address = CONCAT(city, ', India') 
WHERE address = '' OR address IS NULL;
```

### 2. **Caching Issue**
**Problem**: HomeScreen caches data and doesn't reload fresh data from Supabase.

**Solution**: 
- Pull down to refresh the HomeScreen
- Or tap the new "Refresh" button in the header
- Or restart the app completely

### 3. **Distance/Radius Filtering**
**Problem**: New place might be outside the current radius filter (default 5km).

**Solution**:
- Check the distance from your current location to the new place
- Increase the radius filter in the filter modal
- Or temporarily disable radius filtering

### 4. **Missing Required Fields**
**Problem**: Place might be missing required fields like latitude, longitude, or other data.

**Solution**: Check in Supabase that your place has:
- `latitude` and `longitude` (numbers)
- `title` (text)
- `city` (text)
- `type` (text)
- `address` (text) - newly added

### 5. **Location Permission Issues**
**Problem**: App can't calculate distances without location access.

**Solution**:
- Ensure location permission is granted
- Check that GPS is enabled
- Try refreshing location in the app

## Quick Debug Steps

1. **Check Supabase Data**:
   - Open your Supabase dashboard
   - Go to Table Editor → places
   - Verify your new place exists with all required fields

2. **Add Address Column** (if missing):
   - Go to Supabase SQL Editor
   - Run the `ADD_ADDRESS_COLUMN.sql` file

3. **Force Refresh in App**:
   - Pull down on HomeScreen to refresh
   - Or tap the "Refresh" button in the header
   - Check the debug info showing "X of Y places"

4. **Check Filters**:
   - Tap the filter icon
   - Ensure radius is large enough (try 50km)
   - Clear any other filters that might hide your place

5. **Check Console Logs**:
   - Look for logs like:
     - "Fetched X places from Supabase"
     - "Calculated distances for X places"
     - "Filtered to X places within Xkm"

## Expected Behavior After Fixes

- HomeScreen should show: "Showing X of Y places" 
- New places should appear immediately after refresh
- Distance should be calculated and displayed correctly
- All places within the radius filter should be visible

## If Still Not Working

1. Check that the place has valid latitude/longitude coordinates
2. Verify the place type matches one of the expected types
3. Ensure no search text is filtering out the place
4. Try adding the place again with all required fields