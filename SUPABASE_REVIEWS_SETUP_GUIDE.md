# 🚀 Complete Supabase Reviews System Setup Guide

## 📋 Step-by-Step Instructions

### **Step 1: Set Up Database Tables**

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Sign in to your account
   - Select your project

2. **Run SQL Commands**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**
   - Copy the entire content from `SUPABASE_SETUP.sql`
   - Paste it into the SQL editor
   - Click **"Run"** button

3. **Verify Tables Created**
   - Go to **"Table Editor"** in the left sidebar
   - You should see these new tables:
     - ✅ `reviews`
     - ✅ `review_replies`
     - ✅ `review_likes`
     - ✅ `reply_likes`
     - ✅ `review_reports`

### **Step 2: Update Places Table (Important!)**

Your places table needs to have rating columns. Run this SQL:

```sql
-- Add rating columns to places table if they don't exist
ALTER TABLE places 
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create function to update updated_at column (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### **Step 3: Test the Connection**

1. **Open your app**
2. **Go to any place details**
3. **Try to add a review**
4. **Check if it appears in Supabase**

### **Step 4: Verify Data Flow**

Check these features work:
- ✅ **Add Review** - Creates new review with rating
- ✅ **Like/Dislike** - Updates counts in real-time
- ✅ **Add Reply** - Creates reply and updates reply count
- ✅ **Report Review** - Saves report to database
- ✅ **Sort Reviews** - Shows newest, oldest, most liked

## 🔧 Database Schema Overview

### **Reviews Table**
```sql
reviews (
  id UUID PRIMARY KEY,
  place_id UUID REFERENCES places(id),
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  rating INTEGER (1-5),
  comment TEXT,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Review Replies Table**
```sql
review_replies (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id),
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  comment TEXT,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### **Review Likes Table**
```sql
review_likes (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id),
  user_id VARCHAR(255),
  is_like BOOLEAN, -- true = like, false = dislike
  created_at TIMESTAMP,
  UNIQUE(review_id, user_id) -- One vote per user
)
```

### **Reply Likes Table**
```sql
reply_likes (
  id UUID PRIMARY KEY,
  reply_id UUID REFERENCES review_replies(id),
  user_id VARCHAR(255),
  is_like BOOLEAN, -- true = like, false = dislike
  created_at TIMESTAMP,
  UNIQUE(reply_id, user_id) -- One vote per user
)
```

### **Review Reports Table**
```sql
review_reports (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id),
  user_id VARCHAR(255),
  reason VARCHAR(100),
  created_at TIMESTAMP
)
```

## 🎯 Features Included

### **✅ Complete Review System**
- Add reviews with 1-5 star ratings
- View all reviews for a place
- Sort by newest, oldest, most liked
- Real-time like/dislike counts

### **✅ Reply System**
- Reply to any review
- Owner badges for place owners
- Nested conversation threads
- Like/dislike replies

### **✅ Moderation System**
- Report inappropriate reviews
- Multiple report categories
- Admin review system
- User-friendly reporting interface

### **✅ Real-time Updates**
- Automatic count updates
- Place rating calculations
- Live interaction feedback
- Optimistic UI updates

## 🚨 Troubleshooting

### **If you get PGRST200 errors:**
1. Make sure you ran the SQL setup
2. Check table names match exactly
3. Verify your Supabase URL and key are correct

### **If reviews don't appear:**
1. Check the browser console for errors
2. Verify place_id exists in places table
3. Make sure RLS policies allow access

### **If likes don't work:**
1. Check user_id is being passed correctly
2. Verify review_likes table exists
3. Check for unique constraint violations

## 🎉 You're All Set!

Once you complete these steps, your reviews system will be fully functional with:
- ✅ Real database storage
- ✅ Like/dislike functionality
- ✅ Reply system
- ✅ Report system
- ✅ Automatic rating calculations
- ✅ Professional UI

Your app now has a complete, production-ready reviews system! 🚀