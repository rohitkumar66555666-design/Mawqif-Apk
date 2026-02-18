import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePhoneVerification, useAuthStore } from '../lib/authStore';
import { sendOTP, getDevModeOTP, USE_FIREBASE, showOTPFeedback, getUnifiedErrorMessage } from '../lib/firebaseConfig';
import { getResponsiveDimensions, rs, rf } from '../utils/responsive';

interface OTPInputComponentProps {
  onVerificationSuccess: () => void;
  onBackToPhone: () => void;
}

export const OTPInputComponent: React.FC<OTPInputComponentProps> = ({
  onVerificationSuccess,
  onBackToPhone,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [otp, setOtp] = useState('');
  const [shakeAnimation] = useState(new Animated.Value(0));
  
  const {
    phoneNumber,
    confirmationResult,
    isLoading,
    error,
    resendTimer,
    setLoading,
    setError,
    setConfirmationResult,
    setResendTimer,
  } = usePhoneVerification();
  
  const { login } = useAuthStore();

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP(otp);
    }
  }, [otp]);

  // Handle OTP verification
  const handleVerifyOTP = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      shakeError();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Verifying OTP:', otpCode);

      if (!confirmationResult) {
        throw new Error('No confirmation result found. Please resend OTP.');
      }

      // Verify OTP using Firebase or mock
      const result = await confirmationResult.confirm(otpCode);
      
      console.log('✅ OTP verified successfully:', result.user);

      // Login user with async method
      await login({
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber || phoneNumber,
        displayName: result.user.displayName,
        email: result.user.email,
      });

      // Success vibration
      Vibration.vibrate(200);

      // Show success message
      Alert.alert(
        '🎉 Success!',
        'Phone number verified successfully!',
        [
          {
            text: 'Continue',
            onPress: onVerificationSuccess,
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      setError(getUnifiedErrorMessage(error));
      setOtp(''); // Clear OTP input
      shakeError();
      Vibration.vibrate([100, 100, 100]); // Error vibration pattern
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError(null);
    setOtp('');

    try {
      console.log('📱 Resending OTP to:', phoneNumber);

      // Format phone number with country code
      const fullPhoneNumber = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber.replace(/^\+91\s?/, '')}`;

      // Resend OTP
      const confirmationResult = await sendOTP(fullPhoneNumber);
      setConfirmationResult(confirmationResult);
      
      // Start resend timer
      startResendTimer();
      
      // Show unified OTP feedback
      showOTPFeedback(fullPhoneNumber, true);

      Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');

    } catch (error: any) {
      console.error('❌ Error resending OTP:', error);
      setError(getUnifiedErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Shake animation for errors
  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: rs(24),
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    header: {
      alignItems: 'center',
      marginBottom: rs(40),
    },
    logo: {
      width: rs(80),
      height: rs(80),
      borderRadius: rs(40),
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs(20),
    },
    title: {
      fontSize: rf(28),
      fontWeight: '700',
      color: colors.text,
      marginBottom: rs(8),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: rf(16),
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: rf(22),
      paddingHorizontal: rs(20),
    },
    phoneNumber: {
      fontSize: rf(18),
      fontWeight: '600',
      color: colors.primary,
      marginTop: rs(8),
    },
    form: {
      alignItems: 'center',
      marginBottom: rs(32),
    },
    otpContainer: {
      marginBottom: rs(32),
    },
    otpInput: {
      width: rs(50),
      height: rs(60),
      borderRadius: rs(12),
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      fontSize: rf(20),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    otpInputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    otpInputFilled: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    resendContainer: {
      alignItems: 'center',
      marginBottom: rs(24),
    },
    resendTimer: {
      fontSize: rf(14),
      color: colors.textSecondary,
      marginBottom: rs(12),
    },
    resendButton: {
      paddingVertical: rs(12),
      paddingHorizontal: rs(24),
      borderRadius: rs(12),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resendButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    resendButtonText: {
      fontSize: rf(14),
      fontWeight: '600',
      color: colors.textSecondary,
    },
    resendButtonTextActive: {
      color: colors.textInverse,
    },
    errorContainer: {
      marginTop: rs(16),
      padding: rs(12),
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderRadius: rs(12),
      borderLeftWidth: rs(4),
      borderLeftColor: colors.error,
    },
    errorText: {
      color: colors.error,
      fontSize: rf(14),
      fontWeight: '500',
      textAlign: 'center',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <MaterialIcons name="security" size={rf(40)} color={colors.textInverse} />
        </View>
        <Text style={styles.title}>{t('verifyOTP')}</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to
        </Text>
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
      </View>

      {/* OTP Form */}
      <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnimation }] }]}>
        <View style={styles.otpContainer}>
          <OtpInput
            numberOfDigits={6}
            onTextChange={setOtp}
            onFilled={handleVerifyOTP}
            theme={{
              containerStyle: {
                marginBottom: rs(20),
              },
              pinCodeContainerStyle: styles.otpInput,
              focusedPinCodeContainerStyle: styles.otpInputFocused,
              filledPinCodeContainerStyle: styles.otpInputFilled,
              pinCodeTextStyle: {
                fontSize: rf(20),
                fontWeight: '600',
                color: colors.text,
              },
            }}
            disabled={isLoading}
            autoFocus
          />
        </View>

        {/* Resend Section */}
        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>
              Resend OTP in {resendTimer} seconds
            </Text>
          ) : (
            <TouchableOpacity
              style={[
                styles.resendButton,
                !isLoading && styles.resendButtonActive
              ]}
              onPress={handleResendOTP}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.resendButtonText,
                !isLoading && styles.resendButtonTextActive
              ]}>
                {isLoading ? 'Sending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </Animated.View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};