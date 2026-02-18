import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { rs, rf } from '../utils/responsive';

interface CustomHeaderProps {
  navigation: any;
  title?: string;
  subtitle?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  navigation,
  title = "Mawqif",
  subtitle = "Your prayer spaces hub"
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { theme, colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const styles = React.useMemo(() => StyleSheet.create({
    header: {
      paddingTop: insets.top + rs(6),
      paddingBottom: rs(10),
      paddingHorizontal: rs(16),
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: rs(4) },
      shadowOpacity: 0.3,
      shadowRadius: rs(8),
      position: 'relative',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.6,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1,
      minHeight: rs(44),
      marginTop: rs(4),
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logoContainer: {
      width: rs(38),
      height: rs(38),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: rs(11),
    },
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: rf(19),
      fontWeight: '700',
      letterSpacing: 0.4,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    subtitle: {
      fontSize: rf(10.5),
      marginTop: rs(1.5),
      fontWeight: '500',
      letterSpacing: 0.3,
    },
    menuButton: {
      width: rs(38),
      height: rs(38),
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
      width: screenWidth * 0.85,
      height: screenHeight,
      elevation: 16,
      shadowColor: '#000',
      shadowOffset: { width: rs(-4), height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: rs(8),
    },
    menuHeader: {
      paddingTop: insets.top + rs(20),
      paddingBottom: rs(20),
      paddingHorizontal: rs(20),
      borderBottomWidth: 1,
    },
    menuHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    menuLogoContainer: {
      width: rs(48),
      height: rs(48),
      borderRadius: rs(24),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: rs(12),
    },
    menuTitle: {
      fontSize: rf(20),
      fontWeight: '700',
      marginBottom: rs(2),
    },
    menuSubtitle: {
      fontSize: rf(13),
    },
    closeButton: {
      width: rs(36),
      height: rs(36),
      borderRadius: rs(18),
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuItems: {
      flex: 1,
      paddingTop: rs(8),
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: rs(16),
      paddingHorizontal: rs(20),
      borderBottomWidth: 1,
    },
    menuItemIcon: {
      width: rs(44),
      height: rs(44),
      borderRadius: rs(22),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: rs(16),
    },
    menuItemContent: {
      flex: 1,
    },
    menuItemTitle: {
      fontSize: rf(16),
      fontWeight: '600',
      marginBottom: rs(2),
    },
    menuItemSubtitle: {
      fontSize: rf(13),
    },
    menuFooter: {
      paddingVertical: rs(20),
      paddingHorizontal: rs(20),
      borderTopWidth: 1,
      alignItems: 'center',
    },
    footerText: {
      fontSize: rf(12),
      marginBottom: rs(4),
    },
    footerSubtext: {
      fontSize: rf(11),
    },
  }), [insets.top, colors]);

  const openMenu = () => {
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const menuItems = [
    {
      icon: 'person',
      title: t('profile'),
      subtitle: t('accountAndSettings'),
      onPress: () => {
        closeMenu();
        navigation.navigate('Profile');
      }
    },
    {
      icon: 'dashboard',
      title: t('dashboard'),
      subtitle: t('hostManagement'),
      onPress: () => {
        closeMenu();
        navigation.navigate('Dashboard');
      }
    },
    {
      icon: 'settings',
      title: t('settings'),
      subtitle: 'Theme and language preferences',
      onPress: () => {
        closeMenu();
        navigation.navigate('Settings');
      }
    }
  ];

  return (
    <>
      <StatusBar backgroundColor={colors.statusBar} barStyle={colors.statusBarStyle} />
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        {/* Gradient overlay effect using multiple Views */}
        <View style={[styles.gradientOverlay, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]} />
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="mosque" size={rf(25)} color={colors.textInverse} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.textInverse }]}>{t('appName')}</Text>
              <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>{t('appSubtitle')}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openMenu}
            activeOpacity={0.7}
          >
            <MaterialIcons name="menu" size={rf(27)} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeMenu}
          />
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.menuHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
              <View style={styles.menuHeaderContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[styles.menuLogoContainer, { backgroundColor: colors.primaryLight }]}>
                    <MaterialIcons name="mosque" size={rf(32)} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>{t('appName')}</Text>
                    <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{t('appSubtitle')}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: colors.background }]}
                  onPress={closeMenu}
                >
                  <MaterialIcons name="close" size={rf(24)} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, { borderBottomColor: colors.border }]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuItemIcon, { backgroundColor: colors.primaryLight }]}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={rf(24)}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={rf(20)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}

              {/* Host Section Removed */}
            </View>

            <View style={[styles.menuFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
              <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>Made with ❤️ for the Muslim community</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};