# 🔍 Debug Reviews Issue - Step by Step

## 🚨 Current Issue
You're getting an error when trying to add reviews. Let's debug this step by step.

## 📋 Debugging Steps

### Step 1: Check Database Tables
1. Go to your **Supabase Dashboard**
2. Click **"Table Editor"** in the left sidebar
3. **Verify these tables exist:**
   - ✅ `places` table
   - ✅ `reviews` table
   - ✅ `review_replies` table
   - ✅ `review_likes` table
   - ✅ `reply_likes` table
   - ✅ `review_reports` table

### Step 2: Check Console Logs
1. **Open your app**
2. **Open React Native debugger or console**
3. **Try to add a review**
4. **Look for these logs:**
   - 🔄 Adding review: {placeId, currentUserId, rating, comment}
   - 📝 Inserting review data: {...}
   - ❌ Any error messages

### Step 3: Common Issues & Solutions

#### Issue 1: Tables Don't Exist
**Error:** `relation "reviews" does not exist`
**Solution:** Run the SQL setup file in Supabase

#### Issue 2: Foreign Key Constraint
**Error:** `violates foreign key constraint`
**Solution:** The `place_id` doesn't exist in places table
- Check if the place exists: `SELECT * FROM places WHERE id = 'your-place-id'`

#### Issue 3: RLS Policy Issue
**Error:** `new row violates row-level security policy`
**Solution:** Check RLS policies are set correctly

#### Issue 4: Column Type Mismatch
**Error:** `column "place_id" is of type uuid but expression is of type text`
**Solution:** Place ID format mismatch

## 🔧 Quick Fixes

### Fix 1: Verify Place Exists
Run this in Supabase SQL Editor:
```sql
-- Check if places table has data
SELECT id, title FROM places LIMIT 5;
```

### Fix 2: Check Reviews Table Structure
```sql
-- Check reviews table structure
\d reviews;
```

### Fix 3: Test Manual Insert
```sql
-- Try manual insert (replace with real place_id)
INSERT INTO reviews (place_id, user_id, user_name, rating, comment) 
VALUES ('your-place-id-here', 'test-user', 'Test User', 5, 'Test review');
```

## 📱 What to Check in App

1. **Console Logs:** Look for the detailed error messages I added
2. **Place ID:** Make sure the place ID is valid
3. **Network:** Check if you have internet connection
4. **Supabase Config:** Verify your Supabase URL and key are correct

## 🆘 If Still Not Working

**Send me these details:**
1. **Console error message** (the full error)
2. **Place ID** you're trying to review
3. **Database tables** - screenshot of your Supabase table editor
4. **SQL execution result** - did the setup SQL run successfully?

The detailed logging I added will help us identify exactly what's going wrong! 🕵️‍♂️