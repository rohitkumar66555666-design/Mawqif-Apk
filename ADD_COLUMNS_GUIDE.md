# Add Missing Columns to Places Table

## **Quick Fix (5 minutes)**

### **Step 1: Open Supabase SQL Editor**
1. Go to https://supabase.com/dashboard
2. Select your project: `sqsawueagugzcgpbwsyi`
3. Click "SQL Editor" in the left sidebar
4. Click "New query"

### **Step 2: Run the Simple Script**
Copy and paste this into the SQL editor:

```sql
-- Add the essential missing columns
ALTER TABLE places ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;
ALTER TABLE places ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE places ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Update existing records with default values
UPDATE places 
SET 
  is_open = true,
  avg_rating = 0.0,
  review_count = 0
WHERE is_open IS NULL OR avg_rating IS NULL OR review_count IS NULL;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'places' 
ORDER BY ordinal_position;
```

### **Step 3: Click "Run" or press Ctrl+Enter**

### **Step 4: Verify Success**
You should see output showing all columns including:
- `contact_phone` (text)
- `whatsapp_number` (text)
- `address` (text)
- `is_open` (boolean)
- `avg_rating` (numeric)
- `review_count` (integer)

---

## **What These Columns Do**

### **contact_phone**
- Stores phone number for calling the place
- Format: `+91 9876543210`
- Used in PlaceDetailScreen for "Call" button

### **whatsapp_number**
- Stores WhatsApp number for messaging
- Format: `+91 9876543210`
- Used in PlaceDetailScreen for "WhatsApp" button

### **address**
- Stores full street address
- Example: `123 Main Street, Andheri West, Mumbai 400058`
- Displayed in PlaceCard and PlaceDetailScreen

### **is_open**
- Boolean for open/closed status
- `true` = Open, `false` = Closed
- Shows "Open Now" or "Closed" badge

### **avg_rating**
- Average rating from reviews (0.0 to 5.0)
- Calculated automatically from reviews
- Displayed as stars in UI

### **review_count**
- Total number of reviews
- Updated automatically when reviews are added/removed
- Displayed as "(5 reviews)" in UI

---

## **Complete Version (Optional)**

If you want all advanced features, use `ADD_MISSING_PLACES_COLUMNS.sql` instead. It includes:

- ✅ All essential columns above
- ✅ `opening_hours` (JSON for flexible hours)
- ✅ `photos` (array for multiple images)
- ✅ `owner_id` (for place ownership)
- ✅ Indexes for performance
- ✅ Validation constraints
- ✅ Row Level Security (RLS)
- ✅ Automatic rating calculations

---

## **Test Your Changes**

After running the SQL:

1. **Test in your app:**
   - Open the app
   - Go to "Add Place" screen
   - Try adding a place with contact info
   - Should work without errors

2. **Check PlaceDetailScreen:**
   - View any place details
   - Should show contact buttons
   - Should show address
   - Should show open/closed status

3. **Verify in Supabase:**
   ```sql
   SELECT * FROM places LIMIT 1;
   ```
   Should show all new columns

---

## **If You Get Errors**

### **Error: "column already exists"**
- This is OK! It means the column was already there
- The `IF NOT EXISTS` prevents errors

### **Error: "permission denied"**
- Make sure you're logged into the correct Supabase project
- Check you have admin access to the database

### **Error: "table doesn't exist"**
- Make sure your places table exists
- Check the table name is exactly `places`

---

## **Rollback (If Needed)**

If you need to remove the columns:

```sql
ALTER TABLE places DROP COLUMN IF EXISTS contact_phone;
ALTER TABLE places DROP COLUMN IF EXISTS whatsapp_number;
ALTER TABLE places DROP COLUMN IF EXISTS address;
ALTER TABLE places DROP COLUMN IF EXISTS is_open;
ALTER TABLE places DROP COLUMN IF EXISTS avg_rating;
ALTER TABLE places DROP COLUMN IF EXISTS review_count;
```

---

## **Next Steps**

After adding columns:

1. ✅ Test your app - should work without errors
2. ✅ Add places with contact info
3. ✅ Test call/WhatsApp buttons
4. ✅ Check address display
5. ✅ Verify ratings system

---

## **Files Reference**

- `SIMPLE_ADD_COLUMNS.sql` - Quick essential columns only
- `ADD_MISSING_PLACES_COLUMNS.sql` - Complete with all features
- `ADD_COLUMNS_GUIDE.md` - This guide

**Start with the simple version, then upgrade to complete if needed!**