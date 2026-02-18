# 🔧 Manual Storage Setup Guide

Since you're getting permission errors with SQL, let's set up storage through the Supabase UI instead.

## Step 1: Run Safe SQL Script

**Copy and paste this into Supabase SQL Editor:**

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

## Step 2: Create Storage Bucket Manually

### 2.1 Go to Storage Section
1. In your Supabase dashboard
2. Click **"Storage"** in the left sidebar
3. Click **"Create a new bucket"**

### 2.2 Create Bucket
- **Name:** `place-images`
- **Public bucket:** ✅ **CHECK THIS BOX** (very important!)
- **File size limit:** `50 MB`
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`
- Click **"Create bucket"**

### 2.3 Set Bucket Policies
1. Click on your `place-images` bucket
2. Click **"Policies"** tab
3. Click **"Add policy"**

**Create these 2 policies:**

#### Policy 1: Public Read Access
- **Policy name:** `Public can view images`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **Policy definition:** 
```sql
bucket_id = 'place-images'
```

#### Policy 2: Authenticated Upload
- **Policy name:** `Authenticated can upload`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **Policy definition:**
```sql
bucket_id = 'place-images'
```

## Step 3: Test the Setup

### 3.1 Verify Bucket
1. Go to Storage → place-images
2. Should show "Public bucket" badge
3. Should allow file uploads

### 3.2 Test Your App
1. Open your prayer app
2. Go to "Add Prayer Space"
3. Try uploading an image
4. Should work without "Failed to read image file" error

## Step 4: Verify Results

Run this in SQL Editor to check:
```sql
-- Check bucket exists and is public
SELECT 
    id,
    name,
    public,
    CASE 
        WHEN public = true THEN '✅ Bucket is public - images will show'
        ELSE '❌ Bucket is private - images will NOT show'
    END as status
FROM storage.buckets
WHERE id = 'place-images';

-- Check no more hardcoded URLs
SELECT 
    COUNT(*) as total_places,
    COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) as bing_urls_remaining,
    CASE 
        WHEN COUNT(CASE WHEN photo LIKE '%bing.net%' THEN 1 END) = 0 
        THEN '✅ All hardcoded URLs removed'
        ELSE '❌ Some hardcoded URLs still exist'
    END as cleanup_status
FROM places;
```

## Expected Results After Setup

✅ **Database:** No more hardcoded Bing URLs
✅ **Storage:** `place-images` bucket exists and is public
✅ **Policies:** Public can view, authenticated can upload
✅ **App:** Image upload works without errors
✅ **Display:** Place cards show actual uploaded images

## Troubleshooting

### If bucket creation fails:
- Make sure you're the project owner
- Try refreshing the page
- Check your Supabase plan limits

### If policies don't work:
- Make sure bucket is marked as "Public"
- Verify policy definitions are exact
- Try deleting and recreating policies

### If app still shows errors:
- Clear app cache/restart
- Check internet connection
- Try uploading a different image

This manual approach should work even with permission restrictions! 🕌