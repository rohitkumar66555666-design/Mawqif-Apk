# Unified Authentication System - Complete Implementation

## Overview

The unified authentication system seamlessly connects dev mode, Firebase authentication, user profiles, dashboard functionality, and place management. Users can login with their phone number, and their data persists across sessions with proper place visibility management.

## Key Features Implemented

### 1. **Dual Authentication Modes**
- **Dev Mode**: Mock OTP generation for testing (default)
- **Firebase Mode**: Real SMS OTP for production
- **Seamless Switching**: Toggle between modes without code changes
- **Same UI**: Identical user experience regardless of mode

### 2. **Enhanced Auth Store**
- **Profile Integration**: Automatically loads/creates user profile on login
- **Place Management**: Shows/hides user places based on login status
- **Persistent State**: Maintains auth state, profile, and mode across app restarts
- **Async Operations**: Proper error handling for all auth operations

### 3. **Profile Connection**
- **Phone Number Sync**: Login phone number automatically synced to profile
- **Auto-Creation**: Profile created if doesn't exist on first login
- **Real-time Updates**: Profile changes reflected immediately in auth store
- **Dashboard Integration**: Profile data displayed in dashboard

### 4. **Place Persistence & Visibility**
- **Login**: User's places become visible on the map
- **Logout**: User's places hidden from public view but saved in database
- **Re-login**: Places automatically shown again when user logs back in
- **Host Status**: Automatically managed based on place ownership

### 5. **Dashboard Integration**
- **Host Statistics**: Real-time stats for places, reviews, ratings
- **Place Management**: Toggle place status, manage reviews
- **Profile Display**: Shows user profile info and contact details
- **Contact Sync**: Updates contact info across all user places

## Implementation Details

### Enhanced Auth Store (`src/lib/authStore.ts`)

```typescript
interface AuthState {
  // User data with profile integration
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  
  // Auth mode (dev/firebase)
  authMode: 'dev' | 'firebase';
  
  // Enhanced actions
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  toggleUserPlacesVisibility: (isVisible: boolean) => Promise<void>;
  setAuthMode: (mode: 'dev' | 'firebase') => void;
}
```

**Key Methods:**

1. **`login(user)`**: 
   - Sets user and auth state
   - Loads or creates user profile
   - Updates last login time
   - Shows user's places on map

2. **`logout()`**:
   - Hides user's places from map
   - Clears auth state and profile
   - Maintains data in database

3. **`loadUserProfile()`**:
   - Gets existing profile or creates new one
   - Syncs phone number between auth and profile
   - Updates user display name

4. **`toggleUserPlacesVisibility(isVisible)`**:
   - Shows/hides all user places on login/logout
   - Updates `is_active` flag in places table

### Firebase Config Integration (`src/lib/firebaseConfig.ts`)

```typescript
// Dynamic mode switching
export let USE_FIREBASE = false;

export const setAuthMode = (mode: 'dev' | 'firebase') => {
  USE_FIREBASE = mode === 'firebase';
};

export const sendOTP = async (phoneNumber: string) => {
  if (USE_FIREBASE) {
    return await sendFirebaseOTP(phoneNumber);
  } else {
    return await sendMockOTP(phoneNumber);
  }
};
```

### Places Service Enhancement (`src/services/places.service.ts`)

```typescript
// Toggle visibility of all user's places
static async toggleUserPlacesVisibility(userId: string, isVisible: boolean): Promise<void> {
  const { error } = await supabase
    .from('places')
    .update({ 
      is_active: isVisible,
      updated_at: new Date().toISOString()
    })
    .eq('owner_id', userId);
}
```

### Profile Screen Integration (`src/screens/ProfileScreen.tsx`)

- **Auth Store Integration**: Uses `userProfile` from auth store
- **Async Logout**: Properly handles place hiding on logout
- **Profile Updates**: Uses auth store methods for profile updates
- **Auth Mode Access**: Menu item to switch authentication modes

### Dashboard Screen Integration (`src/screens/DashboardScreen.tsx`)

- **Profile Display**: Shows user profile from auth store
- **Host Statistics**: Real-time place and review statistics
- **Place Management**: Toggle place status, manage reviews
- **Contact Sync**: Update contact info across all places

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone_number TEXT UNIQUE,
  name TEXT,
  email TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_host BOOLEAN DEFAULT false,
  host_since TIMESTAMP,
  total_places_added INTEGER DEFAULT 0,
  host_rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  phone_number TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
      THEN first_name || ' ' || last_name
      WHEN first_name IS NOT NULL 
      THEN first_name
      ELSE NULL
    END
  ) STORED,
  date_of_birth DATE,
  age INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN date_of_birth IS NOT NULL 
      THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER
      ELSE NULL
    END
  ) STORED,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  city TEXT,
  state TEXT,
  country TEXT,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

### Places Table (Key Fields)
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_active BOOLEAN DEFAULT true, -- Controls visibility
  is_open BOOLEAN DEFAULT true,   -- Controls place status
  contact_phone TEXT,
  whatsapp_number TEXT,
  status_message TEXT,
  status_updated_at TIMESTAMP,
  status_updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## User Flow

### 1. **Login Process**
1. User enters phone number
2. OTP sent (mock or real SMS based on mode)
3. User enters OTP
4. System verifies OTP
5. User object created and stored in auth store
6. Profile loaded/created automatically
7. User's places become visible on map
8. Navigation to main app

### 2. **Profile Management**
1. Profile screen shows data from auth store
2. User can edit profile information
3. Changes saved to database and auth store
4. Display name updated across app
5. Contact info synced to user's places

### 3. **Dashboard Access**
1. Dashboard shows user profile and statistics
2. Host can manage their places
3. Toggle place status (open/closed)
4. Manage reviews and reports
5. Update contact information

### 4. **Logout Process**
1. User confirms logout
2. All user's places hidden from map (`is_active = false`)
3. Auth state and profile cleared
4. Places data preserved in database
5. Navigation to login or main screen

### 5. **Re-login Process**
1. User logs in with same phone number
2. Existing profile loaded from database
3. User's places become visible again (`is_active = true`)
4. All data restored as before logout

## Authentication Mode Switching

### Dev Mode (Default)
- **OTP Generation**: 6-digit random number
- **Display**: OTP shown in alert for easy testing
- **Cost**: Free
- **Setup**: No configuration needed
- **Testing**: Easy with visible OTP

### Firebase Mode
- **OTP Generation**: Real SMS via Firebase
- **Display**: SMS sent to actual phone number
- **Cost**: Pay per SMS
- **Setup**: Requires Firebase project configuration
- **Testing**: Requires real phone numbers

### Switching Modes
1. Go to Profile → Authentication Mode
2. Select desired mode (Dev/Firebase)
3. Confirm switch (warning for Firebase mode)
4. Mode applied immediately
5. Next login uses selected mode

## Configuration

### Firebase Setup (for Production)
1. Create Firebase project
2. Enable Authentication with Phone provider
3. Update `firebaseConfig` in `src/lib/firebaseConfig.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

4. Switch to Firebase mode in app
5. Test with real phone numbers

### Database Setup (Supabase)
1. Run the SQL scripts to create tables
2. Set up Row Level Security policies
3. Configure storage for profile images
4. Test database connections

## Testing

### Dev Mode Testing
1. Enter any valid Indian phone number (10 digits, starts with 6-9)
2. Tap "Send OTP"
3. Note the OTP from the alert
4. Enter the OTP to login
5. Test profile creation and place management

### Firebase Mode Testing
1. Switch to Firebase mode in settings
2. Enter your real phone number
3. Check SMS for OTP
4. Enter OTP to login
5. Verify all features work with real authentication

### Place Visibility Testing
1. Login and add a place
2. Verify place appears on map
3. Logout and check place is hidden
4. Login again and verify place reappears
5. Test with multiple users

## Error Handling

### Authentication Errors
- Invalid phone number format
- OTP verification failures
- Network connectivity issues
- Firebase configuration errors

### Profile Errors
- Profile creation failures
- Update operation errors
- Image upload issues
- Database connection problems

### Place Management Errors
- Place visibility toggle failures
- Status update errors
- Contact sync issues
- Permission problems

## Security Considerations

### Phone Number Validation
- Client-side format validation
- Server-side verification via OTP
- Duplicate phone number handling
- Rate limiting for OTP requests

### Data Protection
- User data encrypted in transit
- Profile images stored securely
- Phone numbers properly validated
- Session management with proper timeouts

### Access Control
- Users can only manage their own places
- Profile updates require authentication
- Dashboard access restricted to place owners
- Proper error messages without data leakage

## Performance Optimizations

### Auth Store
- Persistent state with AsyncStorage
- Minimal re-renders with Zustand
- Efficient profile loading
- Cached user data

### Database Queries
- Indexed queries for user places
- Efficient statistics calculations
- Proper foreign key relationships
- Optimized place visibility queries

### UI Performance
- Loading states for async operations
- Error boundaries for auth failures
- Smooth transitions between screens
- Responsive design for all devices

## Maintenance

### Regular Tasks
- Monitor authentication success rates
- Check Firebase usage and costs
- Update phone number validation rules
- Review and update error messages

### Updates
- Keep Firebase SDK updated
- Monitor Supabase API changes
- Update authentication flows as needed
- Test with new device types

### Monitoring
- Track login success/failure rates
- Monitor profile creation errors
- Check place visibility operations
- Review user feedback on auth flow

## Conclusion

The unified authentication system provides a seamless experience for users while maintaining flexibility for developers. The dual-mode approach allows easy testing during development and smooth transition to production. The integration with profiles, dashboard, and place management creates a cohesive user experience where data persists properly across login sessions.

Key benefits:
- ✅ Seamless dev/production mode switching
- ✅ Automatic profile management
- ✅ Persistent place data with proper visibility
- ✅ Integrated dashboard functionality
- ✅ Proper error handling and user feedback
- ✅ Scalable architecture for future enhancements