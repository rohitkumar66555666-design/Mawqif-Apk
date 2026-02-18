# 🚨 QUICK FIX: Images Not Loading

## **Most Likely Issue: Supabase Bucket Not Public**

### **5-Minute Fix:**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select project: `sqsawueagugzcgpbwsyi`

2. **Go to Storage**
   - Click "Storage" in left sidebar

3. **Make Bucket Public**
   - Click on "place-images" bucket
   - Click settings icon (⚙️)
   - **✓ Check "Public bucket"**
   - Click "Save"

4. **Test in App**
   - Open your app
   - Tap blue "Supabase" button in HomeScreen
   - Should show: "Bucket public: Yes ✓"

---

## **Test in App (New Feature!)**

Your app now has 3 debug buttons in HomeScreen:

1. **🔵 Supabase** - Tests Supabase storage configuration
   - Shows if bucket exists
   - Shows if bucket is public
   - Shows any configuration issues

2. **🔴 Images** - Tests image URLs
   - Validates image URLs
   - Tests if images are accessible
   - Shows detailed error messages

3. **🟢 Refresh** - Reloads all places
   - Clears cache
   - Fetches fresh data

---

## **Expected Results:**

### **✅ Good Configuration:**
```
Supabase Storage Test:

✓ Bucket exists: Yes
✓ Bucket public: Yes ✓
✓ Can read: Yes

✅ Configuration looks good!
```

### **❌ Bad Configuration:**
```
Supabase Storage Test:

✓ Bucket exists: Yes
✓ Bucket public: No ✗
✓ Can read: Yes

Issues found:
• ❌ Bucket is NOT public - images will not load!

See SUPABASE_STORAGE_SETUP_GUIDE.md for fixes
```

---

## **If Bucket is Not Public:**

### **Option A: Dashboard (Easiest)**
1. Storage → place-images → Settings
2. Check "Public bucket"
3. Save

### **Option B: SQL (Advanced)**
Run in SQL Editor:
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'place-images';
```

---

## **Verify Fix:**

1. Tap "Supabase" button again
2. Should now show "Bucket public: Yes ✓"
3. Tap "Refresh" to reload places
4. Images should now load!

---

## **Still Not Working?**

Check these files for detailed guides:
- `SUPABASE_STORAGE_SETUP_GUIDE.md` - Complete setup guide
- `SUPABASE_IMAGE_STORAGE_FIX.sql` - SQL scripts
- `IMAGE_LOADING_TROUBLESHOOTING.md` - Device-specific issues

---

## **Quick Checklist:**

- [ ] Bucket "place-images" exists
- [ ] Bucket is marked as "Public" ✓
- [ ] Supabase button shows "Bucket public: Yes ✓"
- [ ] Test image URL in browser loads
- [ ] Images show in app

---

## **Common Mistakes:**

❌ Bucket exists but not public
❌ RLS policies blocking access
❌ Wrong image URLs (missing /public/)
❌ Device date/time incorrect
❌ Network blocking Supabase

✅ Make bucket public = Fixes 90% of issues!
