# 🔧 Manual Storage Policy Fix

## Issue: "row-level security policy" Error

The image picker works, but Supabase storage policies are blocking uploads.

## 🚀 Quick Fix Options

### Option 1: Run SQL Script (Recommended)

**Copy and paste `FIX_STORAGE_POLICIES.sql` into Supabase SQL Editor**

### Option 2: Manual Setup Through UI

If SQL gives permission errors, do this manually:

#### Step 1: Check Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Look for `place-images` bucket
3. If it doesn't exist, create it:
   - Name: `place-images`
   - **Public bucket: ✅ CHECK THIS**
   - File size limit: 50MB

#### Step 2: Set Bucket to Public
1. Click on `place-images` bucket
2. Click **Settings** tab
3. Make sure **"Public bucket"** is **ENABLED** ✅

#### Step 3: Create Simple Policies
1. Click **Policies** tab
2. Delete any existing policies
3. Click **"New Policy"**
4. Choose **"For full customization"**

**Create this policy:**
- **Policy name:** `Allow all access`
- **Policy definition:**
```sql
bucket_id = 'place-images'
```
- **Allowed operations:** Check ALL boxes (SELECT, INSERT, UPDATE, DELETE)
- **Target roles:** `public` (or leave default)
- Click **Save**

## 🎯 Alternative: Disable RLS (Quick Fix)

If policies are too complex, temporarily disable RLS:

```sql
-- TEMPORARY: Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** This makes ALL storage public. Only use for testing.

## ✅ Test the Fix

After applying the fix:

1. **Open your app**
2. **Go to "Add Prayer Space"**
3. **Fill the form and add a photo**
4. **Submit**
5. **Should upload successfully** ✅

## 📊 Expected Console Output

After fix:
```
🔄 Uploading to Supabase Storage...
✅ Upload successful to path: place_abc123_1703234567890.jpg
🌐 Public URL generated: https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/place_abc123_1703234567890.jpg
✅ Image upload completed successfully
```

## 🔍 Verify Success

Check these to confirm it's working:

### 1. In Supabase Dashboard
- Go to Storage → place-images
- Should see uploaded image files
- Click on image → should open/preview

### 2. In Your App
- Place cards should show actual uploaded images
- No more "Image unavailable" placeholders

### 3. In Database
```sql
-- Check places have proper Supabase URLs
SELECT title, photo FROM places WHERE photo IS NOT NULL;
```

Should show URLs like:
`https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/...`

## 🆘 If Still Not Working

### Check These:
1. **Bucket is PUBLIC** ✅
2. **Policies allow INSERT** for your role
3. **No conflicting policies** exist
4. **RLS is enabled** on storage.objects

### Try This Debug Query:
```sql
-- Check current policies
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

## 🎯 Root Cause

The error happens because:
1. **RLS is enabled** on storage.objects (good for security)
2. **No policy allows uploads** for your user role
3. **Bucket might be private** instead of public

The fix creates permissive policies that allow uploads while keeping the bucket secure.

Your prayer place images should upload successfully now! 🕌📷