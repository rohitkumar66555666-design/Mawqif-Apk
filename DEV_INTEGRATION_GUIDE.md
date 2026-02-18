# Dev Integration Guide - Contact & Dashboard Features

## Overview
This guide helps **Dev 1** (you) and **Dev 2** (your friend) integrate features without merge conflicts.

## Current Status

### ✅ **Dev 1 (Your) Completed Features:**
- **Dynamic Contact System** - No more hardcoded numbers
- **Image Cloud Storage** - Images work for all users
- **Real Ratings System** - No fake ratings
- **Address Display** - Shows place addresses
- **Search & Filters** - Working smoothly
- **Reviews System** - Complete with like/dislike

### 🔄 **Dev 2 Integration Points:**

## 1. **Contact Information Integration**

### **Database Fields Ready:**
```sql
-- These fields are already in the places table
contact_phone VARCHAR(20)     -- Phone number from user profile
whatsapp_number VARCHAR(20)   -- WhatsApp from user profile
```

### **How It Works Now:**
- **AddPlaceScreen**: Users can add contact info when creating places
- **PlaceDetailScreen**: Shows contact info if available, "Not provided" if empty
- **No hardcoded numbers**: All removed, ready for user profiles

### **For Dev 2 (User Dashboard):**
```typescript
// When user updates their profile, update their places
const updateUserPlaces = async (userId: string, contactInfo: {
  contact_phone?: string;
  whatsapp_number?: string;
}) => {
  await supabase
    .from('places')
    .update(contactInfo)
    .eq('owner_id', userId);
};
```

## 2. **Open/Closed Status Integration**

### **Database Field Ready:**
```sql
is_open BOOLEAN DEFAULT true  -- Controlled by host dashboard
```

### **Current Implementation:**
- **PlaceDetailScreen**: Shows dynamic open/closed status
- **Visual indicators**: Green for open, red for closed
- **Ready for host control**: Just update the `is_open` field

### **For Dev 2 (Host Dashboard):**
```typescript
// Toggle place open/closed status
const togglePlaceStatus = async (placeId: string, isOpen: boolean) => {
  await supabase
    .from('places')
    .update({ is_open: isOpen })
    .eq('id', placeId);
};
```

## 3. **User Profile Integration**

### **Suggested Database Schema:**
```sql
-- User profiles table (for Dev 2)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(100),
  contact_phone VARCHAR(20),
  whatsapp_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Integration Flow:**
1. **User registers** → Dev 2 creates profile
2. **User adds place** → Uses profile contact info
3. **User updates profile** → Updates all their places
4. **Host dashboard** → Controls place status (open/closed)

## 4. **File Structure - No Conflicts**

### **Dev 1 Files (Your Domain):**
```
src/screens/
├── HomeScreen.tsx ✅
├── PlaceDetailScreen.tsx ✅
├── AddPlaceScreen.tsx ✅
└── MapScreen.tsx ✅

src/components/
├── SearchBar.tsx ✅
├── PlaceCard.tsx ✅
├── ReviewsSection.tsx ✅
└── FilterModal.tsx ✅

src/services/
├── places.service.ts ✅
├── reviews.service.ts ✅
└── image-upload.service.ts ✅
```

### **Dev 2 Files (Your Friend's Domain):**
```
src/screens/
├── LoginScreen.tsx 🔄
├── ProfileScreen.tsx 🆕
├── HostDashboardScreen.tsx 🆕
└── UserDashboardScreen.tsx 🆕

src/services/
├── auth.service.ts 🔄
├── profile.service.ts 🆕
└── host.service.ts 🆕
```

## 5. **Integration Points**

### **A. Contact Information Flow:**
```
User Profile (Dev 2) → Place Creation (Dev 1) → Place Display (Dev 1)
```

### **B. Host Dashboard Flow:**
```
Host Dashboard (Dev 2) → Place Status Update → Place Detail Display (Dev 1)
```

### **C. Authentication Flow:**
```
Login System (Dev 2) → User Context → All Screens (Both Devs)
```

## 6. **Merge Strategy**

### **Safe Merge Approach:**
1. **Dev 2** works on new files (Profile, Dashboard, Auth)
2. **Dev 1** works on existing files (Places, Reviews, Search)
3. **Integration points** use shared database fields
4. **No file conflicts** - different domains

### **Shared Dependencies:**
```typescript
// types/index.ts - Add these for Dev 2
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  contact_phone?: string;
  whatsapp_number?: string;
}

export interface HostDashboard {
  place_id: string;
  is_open: boolean;
  // Add more host controls
}
```

## 7. **Testing Integration**

### **Test Scenarios:**
1. **User creates profile** → Contact info appears in places
2. **Host toggles status** → Place shows open/closed correctly
3. **User updates profile** → All their places update contact info
4. **New user adds place** → Contact fields work properly

## 8. **Database Migrations Needed**

### **For Dev 2 to Run:**
```sql
-- 1. Add user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(20),
  whatsapp_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add owner_id to places (if not exists)
ALTER TABLE places 
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 3. Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## 9. **Communication Protocol**

### **Before Merging:**
1. **Share database changes** in advance
2. **Test integration points** separately
3. **Coordinate on shared types** in `types/index.ts`
4. **Review merge conflicts** together

### **Integration Checklist:**
- [ ] Contact info flows from profile to places
- [ ] Host dashboard controls place status
- [ ] No hardcoded values remain
- [ ] Authentication works across all screens
- [ ] Database migrations applied
- [ ] Types are shared and consistent

## 10. **Future Enhancements**

### **Ready for:**
- **Multiple images per place** (70MB storage limit)
- **Advanced host controls** (hours, pricing, etc.)
- **User reviews on profiles** 
- **Place ownership verification**
- **Push notifications** for status changes

This structure ensures both devs can work independently while maintaining clean integration points! 🚀