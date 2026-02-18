// ============================================
// FIREBASE CONFIGURATION
// Replace all "PASTE_YOUR_XXX_HERE" with your Firebase project values
// ============================================

import { Alert, Clipboard } from 'react-native';

// 🔧 TOGGLE: Switch between Dev Mode and Firebase
// This can be overridden by the auth store
export let USE_FIREBASE = false; // 👈 CHANGE THIS TO TRUE FOR REAL SMS

// Function to set auth mode (called by auth store)
export const setAuthMode = (mode: 'dev' | 'firebase') => {
  USE_FIREBASE = mode === 'firebase';
  console.log(`🔧 Auth mode set to: ${mode} (USE_FIREBASE: ${USE_FIREBASE})`);
};

// Function to get current auth mode
export const getAuthMode = (): 'dev' | 'firebase' => {
  return USE_FIREBASE ? 'firebase' : 'dev';
};

// Firebase configuration object
// 🔥 Get these values from Firebase Console → Project Settings → Web App
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE", 
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE",
  measurementId: "PASTE_YOUR_MEASUREMENT_ID_HERE" // Optional
};

// ============================================
// FIREBASE FUNCTIONS (PRODUCTION MODE)
// Used when USE_FIREBASE = true
// ============================================

let firebaseApp: any = null;
let auth: any = null;

// Initialize Firebase (called when USE_FIREBASE = true)
const initializeFirebaseApp = async () => {
  if (firebaseApp) return firebaseApp;
  
  try {
    // Dynamic imports to avoid errors when Firebase is not installed
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    
    console.log('🔥 Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

// Real Firebase OTP function
const sendFirebaseOTP = async (phoneNumber: string) => {
  try {
    await initializeFirebaseApp();
    const { signInWithPhoneNumber, RecaptchaVerifier } = await import('firebase/auth');
    
    // Create reCAPTCHA verifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('🔐 reCAPTCHA solved');
      }
    });
    
    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    console.log('📱 Firebase OTP sent to:', phoneNumber);
    
    return confirmationResult;
  } catch (error) {
    console.error('❌ Firebase OTP error:', error);
    throw error;
  }
};

// ============================================
// MOCK FIREBASE FUNCTIONS (DEV MODE)
// Used when USE_FIREBASE = false
// ============================================

interface MockConfirmationResult {
  confirm: (verificationCode: string) => Promise<{ user: any }>;
}

let mockOTP: string = '';

// Mock function to send OTP (Dev Mode)
const sendMockOTP = async (phoneNumber: string): Promise<MockConfirmationResult> => {
  // Generate random 6-digit OTP
  mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log(`🔐 DEV MODE - Generated OTP: ${mockOTP} for ${phoneNumber}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    confirm: async (verificationCode: string) => {
      console.log(`🔐 Verifying OTP: ${verificationCode} against ${mockOTP}`);
      
      if (verificationCode === mockOTP) {
        // Generate a consistent UUID based on phone number for dev mode
        const generateConsistentMockUUID = (phoneNumber: string) => {
          // Simple and reliable: just use 'dev-' + clean phone number
          // This ensures the same phone number ALWAYS gets the same UUID
          const cleanPhone = phoneNumber.replace(/[^\d]/g, ''); // Remove non-digits
          
          // Create a simple, consistent UUID format
          const uuid = `dev-${cleanPhone}`;
          
          console.log(`🔐 Generated consistent UUID: ${uuid} for phone: ${phoneNumber}`);
          return uuid;
        };
        
        return {
          user: {
            uid: generateConsistentMockUUID(phoneNumber),
            phoneNumber: phoneNumber,
            displayName: null,
            email: null
          }
        };
      } else {
        throw new Error('Invalid verification code');
      }
    }
  };
};

// ============================================
// MAIN OTP FUNCTION (SWITCHES AUTOMATICALLY)
// ============================================

export const sendOTP = async (phoneNumber: string) => {
  if (USE_FIREBASE) {
    console.log('🔥 Using Firebase OTP');
    return await sendFirebaseOTP(phoneNumber);
  } else {
    console.log('🧪 Using Dev Mode OTP');
    return await sendMockOTP(phoneNumber);
  }
};

// ============================================
// OTHER FUNCTIONS
// ============================================

// Get current user
export const getCurrentUser = async () => {
  if (USE_FIREBASE) {
    try {
      await initializeFirebaseApp();
      const { onAuthStateChanged } = await import('firebase/auth');
      
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user: any) => {
          unsubscribe();
          resolve(user);
        });
      });
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }
  
  // Dev mode: Return null (no persistent user)
  return null;
};

// Sign out function
export const signOut = async () => {
  if (USE_FIREBASE) {
    try {
      await initializeFirebaseApp();
      const { signOut: firebaseSignOut } = await import('firebase/auth');
      await firebaseSignOut(auth);
      console.log('🚪 Firebase user signed out');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  } else {
    // Dev mode: Clear mock data
    mockOTP = '';
    console.log('🚪 DEV MODE - User signed out');
  }
};

// Initialize Firebase (called from app startup)
export const initializeFirebase = async () => {
  if (USE_FIREBASE) {
    try {
      await initializeFirebaseApp();
      console.log('🔥 Firebase ready for production');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
    }
  } else {
    console.log('🧪 DEV MODE - Using mock OTP functions');
  }
};

// ============================================
// UNIFIED OTP DISPLAY FUNCTION
// Shows OTP consistently across both modes
// ============================================

export const showOTPFeedback = (phoneNumber: string, isSuccess: boolean = true) => {
  if (USE_FIREBASE) {
    // Firebase mode: Show SMS sent confirmation
    if (isSuccess) {
      Alert.alert(
        '📱 SMS Sent',
        `Verification code sent to ${phoneNumber}\n\nPlease check your messages.`,
        [{ text: 'OK' }]
      );
    }
  } else {
    // Dev mode: Show generated OTP with copy button
    const devOTP = getDevModeOTP();
    if (isSuccess && devOTP) {
      Alert.alert(
        '🔐 OTP Generated',
        `Your OTP is: ${devOTP}`,
        [
          {
            text: 'Copy OTP',
            onPress: () => {
              Clipboard.setString(devOTP);
              Alert.alert('✅ Copied', 'OTP copied to clipboard');
            }
          },
          { text: 'OK' }
        ],
        { cancelable: true }
      );
    }
  }
};

// ============================================
// UNIFIED ERROR HANDLING
// Consistent error messages across both modes
// ============================================

export const getUnifiedErrorMessage = (error: any): string => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Common error mappings for both modes
  if (errorMessage.includes('invalid-phone-number')) {
    return 'Please enter a valid phone number';
  }
  if (errorMessage.includes('too-many-requests')) {
    return 'Too many attempts. Please try again later';
  }
  if (errorMessage.includes('invalid-verification-code')) {
    return 'Invalid OTP. Please check and try again';
  }
  if (errorMessage.includes('code-expired')) {
    return 'OTP has expired. Please request a new one';
  }
  
  // Default error message
  return errorMessage.includes('Firebase') 
    ? 'SMS service temporarily unavailable. Please try again'
    : errorMessage;
};

// Export the current OTP for dev mode testing
export const getDevModeOTP = () => USE_FIREBASE ? null : mockOTP;