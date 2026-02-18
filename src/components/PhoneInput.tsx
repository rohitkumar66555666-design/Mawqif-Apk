import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePhoneVerification } from '../lib/authStore';
import { sendOTP, getDevModeOTP, USE_FIREBASE, showOTPFeedback, getUnifiedErrorMessage } from '../lib/firebaseConfig';
import { getResponsiveDimensions, rs, rf } from '../utils/responsive';

interface PhoneInputComponentProps {
  onOTPSent: () => void;
}

export const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({ onOTPSent }) => {
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const phoneInputRef = useRef<PhoneInput>(null);

  const {
    phoneNumber,
    isLoading,
    error,
    setPhoneNumber,
    setLoading,
    setError,
    setConfirmationResult,
    setOtpSent,
    setResendTimer,
  } = usePhoneVerification();

  const [formattedValue, setFormattedValue] = useState('');
  const [valid, setValid] = useState(false);

  // Validate Indian phone number
  const validatePhoneNumber = (number: string): boolean => {
    // Remove country code and spaces
    const cleanNumber = number.replace(/^\+91\s?/, '').replace(/\s/g, '');
    // Indian mobile numbers: 10 digits starting with 6-9
    return /^[6-9]\d{9}$/.test(cleanNumber);
  };

  // Handle send OTP
  const handleSendOTP = async () => {
    if (!valid || !phoneNumber) {
      setError('Please enter a valid Indian mobile number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format phone number with country code
      const fullPhoneNumber = phoneNumber.startsWith('+91')
        ? phoneNumber
        : `+91${phoneNumber.replace(/^\+91\s?/, '')}`;

      console.log('📱 Sending OTP to:', fullPhoneNumber);

      // Send OTP using Firebase or mock
      const confirmationResult = await sendOTP(fullPhoneNumber);

      // Store confirmation result
      setConfirmationResult(confirmationResult);
      setOtpSent(true);

      // Start resend timer
      startResendTimer();

      // Vibrate on success
      Vibration.vibrate(100);

      // Show unified OTP feedback (different for each mode)
      showOTPFeedback(fullPhoneNumber, true);

      // Navigate to OTP screen
      onOTPSent();

    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      setError(getUnifiedErrorMessage(error));
      Vibration.vibrate([100, 100, 100]); // Error vibration pattern
    } finally {
      setLoading(false);
    }
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      // We need to get the current value and update it
      const updateTimer = () => {
        // This is a workaround since setResendTimer doesn't accept a function
        // We'll need to track the timer value locally
      };
      updateTimer();
    }, 1000);

    // Use a local countdown approach
    let currentTimer = 60;
    const timerInterval = setInterval(() => {
      currentTimer -= 1;
      setResendTimer(currentTimer);
      if (currentTimer <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
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
    form: {
      marginBottom: rs(32),
    },
    inputContainer: {
      marginBottom: rs(24),
    },
    label: {
      fontSize: rf(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: rs(12),
    },
    phoneInputContainer: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: rs(16),
      backgroundColor: colors.surface,
      paddingHorizontal: rs(4),
      overflow: 'hidden', // Ensure child components respect the container styling
    },
    phoneInputContainerFocused: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: rs(8),
      elevation: 4,
    },
    phoneInput: {
      fontSize: rf(16),
      color: colors.text,
      backgroundColor: colors.surface,
    },
    sendButton: {
      backgroundColor: colors.primary,
      paddingVertical: rs(18),
      borderRadius: rs(16),
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: rs(4) },
      shadowOpacity: 0.3,
      shadowRadius: rs(8),
    },
    sendButtonDisabled: {
      backgroundColor: colors.textSecondary,
      elevation: 0,
      shadowOpacity: 0,
    },
    sendButtonText: {
      color: colors.textInverse,
      fontSize: rf(18),
      fontWeight: '700',
      marginLeft: rs(8),
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
    },
    // Country code overlay (positioned to the left of the flag/chevron)
    countryCodeOverlay: {
      position: 'absolute',
      left: rs(8),
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: rs(6),
      paddingLeft: rs(2) + 4, // added 2px more on the left side (total +4)
      paddingRight: rs(2), // tiny space so overlay text doesn't touch the flag
      zIndex: 5,
    },


    countryCodeText: {
      fontSize: rf(16),
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <MaterialIcons name="mosque" size={rf(40)} color={colors.textInverse} />
        </View>
        <Text style={styles.title}>{t('welcomeToMawqif')}</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to get started with prayer space discovery
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('phoneNumber')}</Text>
          <View style={[
            styles.phoneInputContainer,
            valid && styles.phoneInputContainerFocused
          ]}>
            {/* Overlaid country code next to the dropdown */}
            <View style={styles.countryCodeOverlay} pointerEvents="none">
              <Text style={[styles.countryCodeText, { color: colors.text }]}>
                +91
              </Text>
            </View>

            <PhoneInput
              ref={phoneInputRef}
              defaultValue={phoneNumber}
              defaultCode="IN"
              layout="first"
              onChangeText={(text) => {
                setPhoneNumber(text);
                setError(null);
              }}
              onChangeFormattedText={(text) => {
                setFormattedValue(text);
                const isValid = validatePhoneNumber(text);
                setValid(isValid);
              }}
              countryPickerProps={{
                withAlphaFilter: true,
                theme: {
                  backgroundColor: colors.surface,
                  onBackgroundTextColor: colors.text,
                  primaryColor: colors.primary,
                  primaryColorVariant: colors.primaryLight,
                  fontSize: rf(16),
                }
              }}
              disabled={isLoading}
              withDarkTheme={theme === 'dark'}
              withShadow={false}
              autoFocus={true}
              textContainerStyle={{
                backgroundColor: colors.surface,
                paddingVertical: rs(16),
                paddingLeft: rs(22), // shifted placeholder 10px to the left
              }}
              textInputStyle={[styles.phoneInput, {
                color: colors.text,
                backgroundColor: colors.surface,
                textAlign: 'left', // placeholder and typing aligned to left
              }]}
              // hide default code text to avoid duplicate display
              codeTextStyle={{ width: 0, height: 0, opacity: 0 }}
              flagButtonStyle={{
                paddingHorizontal: rs(12),
                backgroundColor: colors.surface,
                marginLeft: rs(15), // added 5px extra gap between country code overlay and flag/chevron
              }}
              containerStyle={{
                backgroundColor: colors.surface,
              }}
            />
          </View>
        </View>

        {/* Send OTP Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!valid || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSendOTP}
          disabled={!valid || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <MaterialIcons name="send" size={rf(20)} color={colors.textInverse} />
          )}
          <Text style={styles.sendButtonText}>
            {isLoading ? 'Sending...' : t('sendOTP')}
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};