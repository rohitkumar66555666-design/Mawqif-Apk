import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth, useAuthStore } from '../lib/authStore';
import { initializeFirebase } from '../lib/firebaseConfig';
import { PhoneInputComponent } from '../components/PhoneInput';
import { OTPInputComponent } from '../components/OTPInput';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { colors, theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { reset } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<'phone' | 'otp'>('phone');

  // Initialize Firebase on component mount
  useEffect(() => {
    initializeFirebase();
  }, []);

  // Reset auth state when component mounts
  useEffect(() => {
    reset();
  }, []);

  // Navigate to main app if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      handleVerificationSuccess();
    }
  }, [isAuthenticated]);

  // Handle OTP sent - move to OTP screen
  const handleOTPSent = () => {
    setCurrentStep('otp');
  };

  // Handle back to phone screen
  const handleBackToPhone = () => {
    setCurrentStep('phone');
  };

  // Handle successful verification
  const handleVerificationSuccess = () => {
    // Get return route from auth store
    const { getReturnRoute, clearReturnRoute } = useAuthStore.getState();
    const { route, params } = getReturnRoute();

    // Clear the return route
    clearReturnRoute();

    // Navigate to return route or fallback
    if (route) {
      console.log(`🧭 Returning to: ${route}`);
      navigation.navigate(route, params);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.statusBarStyle}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {currentStep === 'phone' ? (
          <PhoneInputComponent onOTPSent={handleOTPSent} />
        ) : (
          <OTPInputComponent
            onVerificationSuccess={handleVerificationSuccess}
            onBackToPhone={handleBackToPhone}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};