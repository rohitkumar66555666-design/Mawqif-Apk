# Supabase Storage Setup Guide - Fix Image Loading Issues

## Problem: Images not loading due to Supabase storage configuration

---

## **Quick Fix (5 minutes)**

### **Option 1: Using Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `sqsawueagugzcgpbwsyi`

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Look for "place-images" bucket

3. **Check if Bucket Exists**
   
   **If bucket DOES NOT exist:**
   - Click "New bucket" button
   - Name: `place-images`
   - **✓ Check "Public bucket"** (VERY IMPORTANT!)
   - Click "Create bucket"
   
   **If bucket EXISTS:**
   - Click on "place-images" bucket
   - Click the settings icon (⚙️) or three dots menu
   - Click "Edit bucket"
   - **✓ Ensure "Public bucket" is checked**
   - Click "Save"

4. **Set Bucket Policies**
   - Click on "place-images" bucket
   - Go to "Policies" tab
   - Click "New Policy"
   - Select "For full customization"
   - Add this policy:
   
   ```sql
   Policy name: Public read access
   Target roles: public
   Policy command: SELECT
   USING expression: true
   ```
   
   - Click "Review" then "Save policy"

5. **Test the Configuration**
   - Upload a test image to the bucket
   - Click on the image
   - Click "Copy URL"
   - Paste URL in browser
   - **If image loads → Success! ✓**
   - **If you get 403 Forbidden → Bucket is not public ✗**

---

### **Option 2: Using SQL Editor (Advanced)**

1. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

2. **Run the Setup Script**
   - Copy the entire content from `SUPABASE_IMAGE_STORAGE_FIX.sql`
   - Paste into SQL editor
   - Click "Run" or press Ctrl+Enter

3. **Verify Results**
   - Check the output shows:
     ```
     public: true  ✓
     ```
   - If it shows `public: false`, the bucket is private

---

## **Verify Your Setup**

### **Test 1: Check Bucket is Public**

Run this query in SQL Editor:
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'place-images';
```

**Expected Result:**
```
id: place-images
name: place-images
public: true  ← MUST BE TRUE!
```

### **Test 2: Check Image URLs**

Run this query:
```sql
SELECT 
  title,
  photo,
  CASE 
    WHEN photo LIKE '%/public/%' THEN '✓ Public URL'
    ELSE '✗ Private URL'
  END as status
FROM places
WHERE photo IS NOT NULL
LIMIT 5;
```

**Expected Result:**
All URLs should show "✓ Public URL"

**Correct URL format:**
```
https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/filename.jpg
                                                              ^^^^^^
                                                              Must have /public/
```

**Wrong URL format:**
```
https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/place-images/filename.jpg
                                                           ^^^^^^^^^^^^
                                                           Missing /public/
```

### **Test 3: Browser Test**

1. Copy any image URL from your database
2. Paste in browser (incognito/private mode)
3. **If image loads → Configuration is correct ✓**
4. **If 403 Forbidden → Bucket is not public ✗**
5. **If 404 Not Found → Image doesn't exist (but config is OK)**

---

## **Common Issues & Solutions**

### **Issue 1: Bucket is Private**

**Symptoms:**
- Images return 403 Forbidden
- URLs don't contain `/public/`
- Browser can't load images

**Solution:**
1. Go to Storage → place-images
2. Click settings (⚙️)
3. Check "Public bucket"
4. Save

### **Issue 2: RLS Policies Blocking Access**

**Symptoms:**
- Bucket is public but images still don't load
- 403 errors in console

**Solution:**
Run this in SQL Editor:
```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'place-images');
```

### **Issue 3: Wrong Image URLs in Database**

**Symptoms:**
- URLs don't have `/public/` in path
- Old images uploaded before bucket was public

**Solution:**
You need to re-upload images OR manually fix URLs:

```sql
-- Check current URLs
SELECT id, title, photo FROM places WHERE photo IS NOT NULL;

-- If URLs are wrong, you'll need to re-upload images
-- The app will automatically use correct URLs for new uploads
```

### **Issue 4: CORS Issues**

**Symptoms:**
- Images load in browser but not in app
- CORS errors in console

**Solution:**
1. Go to Storage → place-images → Configuration
2. Add CORS policy:
   ```json
   {
     "allowedOrigins": ["*"],
     "allowedMethods": ["GET", "HEAD"],
     "allowedHeaders": ["*"],
     "maxAge": 3600
   }
   ```

---

## **Complete Setup Checklist**

- [ ] Bucket "place-images" exists
- [ ] Bucket is marked as "Public"
- [ ] RLS policy allows public SELECT
- [ ] Test image URL loads in browser
- [ ] Image URLs contain `/public/` in path
- [ ] App can load images (test with Debug button)

---

## **Testing in Your App**

1. **Open the app**
2. **Go to HomeScreen**
3. **Tap the red "Debug" button**
4. **Check console logs:**

   **Good logs:**
   ```
   ✅ Image loaded successfully for: [Place Name]
   🔗 URL: https://...supabase.co/storage/v1/object/public/place-images/...
   ```

   **Bad logs:**
   ```
   ❌ Image failed to load for: [Place Name]
   ❌ Error: 403 Forbidden
   🔗 URL: https://...supabase.co/storage/v1/object/place-images/...
                                                    ^^^^^^^^^^^^
                                                    Missing /public/
   ```

---

## **Re-uploading Images (if needed)**

If your existing images have wrong URLs:

1. **Delete old images:**
   - Go to Storage → place-images
   - Select all images
   - Click Delete

2. **Re-add places with images:**
   - Use the app's "Add Place" feature
   - Upload new images
   - New images will have correct public URLs

3. **Or update existing places:**
   - Edit each place
   - Re-upload the image
   - Save

---

## **Verify Image Upload Service**

Check if your image upload service is using correct URLs:

```typescript
// In src/services/image-upload.service.ts
// The getPublicUrl should return URLs with /public/

const { data: urlData } = supabase.storage
  .from('place-images')
  .getPublicUrl(fileName);

// This should return:
// https://[project].supabase.co/storage/v1/object/public/place-images/[file]
//                                                  ^^^^^^
//                                                  Must have /public/
```

---

## **Still Not Working?**

1. **Check Supabase Project Status:**
   - Go to Dashboard → Settings → General
   - Ensure project is not paused
   - Check if there are any service issues

2. **Check API Keys:**
   - Settings → API
   - Copy "anon public" key
   - Verify it matches your app.json configuration

3. **Check Network:**
   - Try on different network (WiFi vs Mobile data)
   - Disable VPN
   - Check firewall settings

4. **Contact Supabase Support:**
   - If bucket is public but images still don't load
   - Provide project ID and bucket name
   - Share example image URL

---

## **Prevention for Future**

Always ensure when creating storage buckets:
1. ✓ Check "Public bucket" during creation
2. ✓ Set up RLS policies for public read access
3. ✓ Test with browser before using in app
4. ✓ Verify URLs contain `/public/` path

---

## **Quick Reference**

**Your Supabase Project:**
- Project ID: `sqsawueagugzcgpbwsyi`
- Project URL: `https://sqsawueagugzcgpbwsyi.supabase.co`

**Storage Bucket:**
- Name: `place-images`
- Must be: Public ✓
- URL format: `https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/[filename]`

**Test URL:**
```
https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/test.jpg
```
- Should return 404 (file not found) - OK
- Should NOT return 403 (forbidden) - NOT OK
