import { Dimensions } from 'react-native';
import { getResponsiveDimensions, rf, rs, wp, hp, SCREEN_DIMENSIONS } from './responsive';
import { detectDeviceModel, getDeviceCategory } from './deviceDetection';

export const runResponsiveTest = () => {
  const { width, height } = Dimensions.get('window');
  const deviceModel = detectDeviceModel();
  const deviceCategory = getDeviceCategory();
  const dimensions = getResponsiveDimensions();
  
  console.log('🧪 RESPONSIVE SYSTEM TEST');
  console.log('========================');
  console.log('📱 Device Info:');
  console.log(`  Screen: ${width}x${height}`);
  console.log(`  Model: ${deviceModel}`);
  console.log(`  Category: ${deviceCategory}`);
  console.log('');
  
  console.log('📏 Responsive Functions:');
  console.log(`  wp(50): ${wp(50)}px`);
  console.log(`  hp(50): ${hp(50)}px`);
  console.log(`  rf(16): ${rf(16)}px`);
  console.log(`  rs(16): ${rs(16)}px`);
  console.log('');
  
  console.log('🎨 Component Dimensions:');
  console.log(`  Header Height: ${dimensions.headerHeight}px`);
  console.log(`  Button Height: ${dimensions.buttonHeight}px`);
  console.log(`  Card Padding: ${dimensions.cardPadding}px`);
  console.log(`  Image Size: ${dimensions.cardImageSize}px`);
  console.log('');
  
  console.log('✅ Test completed - check console for details');
  
  return {
    deviceInfo: { width, height, deviceModel, deviceCategory },
    responsiveFunctions: {
      wp50: wp(50),
      hp50: hp(50),
      rf16: rf(16),
      rs16: rs(16),
    },
    dimensions,
  };
};

export const validateResponsiveSystem = () => {
  const test = runResponsiveTest();
  const issues = [];
  
  // Check for common issues
  if (test.dimensions.headerHeight < 60) {
    issues.push('Header height too small');
  }
  
  if (test.dimensions.buttonHeight < 44) {
    issues.push('Button height below accessibility minimum');
  }
  
  if (test.responsiveFunctions.rf16 < 12) {
    issues.push('Font size too small for readability');
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Responsive System Issues:', issues);
    return false;
  }
  
  console.log('✅ Responsive system validation passed');
  return true;
};
