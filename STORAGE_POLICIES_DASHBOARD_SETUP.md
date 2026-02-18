# 🗂️ SUPABASE STORAGE POLICIES SETUP GUIDE

Since the SQL approach for storage policies isn't working, we need to set them up through the Supabase Dashboard UI.

## 📋 STEP-BY-STEP SETUP

### Step 1: Run SQL for Bucket Setup
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Run the `SETUP_STORAGE_BUCKET_ONLY.sql` file
4. Verify the bucket `place-images` exists and is public

### Step 2: Configure Storage Policies via Dashboard

1. **Go to Storage Section**
   - Click **Storage** in the left sidebar
   - Click on the **place-images** bucket
   - Click the **Policies** tab

2. **Create Policy 1: Upload Profile Images**
   - Click **New Policy**
   - Choose **Custom** policy
   - **Policy Name**: `Allow authenticated users to upload profile images`
   - **Allowed Operation**: `INSERT`
   - **Target Roles**: `authenticated`
   - **Policy Definition**:
     ```sql
     bucket_id = 'place-images' AND (storage.foldername(name))[1] = 'profiles'
     ```
   - **Check Expression**: (same as above)
   - Click **Save**

3. **Create Policy 2: Update Profile Images**
   - Click **New Policy**
   - Choose **Custom** policy
   - **Policy Name**: `Allow users to update their own profile images`
   - **Allowed Operation**: `UPDATE`
   - **Target Roles**: `authenticated`
   - **Policy Definition**:
     ```sql
     bucket_id = 'place-images' AND (storage.foldername(name))[1] = 'profiles'
     ```
   - **Check Expression**: (same as above)
   - Click **Save**

4. **Create Policy 3: Delete Profile Images**
   - Click **New Policy**
   - Choose **Custom** policy
   - **Policy Name**: `Allow users to delete their own profile images`
   - **Allowed Operation**: `DELETE`
   - **Target Roles**: `authenticated`
   - **Policy Definition**:
     ```sql
     bucket_id = 'place-images' AND (storage.foldername(name))[1] = 'profiles'
     ```
   - Click **Save**

5. **Create Policy 4: Public Read Access**
   - Click **New Policy**
   - Choose **Custom** policy
   - **Policy Name**: `Allow public read access to profile images`
   - **Allowed Operation**: `SELECT`
   - **Target Roles**: `public`
   - **Policy Definition**:
     ```sql
     bucket_id = 'place-images' AND (storage.foldername(name))[1] = 'profiles'
     ```
   - Click **Save**

## ✅ VERIFICATION

After setting up the policies, you should see:
- 4 policies in the **Policies** tab of your `place-images` bucket
- Each policy targeting the `profiles` subfolder
- Mix of `authenticated` and `public` roles

## 🧪 TEST THE SETUP

1. **Test Profile Image Upload**:
   - Open your app
   - Go to Profile screen
   - Try uploading a profile image
   - Should work without "Failed to read image file" errors

2. **Check Storage Dashboard**:
   - Go to Storage > place-images
   - Should see a `profiles/` folder
   - Should see uploaded profile images

## 🔧 ALTERNATIVE: SIMPLIFIED APPROACH

If the above policies are too complex, you can use simpler policies:

### Simple Policy 1: Authenticated Upload/Update/Delete
```sql
bucket_id = 'place-images' AND auth.role() = 'authenticated'
```

### Simple Policy 2: Public Read
```sql
bucket_id = 'place-images'
```

This allows:
- ✅ Authenticated users to upload/update/delete any image
- ✅ Public access to read all images
- ✅ Profile images will work in reviews

## 🚨 TROUBLESHOOTING

### If Upload Still Fails:
1. **Check Bucket Public Setting**:
   - Storage > place-images > Settings
   - Ensure "Public bucket" is enabled

2. **Check Policies**:
   - Make sure at least one INSERT policy exists for authenticated users
   - Make sure at least one SELECT policy exists for public access

3. **Test with Simple Policies**:
   - Remove complex folder-based policies
   - Use the simplified approach above

4. **Check Console Logs**:
   - Look for specific error messages in app console
   - Common issues: permission denied, bucket not found

## 📞 SUPPORT

If you continue having issues:
1. Share the exact error message from the app console
2. Check if the bucket appears in Storage dashboard
3. Verify policies are listed in the Policies tab
4. Try uploading a test file directly in Supabase Storage dashboard

---

**Status**: Manual Setup Required via Dashboard
**Estimated Time**: 5-10 minutes
**Difficulty**: Beginner-friendly