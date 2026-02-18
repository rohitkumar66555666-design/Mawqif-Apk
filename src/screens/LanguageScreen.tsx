import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage, languages, LanguageCode } from '../contexts/LanguageContext';
import { rs, rf, getSafeAreaInsets } from '../utils/responsive';

interface LanguageScreenProps {
  navigation: any;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({ navigation }) => {
  const { theme, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageSelect = (selectedLanguage: LanguageCode) => {
    setLanguage(selectedLanguage);
    console.log(`Language changed to: ${selectedLanguage}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.statusBar} barStyle={colors.statusBarStyle} />
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Options */}
        <View style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                language === lang.code && { borderColor: colors.primary, borderWidth: 3 }
              ]}
              onPress={() => handleLanguageSelect(lang.code)}
            >
              <View style={styles.languageOptionContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                  <MaterialIcons name="language" size={rf(28)} color={colors.primary} />
                </View>
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text }]}>{lang.name}</Text>
                  <Text style={[styles.nativeName, { color: colors.textSecondary }]}>
                    {lang.nativeName}
                  </Text>
                </View>
                {language === lang.code && (
                  <View style={[styles.checkIcon, { backgroundColor: colors.primary }]}>
                    <MaterialIcons name="check" size={rf(20)} color={colors.textInverse} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Note */}
        <View style={[styles.infoContainer, { backgroundColor: colors.primaryLight }]}>
          <MaterialIcons name="info" size={rf(20)} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {t('languageChangesInstant')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: rs(20),
  },
  languageList: {
    marginBottom: rs(32),
  },
  languageOption: {
    borderRadius: rs(16),
    marginBottom: rs(16),
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(20),
  },
  iconContainer: {
    width: rs(56),
    height: rs(56),
    borderRadius: rs(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rs(16),
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: rf(18),
    fontWeight: '600',
    marginBottom: rs(4),
  },
  nativeName: {
    fontSize: rf(14),
    lineHeight: rf(20),
  },
  checkIcon: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: rs(16),
    borderRadius: rs(12),
    marginBottom: rs(24),
  },
  infoText: {
    fontSize: rf(14),
    marginLeft: rs(12),
    flex: 1,
    lineHeight: rf(20),
  },
});