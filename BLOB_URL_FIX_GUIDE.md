# 🔧 Blob URL Fix Guide

## Problem: "Unsupported uri scheme! Uri is: blob:"

The error occurs because some places in your database have temporary `blob:` URLs instead of permanent Supabase URLs.

## 🎯 Root Cause

When testing image uploads, some places got saved with temporary local URLs like:
- `blob:http://localhost:8081/7c9588ae-cbdc-43a0-9141-2948873a582e`

These URLs only work during the current session and break when the app restarts.

## ✅ Quick Fix

### Step 1: Clean Database
Run this SQL in Supabase Dashboard:

```sql
-- Remove all blob URLs
UPDATE places 
SET photo = NULL
WHERE photo LIKE 'blob:%'
   OR photo LIKE 'file://%'
   OR photo LIKE 'content://%';

-- Check results
SELECT title, photo FROM places WHERE photo IS NOT NULL;
```

### Step 2: Re-upload Images
1. **Go to places** that show "Image unavailable"
2. **Edit them** (if you have edit functionality)
3. **Or delete and recreate** with new images
4. **New uploads will get proper Supabase URLs** like:
   `https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/...`

## 🔍 How to Identify the Issue

### Bad URLs (cause errors):
- ❌ `blob:http://localhost:8081/...`
- ❌ `file:///path/to/image.jpg`
- ❌ `content://media/external/...`

### Good URLs (work correctly):
- ✅ `https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/...`
- ✅ `null` (shows placeholder)

## 🚀 Prevention

The issue happened during development/testing. Now that the upload system is fixed:

1. ✅ **New uploads** get proper Supabase URLs
2. ✅ **PlaceCard component** validates URLs
3. ✅ **Invalid URLs** are ignored (show placeholder)

## 🎯 Expected Behavior After Fix

### Before Fix:
```
ERROR ❌ Image failed to load for xyz: Unsupported uri scheme! Uri is: blob:...
```

### After Fix:
- ✅ **Valid images** display correctly
- ✅ **Invalid URLs** show placeholder gracefully
- ✅ **New uploads** work perfectly

## 🔧 Manual Cleanup (Alternative)

If you want to keep the places but just fix the images:

1. **Note down** which places have blob URLs
2. **Run the cleanup SQL**
3. **Go to each place** in your app
4. **Add new photos** - they'll get proper Supabase URLs

Your prayer place finder will work perfectly after this cleanup! 🕌📷