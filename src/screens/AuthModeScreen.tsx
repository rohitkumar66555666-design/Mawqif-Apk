import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuthStore } from '../lib/authStore';
import { rf, rs } from '../utils/responsive';

interface AuthModeScreenProps {
  navigation: any;
}

export const AuthModeScreen: React.FC<AuthModeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { authMode, setAuthMode } = useAuthStore();

  const handleModeChange = (mode: 'dev' | 'firebase') => {
    if (mode === 'firebase') {
      Alert.alert(
        'Switch to Firebase Mode',
        'This will enable real SMS OTP. Make sure you have configured Firebase properly in the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            onPress: () => {
              setAuthMode(mode);
              Alert.alert('Success', 'Switched to Firebase mode. Real SMS will be sent for OTP verification.');
            },
          },
        ]
      );
    } else {
      setAuthMode(mode);
      Alert.alert('Success', 'Switched to Development mode. Mock OTP will be generated for testing.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: rs(20),
      paddingVertical: rs(15),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: rs(15),
    },
    headerTitle: {
      fontSize: rf(18),
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: rs(20),
    },
    sectionTitle: {
      fontSize: rf(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: rs(10),
    },
    description: {
      fontSize: rf(14),
      color: colors.textSecondary,
      marginBottom: rs(20),
      lineHeight: rf(20),
    },
    modeCard: {
      backgroundColor: colors.surface,
      borderRadius: rs(12),
      padding: rs(16),
      marginBottom: rs(12),
      borderWidth: 2,
    },
    activeModeCard: {
      borderColor: colors.primary,
    },
    inactiveModeCard: {
      borderColor: colors.border,
    },
    modeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: rs(8),
    },
    modeTitle: {
      fontSize: rf(16),
      fontWeight: '600',
      color: colors.text,
    },
    activeIndicator: {
      backgroundColor: colors.primary,
      paddingHorizontal: rs(8),
      paddingVertical: rs(4),
      borderRadius: rs(12),
    },
    activeText: {
      fontSize: rf(12),
      color: colors.surface,
      fontWeight: '500',
    },
    modeDescription: {
      fontSize: rf(14),
      color: colors.textSecondary,
      lineHeight: rf(18),
    },
    warningCard: {
      backgroundColor: colors.warning + '20',
      borderColor: colors.warning,
      borderWidth: 1,
      borderRadius: rs(8),
      padding: rs(12),
      marginTop: rs(20),
    },
    warningText: {
      fontSize: rf(14),
      color: colors.warning,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Select how you want to handle phone number verification in the app. 
          You can switch between development mode (for testing) and Firebase mode (for production).
        </Text>

        {/* Development Mode */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            authMode === 'dev' ? styles.activeModeCard : styles.inactiveModeCard,
          ]}
          onPress={() => handleModeChange('dev')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeTitle}>🧪 Development Mode</Text>
            {authMode === 'dev' && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.modeDescription}>
            Uses mock OTP for testing. No real SMS is sent. Perfect for development and testing. 
            The generated OTP will be shown in an alert for easy testing.
          </Text>
        </TouchableOpacity>

        {/* Firebase Mode */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            authMode === 'firebase' ? styles.activeModeCard : styles.inactiveModeCard,
          ]}
          onPress={() => handleModeChange('firebase')}
        >
          <View style={styles.modeHeader}>
            <Text style={styles.modeTitle}>🔥 Firebase Mode</Text>
            {authMode === 'firebase' && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.modeDescription}>
            Uses real Firebase Authentication with SMS OTP. Requires proper Firebase configuration. 
            Real SMS messages will be sent to users' phone numbers.
          </Text>
        </TouchableOpacity>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ Make sure Firebase is properly configured before switching to Firebase mode. 
            Check firebaseConfig.ts and replace placeholder values with your Firebase project settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};