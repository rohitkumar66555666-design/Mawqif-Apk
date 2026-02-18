# Fix Image Loading Issue - Step by Step

## Problem: Images uploaded to Supabase but not showing in app

From your screenshot, I can see "Image unavailable" placeholders, which means:
1. ✅ Images are uploaded to Supabase
2. ❌ App can't access them (bucket not public or wrong URLs)

---

## **Quick Fix (5 minutes)**

### **Step 1: Make Bucket Public**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select project: `sqsawueagugzcgpbwsyi`

2. **Navigate to Storage**
   - Click "Storage" in left sidebar
   - Click on "place-images" bucket

3. **Make Bucket Public**
   - Click the settings icon (⚙️) or three dots menu
   - Click "Edit bucket"
   - **✓ Check "Public bucket"**
   - Click "Save"

### **Step 2: Run SQL Fix**

Copy and paste this into SQL Editor:

```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'place-images';

-- Create public access policy
DROP POLICY IF EXISTS "Public Access for Images" ON storage.objects;
CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Grant public access
GRANT SELECT ON storage.objects TO anon;

-- Fix image URLs to public format
UPDATE places 
SET photo = REPLACE(
    photo, 
    '/storage/v1/object/place-images/', 
    '/storage/v1/object/public/place-images/'
)
WHERE photo IS NOT NULL 
AND photo NOT LIKE '%/public/%'
AND photo LIKE '%/object/place-images/%';

-- Verify fix
SELECT 
    title,
    photo,
    CASE 
        WHEN photo LIKE '%/public/%' THEN '✅ Fixed'
        ELSE '❌ Still broken'
    END as status
FROM places
WHERE photo IS NOT NULL
LIMIT 5;
```

### **Step 3: Test in Browser**

1. Copy any image URL from the SQL result
2. Paste in browser
3. **Should show the image** (not 403 Forbidden)

### **Step 4: Test in App**

1. Open your app
2. Tap the blue "Supabase" button in HomeScreen
3. Should show: "Bucket public: Yes ✓"
4. Tap "Refresh" button
5. **Images should now load!** ✅

---

## **What Was Wrong**

### **Most Likely Issues:**

1. **Bucket Not Public** ❌
   - Images uploaded but bucket was private
   - App gets 403 Forbidden errors
   - **Fix:** Make bucket public

2. **Wrong URL Format** ❌
   - URLs missing `/public/` in path
   - Private URLs: `...object/place-images/file.jpg`
   - Public URLs: `...object/public/place-images/file.jpg`
   - **Fix:** Update URLs in database

3. **Missing RLS Policies** ❌
   - Row Level Security blocking access
   - **Fix:** Create public read policy

---

## **Verify Your Fix**

### **Good URLs (Should Work):**
```
https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/filename.jpg
                                                              ^^^^^^
                                                              Has /public/
```

### **Bad URLs (Won't Work):**
```
https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/place-images/filename.jpg
                                                           ^^^^^^^^^^^^
                                                           Missing /public/
```

---

## **Test Commands**

### **Check Bucket Status:**
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'place-images';
-- Should show: public = true
```

### **Check Image URLs:**
```sql
SELECT title, photo FROM places WHERE photo IS NOT NULL LIMIT 3;
-- URLs should contain '/public/'
```

### **Test Image Access:**
```sql
SELECT name FROM storage.objects WHERE bucket_id = 'place-images' LIMIT 1;
-- Copy the name and test: https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/[NAME]
```

---

## **Advanced Debugging**

### **Use App Debug Tools:**

1. **Supabase Button** (Blue) - Tests storage config
   - Should show "Bucket public: Yes ✓"
   - If shows "No ✗" → Bucket not public

2. **Images Button** (Red) - Tests image URLs
   - Check console for detailed errors
   - Look for 403 Forbidden errors

3. **Refresh Button** (Green) - Reload data
   - Clears cache and fetches fresh data

---

## **Common Error Messages**

### **In Console Logs:**
```
❌ Image failed to load: 403 Forbidden
→ Bucket not public

❌ Image failed to load: Network error  
→ URL format wrong

✅ Image loaded successfully
→ Everything working
```

### **In Supabase Button:**
```
❌ Bucket public: No ✗
→ Need to make bucket public

✅ Bucket public: Yes ✓
→ Configuration correct
```

---

## **Prevention for Future**

### **When Uploading Images:**

1. ✅ Always make bucket public first
2. ✅ Use `getPublicUrl()` method
3. ✅ Test URLs in browser before saving
4. ✅ Verify URLs contain `/public/`

### **Correct Upload Code:**
```typescript
// In image-upload.service.ts
const { data: urlData } = supabase.storage
  .from('place-images')
  .getPublicUrl(fileName);

// This returns: https://[project].supabase.co/storage/v1/object/public/place-images/[file]
//                                                                      ^^^^^^
//                                                                      Must have /public/
```

---

## **Still Not Working?**

### **Check These:**

1. **Supabase Project Status**
   - Dashboard → Settings → General
   - Ensure project not paused

2. **Network Issues**
   - Try different WiFi/mobile data
   - Disable VPN
   - Check firewall settings

3. **Device Issues**
   - Check device date/time
   - Clear app cache
   - Restart app

4. **Image Files**
   - Verify images actually exist in storage
   - Check file formats (JPG, PNG, WebP)
   - Ensure files not corrupted

---

## **Success Checklist**

- [ ] Bucket "place-images" exists
- [ ] Bucket is marked as "Public" ✓
- [ ] RLS policy allows public SELECT
- [ ] Image URLs contain `/public/` path
- [ ] Test URL loads in browser
- [ ] Supabase button shows "Bucket public: Yes ✓"
- [ ] Images show in app ✅

---

## **Quick Reference**

**Your Supabase Project:** `sqsawueagugzcgpbwsyi`

**Correct URL Format:**
```
https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/[filename]
```

**Test URL (should return 404, not 403):**
```
https://sqsawueagugzcgpbwsyi.supabase.co/storage/v1/object/public/place-images/test.jpg
```

**Run the SQL fix above and your images should work immediately!** 🎯