import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { rs, rf } from '../utils/responsive';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const settingsItems = [
    {
      icon: 'palette',
      title: t('theme'),
      subtitle: t('appAppearance'),
      onPress: () => navigation.navigate('Theme'),
    },
    {
      icon: 'language',
      title: t('language'),
      subtitle: t('changeLanguage'),
      onPress: () => navigation.navigate('Language'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: rs(36),
      paddingBottom: rs(10),
      paddingHorizontal: rs(20),
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: rs(2) },
      shadowOpacity: 0.2,
      shadowRadius: rs(4),
    },
    backButton: {
      width: rs(38),
      height: rs(38),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: rs(4),
    },
    headerTitle: {
      fontSize: rf(19),
      fontWeight: '700',
      color: colors.textInverse,
      marginBottom: rs(1),
    },
    headerSubtitle: {
      fontSize: rf(11),
      color: 'rgba(255, 255, 255, 0.9)',
    },
    content: {
      flex: 1,
    },
    section: {
      marginTop: rs(20),
      backgroundColor: colors.surface,
      marginHorizontal: rs(16),
      borderRadius: rs(12),
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: rs(2) },
      shadowOpacity: 0.1,
      shadowRadius: rs(4),
    },
    sectionTitle: {
      fontSize: rf(13),
      fontWeight: '600',
      color: colors.textSecondary,
      paddingHorizontal: rs(20),
      paddingTop: rs(20),
      paddingBottom: rs(8),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: rs(16),
      paddingHorizontal: rs(20),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingItemLast: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: rs(44),
      height: rs(44),
      borderRadius: rs(22),
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: rs(16),
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: rf(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: rs(2),
    },
    settingSubtitle: {
      fontSize: rf(13),
      color: colors.textSecondary,
    },
    chevron: {
      marginLeft: rs(8),
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={rf(24)} color={colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <Text style={styles.headerSubtitle}>Customize your app experience</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingItem,
                index === settingsItems.length - 1 && styles.settingItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name={item.icon as any}
                  size={rf(24)}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={rf(24)}
                color={colors.textSecondary}
                style={styles.chevron}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
