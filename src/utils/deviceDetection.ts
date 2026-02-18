import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Common device dimensions for better detection
export const DEVICE_MODELS = {
  // iPhone models
  IPHONE_SE_1: { width: 320, height: 568 },
  IPHONE_SE_2: { width: 375, height: 667 },
  IPHONE_6_7_8: { width: 375, height: 667 },
  IPHONE_6_7_8_PLUS: { width: 414, height: 736 },
  IPHONE_X_XS_11_PRO: { width: 375, height: 812 },
  IPHONE_XR_11: { width: 414, height: 896 },
  IPHONE_12_13_14: { width: 390, height: 844 },
  IPHONE_12_13_14_PLUS: { width: 428, height: 926 },
  
  // Common Android sizes
  ANDROID_SMALL: { width: 360, height: 640 },
  ANDROID_MEDIUM: { width: 375, height: 812 },
  ANDROID_LARGE: { width: 414, height: 896 },
  
  // Tablets
  IPAD_MINI: { width: 768, height: 1024 },
  IPAD_AIR: { width: 820, height: 1180 },
  ANDROID_TABLET: { width: 800, height: 1280 },
};

export const detectDeviceModel = () => {
  const tolerance = 5; // Allow small variations
  
  for (const [model, dimensions] of Object.entries(DEVICE_MODELS)) {
    const widthMatch = Math.abs(width - dimensions.width) <= tolerance;
    const heightMatch = Math.abs(height - dimensions.height) <= tolerance;
    
    if (widthMatch && heightMatch) {
      return model;
    }
  }
  
  return 'UNKNOWN';
};

export const getDeviceCategory = () => {
  const model = detectDeviceModel();
  
  if (model.includes('IPAD') || model.includes('TABLET')) {
    return 'tablet';
  }
  
  if (model.includes('SE') || model === 'ANDROID_SMALL') {
    return 'small_phone';
  }
  
  if (model.includes('PLUS') || model === 'ANDROID_LARGE') {
    return 'large_phone';
  }
  
  return 'regular_phone';
};
