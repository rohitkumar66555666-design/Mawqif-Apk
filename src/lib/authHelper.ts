import { Alert } from 'react-native';
import { useAuthStore } from './authStore';

// ============================================
// UNIFIED AUTHENTICATION HELPER
// Works for both Dev Mode and Firebase Mode
// ============================================

interface AuthRequiredOptions {
  feature: string;
  description: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Check if user is authenticated
export const useAuthRequired = () => {
  const { isAuthenticated } = useAuthStore();

  const requireAuth = (navigation: any, options: AuthRequiredOptions) => {
    if (isAuthenticated) {
      // User is already logged in, proceed with action
      options.onSuccess?.();
      return true;
    }

    // User not logged in, show login prompt
    showLoginPrompt(navigation, options);
    return false;
  };

  return { requireAuth, isAuthenticated };
};

// Show contextual login prompt
const showLoginPrompt = (navigation: any, options: AuthRequiredOptions) => {
  // Get current route name to return to after login
  const currentRoute = navigation.getState()?.routes[navigation.getState()?.index]?.name;

  Alert.alert(
    `🔐 Login Required`,
    `To ${options.feature}, please verify your phone number first.\n\n${options.description}`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: options.onCancel,
      },
      {
        text: 'Login',
        style: 'default',
        onPress: () => {
          // Import auth store here to avoid circular dependency
          const { useAuthStore } = require('./authStore');
          const { setReturnRoute } = useAuthStore.getState();

          // Set return route before navigating to login
          if (currentRoute) {
            setReturnRoute(currentRoute);
          }

          navigation.navigate('Login');
        },
      },
    ],
    { cancelable: true }
  );
};

// ============================================
// FEATURE-SPECIFIC AUTH HELPERS
// ============================================

// Get Directions Authentication
export const useDirectionsAuth = () => {
  const { requireAuth } = useAuthRequired();

  const requireDirectionsAuth = (navigation: any, onSuccess: () => void) => {
    return requireAuth(navigation, {
      feature: 'get directions',
      description: 'This helps us provide personalized navigation and save your favorite routes.',
      onSuccess,
    });
  };

  return { requireDirectionsAuth };
};

// Reviews Authentication
export const useReviewsAuth = () => {
  const { requireAuth } = useAuthRequired();

  const requireReviewAuth = (navigation: any, action: string, onSuccess: () => void) => {
    const descriptions = {
      write: 'This ensures authentic reviews from verified users and prevents spam.',
      like: 'This helps us show you personalized recommendations based on your preferences.',
      dislike: 'This helps us improve content quality and show better recommendations.',
      reply: 'This ensures meaningful conversations between verified community members.',
      report: 'This helps us maintain community standards with verified user reports.',
    };

    return requireAuth(navigation, {
      feature: `${action} reviews`,
      description: descriptions[action as keyof typeof descriptions] || 'This requires user verification.',
      onSuccess,
    });
  };

  return { requireReviewAuth };
};

// WhatsApp Chat Authentication
export const useWhatsAppAuth = () => {
  const { requireAuth } = useAuthRequired();

  const requireWhatsAppAuth = (navigation: any, onSuccess: () => void) => {
    return requireAuth(navigation, {
      feature: 'contact via WhatsApp',
      description: 'This helps protect both you and place owners by verifying user identity.',
      onSuccess,
    });
  };

  return { requireWhatsAppAuth };
};

// Add Place Authentication
export const useAddPlaceAuth = () => {
  const { requireAuth } = useAuthRequired();

  const requireAddPlaceAuth = (navigation: any, onSuccess: () => void) => {
    return requireAuth(navigation, {
      feature: 'add a prayer space',
      description: 'This ensures quality listings from verified community members.',
      onSuccess,
    });
  };

  return { requireAddPlaceAuth };
};

// Bookmark Authentication
export const useBookmarkAuth = () => {
  const { requireAuth } = useAuthRequired();

  const requireBookmarkAuth = (navigation: any, onSuccess: () => void) => {
    return requireAuth(navigation, {
      feature: 'bookmark places',
      description: 'This allows you to save and manage your favorite prayer spaces.',
      onSuccess,
    });
  };

  return { requireBookmarkAuth };
};

// ============================================
// AUTHENTICATION STATUS HELPERS
// ============================================

// Get user info for display
export const useUserInfo = () => {
  const { user, isAuthenticated } = useAuthStore();

  const getUserDisplayName = () => {
    if (!isAuthenticated || !user) return 'Guest User';
    return user.displayName || user.phoneNumber || 'Verified User';
  };

  const getUserPhone = () => {
    if (!isAuthenticated || !user) return null;
    return user.phoneNumber;
  };

  const isVerifiedUser = () => isAuthenticated && !!user;

  return {
    user,
    isAuthenticated,
    getUserDisplayName,
    getUserPhone,
    isVerifiedUser,
  };
};