import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfileService } from '../services/user-profile.service';
import { PlacesService } from '../services/places.service';
import { setAuthMode as setFirebaseAuthMode } from './firebaseConfig';
import { supabase } from '../services/supabase';

// ============================================
// AUTH STORE TYPES
// ============================================

interface User {
  uid: string;
  phoneNumber: string;
  displayName?: string | null;
  email?: string | null;
  isHost?: boolean;
  profileId?: string;
}

interface UserProfile {
  id?: string;
  user_id: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  city?: string;
  state?: string;
  country?: string;
  profile_image_url?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

interface AuthState {
  // User data
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;

  // Phone verification flow
  phoneNumber: string;
  verificationId: string | null;
  confirmationResult: any | null;

  // UI states
  isLoading: boolean;
  error: string | null;

  // OTP states
  otpSent: boolean;
  resendTimer: number;

  // Auth mode (dev/firebase)
  authMode: 'dev' | 'firebase';

  // Navigation state
  returnRoute: string | null;
  returnParams: any | null;

  // Actions
  setPhoneNumber: (phone: string) => void;
  setVerificationId: (id: string) => void;
  setConfirmationResult: (result: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOtpSent: (sent: boolean) => void;
  setResendTimer: (timer: number) => void;
  setUser: (user: User | null) => void;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;

  // Navigation actions
  setReturnRoute: (route: string | null, params?: any) => void;
  getReturnRoute: () => { route: string | null; params: any | null };
  clearReturnRoute: () => void;

  // Profile actions
  loadUserProfile: () => Promise<void>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;

  // Place management
  toggleUserPlacesVisibility: (isVisible: boolean) => Promise<void>;

  // Auth mode
  setAuthMode: (mode: 'dev' | 'firebase') => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  user: null,
  userProfile: null,
  isAuthenticated: false,
  phoneNumber: '',
  verificationId: null,
  confirmationResult: null,
  isLoading: false,
  error: null,
  otpSent: false,
  resendTimer: 0,
  authMode: 'dev' as 'dev' | 'firebase',
  returnRoute: null,
  returnParams: null,
};

// ============================================
// AUTH STORE
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Set phone number
      setPhoneNumber: (phone: string) => {
        set({ phoneNumber: phone, error: null });
      },

      // Set verification ID (Firebase)
      setVerificationId: (id: string) => {
        set({ verificationId: id });
      },

      // Set confirmation result (Firebase)
      setConfirmationResult: (result: any) => {
        set({ confirmationResult: result });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set error message
      setError: (error: string | null) => {
        set({ error });
      },

      // Set OTP sent status
      setOtpSent: (sent: boolean) => {
        set({ otpSent: sent });
      },

      // Set resend timer
      setResendTimer: (timer: number) => {
        set({ resendTimer: timer });
      },

      // Set user data
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user
        });
      },

      // Login user with profile integration
      login: async (user: User) => {
        try {
          set({ isLoading: true });

          console.log('🔐 Login process started for user:', user.phoneNumber, 'with ID:', user.uid);

          // Set user and authenticated state
          set({
            user,
            isAuthenticated: true,
            error: null,
            isLoading: false
          });

          console.log('✅ User logged in:', user.phoneNumber);

          // Load or create user profile
          await get().loadUserProfile();

          // Update last login time (only if profile exists)
          const currentProfile = get().userProfile;
          if (currentProfile) {
            try {
              // Use a separate update call for last_login_at since it's not in UpdateUserProfileInput
              const { error } = await supabase
                .from('user_profiles')
                .update({ last_login_at: new Date().toISOString() })
                .eq('user_id', user.uid);

              if (error) throw error;
              console.log('✅ Last login time updated');
            } catch (updateError) {
              console.warn('⚠️ Could not update last login time:', updateError);
              // Don't fail login if last login update fails
            }
          } else {
            console.log('ℹ️ No profile found, skipping last login update');
          }

          // Show user's places if they are a host
          console.log('👁️ About to show places for user ID:', user.uid);
          await get().toggleUserPlacesVisibility(true);

        } catch (error) {
          console.error('❌ Login error:', error);
          set({ error: 'Failed to complete login process' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout user with place hiding
      logout: async () => {
        try {
          set({ isLoading: true });

          const currentUser = get().user;
          console.log('🚪 User logging out:', currentUser?.phoneNumber, 'with ID:', currentUser?.uid);

          // Hide user's places from public view
          if (currentUser?.uid) {
            console.log('🙈 About to hide places for user ID:', currentUser.uid);
            await get().toggleUserPlacesVisibility(false);
          }

          // Clear auth state
          set({
            ...initialState,
            isAuthenticated: false
          });

          console.log('✅ User logged out successfully');

        } catch (error) {
          console.error('❌ Logout error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Reset auth state
      reset: () => {
        set(initialState);
      },

      // Load user profile
      loadUserProfile: async () => {
        const user = get().user;
        if (!user) return;

        try {
          console.log('📱 Loading profile for:', user.phoneNumber, 'with user ID:', user.uid);

          // Get or create profile by phone number
          let profile = await UserProfileService.getOrCreateProfile({
            user_id: user.uid,
            phone_number: user.phoneNumber,
            first_name: user.displayName || undefined,
          });

          set({ userProfile: profile });

          // Update user with profile info
          const updatedUser = {
            ...user,
            displayName: profile.full_name || profile.first_name || user.displayName,
            profileId: profile.id
          };

          set({ user: updatedUser });

          console.log('✅ Profile loaded/created:', profile.full_name || 'No name', 'for user ID:', user.uid);

        } catch (error) {
          console.error('❌ Load profile error:', error);
        }
      },

      // Update user profile
      updateUserProfile: async (profileData: {
        first_name?: string;
        last_name?: string;
        date_of_birth?: string;
        gender?: 'male' | 'female' | 'other';
        city?: string;
        state?: string;
        profile_image_url?: string;
      }) => {
        const user = get().user;
        const profile = get().userProfile;

        if (!user || !profile) {
          throw new Error('User or profile not found');
        }

        try {
          console.log('📝 Updating profile...');

          // Update profile in background without blocking UI
          const updatePromise = UserProfileService.updateProfile(
            user.uid,
            profileData
          );

          // Optimistically update local state immediately
          const optimisticProfile: UserProfile = {
            ...profile,
            ...profileData,
            full_name: profileData.first_name && profileData.last_name
              ? `${profileData.first_name} ${profileData.last_name}`.trim()
              : profile.full_name,
            updated_at: new Date().toISOString()
          };

          set({ userProfile: optimisticProfile });

          // Update user display name immediately if changed
          if (optimisticProfile.full_name) {
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  displayName: optimisticProfile.full_name
                }
              });
            }
          }

          // Wait for actual update to complete
          const updatedProfile = await updatePromise;

          // Sync with server response
          set({ userProfile: updatedProfile });

          console.log('✅ Profile updated');

        } catch (error) {
          console.error('❌ Update profile error:', error);

          // Revert optimistic update on error
          set({ userProfile: profile });

          throw error;
        }
      },

      // Toggle user places visibility
      toggleUserPlacesVisibility: async (isVisible: boolean) => {
        const user = get().user;
        if (!user) return;

        try {
          console.log(`${isVisible ? '👁️' : '🙈'} ${isVisible ? 'Showing' : 'Hiding'} user places...`);

          // Update all user's places visibility
          await PlacesService.toggleUserPlacesVisibility(user.uid, isVisible);

          console.log(`✅ Places ${isVisible ? 'shown' : 'hidden'}`);

        } catch (error) {
          console.error('❌ Toggle places visibility error:', error);
        }
      },

      // Set auth mode
      setAuthMode: (mode: 'dev' | 'firebase') => {
        set({ authMode: mode });
        setFirebaseAuthMode(mode); // Sync with firebase config
        console.log(`🔧 Auth mode set to: ${mode}`);
      },

      // Navigation actions
      setReturnRoute: (route: string | null, params?: any) => {
        set({ returnRoute: route, returnParams: params || null });
        console.log(`🧭 Return route set to: ${route}`);
      },

      getReturnRoute: () => {
        const state = get();
        return { route: state.returnRoute, params: state.returnParams };
      },

      clearReturnRoute: () => {
        set({ returnRoute: null, returnParams: null });
        console.log('🧭 Return route cleared');
      },
    }),
    {
      name: 'mawqif-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist user data, profile, authentication status, and return route
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
        authMode: state.authMode,
        returnRoute: state.returnRoute,
        returnParams: state.returnParams,
      }),
    }
  )
);

// ============================================
// HELPER HOOKS
// ============================================

// Hook to get authentication status
export const useAuth = () => {
  const { user, userProfile, isAuthenticated, isLoading } = useAuthStore();
  return { user, userProfile, isAuthenticated, isLoading };
};

// Hook to get phone verification state
export const usePhoneVerification = () => {
  const {
    phoneNumber,
    verificationId,
    confirmationResult,
    otpSent,
    resendTimer,
    error,
    isLoading,
    setPhoneNumber,
    setVerificationId,
    setConfirmationResult,
    setOtpSent,
    setResendTimer,
    setError,
    setLoading,
  } = useAuthStore();

  return {
    phoneNumber,
    verificationId,
    confirmationResult,
    otpSent,
    resendTimer,
    error,
    isLoading,
    setPhoneNumber,
    setVerificationId,
    setConfirmationResult,
    setOtpSent,
    setResendTimer,
    setError,
    setLoading,
  };
};