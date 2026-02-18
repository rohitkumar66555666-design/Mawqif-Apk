# 🚀 Simple Setup Steps - No SQL Errors

Your Supabase project doesn't have storage enabled yet. Here's the simple fix:

## Step 1: Clean Database Only

**Copy and paste this safe SQL:**

```sql
-- Clean up hardcoded URLs only
UPDATE places 
SET photo = NULL
WHERE photo LIKE '%bing.net%'
   OR photo LIKE '%tse2.mm.bing.net%'
   OR photo LIKE '%OIP.CFIXqi76j82ev1hH_9hs7AHaE%'
   OR photo = 'https://tse2.mm.bing.net/th/id/OIP.CFIXqi76j82ev1hH_9hs7AHaE-?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3';

-- Check results
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) as remaining_bing_urls
FROM places;
```

## Step 2: Enable Storage in Supabase

### 2.1 Go to Storage
1. In your Supabase dashboard
2. Click **"Storage"** in the left sidebar
3. If you see "Storage is not enabled", click **"Enable Storage"**

### 2.2 Create Bucket
1. Click **"Create a new bucket"**
2. **Name:** `place-images`
3. **Public bucket:** ✅ **MUST CHECK THIS!**
4. Click **"Create bucket"**

### 2.3 Set Simple Policy
1. Click on your `place-images` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"For full customization"**
5. **Policy name:** `Allow public access`
6. **SQL:** 
```sql
(bucket_id = 'place-images')
```
7. **Check all boxes:** SELECT, INSERT, UPDATE, DELETE
8. **Target roles:** Leave as `public`
9. Click **"Save policy"**

## Step 3: Test Your App

1. Open your prayer app
2. Go to "Add Prayer Space"
3. Fill the form and try uploading an image
4. Should work without errors now!

## What This Fixes

✅ **Removes** all hardcoded Bing URLs from database
✅ **Enables** storage in your Supabase project  
✅ **Creates** public bucket for images
✅ **Allows** users to upload and view images
✅ **Fixes** "Failed to read image file" error

## If Storage is Already Enabled

If you already see buckets in Storage section:
1. Just run the database cleanup SQL
2. Make sure `place-images` bucket exists and is **PUBLIC**
3. Test uploading in your app

## Expected Result

After setup:
- No more hardcoded URLs in database
- Images upload successfully 
- Place cards show actual uploaded photos
- Your prayer app works as intended! 🕌

This simple approach avoids all SQL permission errors!