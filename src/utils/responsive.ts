import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get screen dimensions and handle dynamic changes
const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getScreenDimensions();

// Base dimensions (iPhone 11 as reference - most common device)
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

// Enhanced screen size categories with more granular breakpoints
export const SCREEN_SIZES = {
  EXTRA_SMALL: 'extraSmall', // < 350px width (very small Android)
  SMALL: 'small',            // 350-374px width (iPhone SE, small Android)
  MEDIUM: 'medium',          // 375-413px width (iPhone 11, 12, most Android)
  LARGE: 'large',            // 414-479px width (iPhone Plus, large Android)
  EXTRA_LARGE: 'extraLarge', // >= 480px width (tablets, foldables)
} as const;

// More accurate screen size detection
export const getScreenSize = (): keyof typeof SCREEN_SIZES => {
  if (SCREEN_WIDTH < 350) return 'EXTRA_SMALL';
  if (SCREEN_WIDTH < 375) return 'SMALL';
  if (SCREEN_WIDTH < 414) return 'MEDIUM';
  if (SCREEN_WIDTH < 480) return 'LARGE';
  return 'EXTRA_LARGE';
};

// Device type detection
export const getDeviceType = () => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  const isTablet = SCREEN_WIDTH >= 768 || (SCREEN_WIDTH >= 480 && aspectRatio < 1.6);
  
  return {
    isPhone: !isTablet,
    isTablet,
    isSmallPhone: SCREEN_WIDTH < 375,
    isLargePhone: SCREEN_WIDTH >= 414 && !isTablet,
    aspectRatio,
  };
};

// Enhanced responsive width with bounds checking and fallbacks
export const wp = (percentage: number): number => {
  try {
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      console.warn('wp: Invalid percentage value, using fallback');
      return SCREEN_WIDTH * 0.5; // 50% fallback
    }
    
    const value = (SCREEN_WIDTH * percentage) / 100;
    const result = Math.round(PixelRatio.roundToNearestPixel(value));
    
    // Ensure reasonable bounds
    return Math.max(0, Math.min(SCREEN_WIDTH, result));
  } catch (error) {
    console.error('wp error:', error);
    return SCREEN_WIDTH * 0.5; // Fallback
  }
};

// Enhanced responsive height with bounds checking and fallbacks
export const hp = (percentage: number): number => {
  try {
    if (typeof percentage !== 'number' || isNaN(percentage)) {
      console.warn('hp: Invalid percentage value, using fallback');
      return SCREEN_HEIGHT * 0.5; // 50% fallback
    }
    
    const value = (SCREEN_HEIGHT * percentage) / 100;
    const result = Math.round(PixelRatio.roundToNearestPixel(value));
    
    // Ensure reasonable bounds
    return Math.max(0, Math.min(SCREEN_HEIGHT, result));
  } catch (error) {
    console.error('hp error:', error);
    return SCREEN_HEIGHT * 0.5; // Fallback
  }
};

// Improved responsive font size with better scaling and error handling
export const rf = (size: number): number => {
  try {
    if (typeof size !== 'number' || isNaN(size) || size <= 0) {
      console.warn('rf: Invalid size value, using fallback');
      return 14; // Default font size fallback
    }
    
    const deviceType = getDeviceType();
    
    // Different scaling strategies for different device types
    let scale: number;
    
    if (deviceType.isTablet) {
      // Tablets: more conservative scaling
      scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.4);
    } else if (deviceType.isSmallPhone) {
      // Small phones: ensure readability
      scale = Math.max(SCREEN_WIDTH / BASE_WIDTH, 0.85);
    } else {
      // Regular phones: standard scaling
      scale = SCREEN_WIDTH / BASE_WIDTH;
    }
    
    const newSize = size * scale;
    
    // Dynamic min/max based on device type with absolute minimums
    const minSize = Math.max(10, deviceType.isSmallPhone ? size * 0.85 : size * 0.75);
    const maxSize = Math.min(50, deviceType.isTablet ? size * 1.4 : size * 1.25);
    
    const finalSize = Math.max(minSize, Math.min(maxSize, newSize));
    return Math.round(PixelRatio.roundToNearestPixel(finalSize));
  } catch (error) {
    console.error('rf error:', error);
    return Math.max(10, size || 14); // Safe fallback
  }
};

// Enhanced responsive spacing with device-aware scaling and error handling
export const rs = (size: number): number => {
  try {
    if (typeof size !== 'number' || isNaN(size)) {
      console.warn('rs: Invalid size value, using fallback');
      return 8; // Default spacing fallback
    }
    
    const deviceType = getDeviceType();
    
    let scale: number;
    
    if (deviceType.isTablet) {
      // Tablets: more generous spacing
      scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.5);
    } else if (deviceType.isSmallPhone) {
      // Small phones: compact spacing but not too cramped
      scale = Math.max(SCREEN_WIDTH / BASE_WIDTH, 0.8);
    } else {
      // Regular phones: proportional scaling
      scale = SCREEN_WIDTH / BASE_WIDTH;
    }
    
    const newSize = size * scale;
    
    // Ensure minimum spacing for touch targets and accessibility
    const minSize = size >= 44 ? 44 : Math.max(4, size * 0.8);
    const maxSize = Math.min(100, deviceType.isTablet ? size * 1.5 : size * 1.3);
    
    const finalSize = Math.max(minSize, Math.min(maxSize, newSize));
    return Math.round(PixelRatio.roundToNearestPixel(finalSize));
  } catch (error) {
    console.error('rs error:', error);
    return Math.max(4, size || 8); // Safe fallback
  }
};

// Enhanced responsive dimensions with device-aware calculations
export const getResponsiveDimensions = () => {
  const screenSize = getScreenSize();
  const deviceType = getDeviceType();
  
  // Base dimensions that scale with device
  const baseDimensions = {
    // Header heights - ensure proper status bar handling
    headerHeight: rs(deviceType.isTablet ? 100 : 80),
    statusBarHeight: Platform.OS === 'ios' 
      ? (deviceType.isSmallPhone ? 20 : 44) 
      : 24,
    
    // Card dimensions - scale with screen size
    cardPadding: rs(deviceType.isTablet ? 24 : deviceType.isSmallPhone ? 12 : 16),
    cardMargin: rs(deviceType.isTablet ? 20 : deviceType.isSmallPhone ? 8 : 12),
    cardBorderRadius: rs(deviceType.isTablet ? 20 : deviceType.isSmallPhone ? 8 : 12),
    
    // Button dimensions - maintain accessibility
    buttonHeight: Math.max(44, rs(deviceType.isTablet ? 56 : 48)),
    buttonPadding: rs(deviceType.isTablet ? 24 : deviceType.isSmallPhone ? 12 : 16),
    
    // Image dimensions - proportional to screen
    cardImageSize: rs(deviceType.isTablet ? 120 : deviceType.isSmallPhone ? 60 : 75),
    markerSize: rs(deviceType.isTablet ? 50 : deviceType.isSmallPhone ? 35 : 40),
    
    // Font sizes - device-aware scaling
    titleSize: rf(deviceType.isTablet ? 32 : deviceType.isSmallPhone ? 20 : 24),
    subtitleSize: rf(deviceType.isTablet ? 20 : deviceType.isSmallPhone ? 14 : 16),
    bodySize: rf(deviceType.isTablet ? 18 : deviceType.isSmallPhone ? 12 : 14),
    captionSize: rf(deviceType.isTablet ? 16 : deviceType.isSmallPhone ? 10 : 12),
    
    // Map specific - percentage-based for consistency
    bottomListHeight: deviceType.isTablet ? 50 : deviceType.isSmallPhone ? 35 : 40,
    placeCardWidth: wp(deviceType.isTablet ? 70 : deviceType.isSmallPhone ? 90 : 85),
    
    // Form elements - accessibility-first
    inputHeight: Math.max(44, rs(deviceType.isTablet ? 56 : 48)),
    inputPadding: rs(deviceType.isTablet ? 20 : deviceType.isSmallPhone ? 12 : 16),
  };
  
  return baseDimensions;
};

// Enhanced responsive breakpoints
export const isExtraSmallScreen = (): boolean => getScreenSize() === 'EXTRA_SMALL';
export const isSmallScreen = (): boolean => getScreenSize() === 'SMALL';
export const isMediumScreen = (): boolean => getScreenSize() === 'MEDIUM';
export const isLargeScreen = (): boolean => getScreenSize() === 'LARGE';
export const isExtraLargeScreen = (): boolean => getScreenSize() === 'EXTRA_LARGE';

// Device orientation with dynamic updates
export const isLandscape = (): boolean => SCREEN_WIDTH > SCREEN_HEIGHT;
export const isPortrait = (): boolean => SCREEN_HEIGHT > SCREEN_WIDTH;

// Comprehensive screen information
export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isExtraSmall: isExtraSmallScreen(),
  isSmall: isSmallScreen(),
  isMedium: isMediumScreen(),
  isLarge: isLargeScreen(),
  isExtraLarge: isExtraLargeScreen(),
  isLandscape: isLandscape(),
  isPortrait: isPortrait(),
  deviceType: getDeviceType(),
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

// Enhanced grid system
export const getGridColumns = (): number => {
  const deviceType = getDeviceType();
  const screenSize = getScreenSize();
  
  if (deviceType.isTablet) {
    return isLandscape() ? 4 : 3;
  }
  
  switch (screenSize) {
    case 'EXTRA_SMALL':
    case 'SMALL':
      return 1;
    case 'MEDIUM':
      return isLandscape() ? 2 : 1;
    case 'LARGE':
    case 'EXTRA_LARGE':
      return isLandscape() ? 3 : 2;
    default:
      return 1;
  }
};

// Enhanced safe area calculations with better device detection
export const getSafeAreaInsets = () => {
  const deviceType = getDeviceType();
  const screenSize = getScreenSize();
  
  // iOS-specific safe area handling
  if (Platform.OS === 'ios') {
    // iPhone X and newer have notches/dynamic island
    const hasNotch = SCREEN_HEIGHT >= 812 && deviceType.isPhone;
    
    return {
      top: hasNotch ? 44 : 20,
      bottom: hasNotch ? 34 : 0,
      left: 0,
      right: 0,
    };
  }
  
  // Android safe area handling
  return {
    top: 24, // Standard Android status bar
    bottom: 0,
    left: 0,
    right: 0,
  };
};

// Utility to get optimal touch target size
export const getTouchTargetSize = (baseSize: number = 44): number => {
  const deviceType = getDeviceType();
  
  // Ensure minimum 44px for accessibility
  const minSize = 44;
  const scaledSize = rs(baseSize);
  
  return Math.max(minSize, scaledSize);
};

// Utility to get responsive border radius
export const getResponsiveBorderRadius = (baseRadius: number = 8): number => {
  const deviceType = getDeviceType();
  
  if (deviceType.isTablet) {
    return rs(baseRadius * 1.5);
  }
  
  return rs(baseRadius);
};

// Create a responsive hook for dynamic updates
export const useResponsiveDimensions = () => {
  // This would be used with React hooks in a real implementation
  // For now, return static dimensions
  return getResponsiveDimensions();
};

// Debug utility to log device information
export const logDeviceInfo = () => {
  const deviceType = getDeviceType();
  const screenSize = getScreenSize();
  const dimensions = getResponsiveDimensions();
  
  console.log('📱 Device Info:', {
    screenSize,
    deviceType,
    dimensions: SCREEN_DIMENSIONS,
    responsiveDimensions: dimensions,
    safeArea: getSafeAreaInsets(),
  });
};

export default {
  wp,
  hp,
  rf,
  rs,
  getScreenSize,
  getDeviceType,
  getResponsiveDimensions,
  isExtraSmallScreen,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  isExtraLargeScreen,
  isLandscape,
  isPortrait,
  SCREEN_DIMENSIONS,
  getGridColumns,
  getSafeAreaInsets,
  getTouchTargetSize,
  getResponsiveBorderRadius,
  useResponsiveDimensions,
  logDeviceInfo,
};
