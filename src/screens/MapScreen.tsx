import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { rs, rf } from "../utils/responsive";

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: rs(24),
    },
    iconContainer: {
      width: rs(120),
      height: rs(120),
      borderRadius: rs(60),
      backgroundColor: colors.primary + '20',
      justifyContent: "center",
      alignItems: "center",
      marginBottom: rs(24),
    },
    title: {
      fontSize: rf(24),
      fontWeight: "700",
      color: colors.text,
      marginBottom: rs(12),
      textAlign: "center",
    },
    subtitle: {
      fontSize: rf(16),
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: rf(24),
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.iconContainer}>
        <MaterialIcons name="map" size={rs(60)} color={colors.primary} />
      </View>
      
      <Text style={styles.title}>{t('comingSoon')}</Text>
      <Text style={styles.subtitle}>
        Map feature with directions and navigation will be available soon!
      </Text>
    </View>
  );
};

export default MapScreen;
