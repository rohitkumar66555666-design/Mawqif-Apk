import React, { useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity as RNTouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from "react-native";
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { getResponsiveDimensions, rs, rf } from "../utils/responsive";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
  filtersActive?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(({
  value,
  onChangeText,
  onFilterPress,
  placeholder,
  filtersActive,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  
  const defaultPlaceholder = placeholder || t('searchPlaceholder');
  
  // Animation values for filter button and badge
  const buttonScale = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(filtersActive ? 1 : 0)).current;
  const badgeOpacity = badgeScale.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const AnimatedTouchable = Animated.createAnimatedComponent(RNTouchableOpacity);

  useEffect(() => {
    if (filtersActive) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(buttonScale, { toValue: 1.08, duration: 150, useNativeDriver: true }),
          Animated.spring(buttonScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]),
        Animated.spring(badgeScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(badgeScale, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(buttonScale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [filtersActive]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={[styles.searchInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <MaterialIcons name="search" size={rf(24)} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={defaultPlaceholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <AnimatedTouchable
        style={[styles.filterButton, { backgroundColor: colors.primary, transform: [{ scale: buttonScale }] }]}
        onPress={onFilterPress}
        accessibilityLabel={t('filters') || 'Filters'}
        accessibilityRole="button"
      >
        {/* Explicit white icon to ensure visibility on all themes */}
        <Feather name="filter" size={rf(20)} color={colors.textInverse || '#fff'} />

        {/* Animated Active badge */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: rs(6),
            right: rs(6),
            width: rs(10),
            height: rs(10),
            borderRadius: rs(5),
            backgroundColor: colors.textInverse || '#fff',
            borderWidth: 1,
            borderColor: colors.background,
            transform: [{ scale: badgeScale }],
            opacity: badgeOpacity,
          }}
        />
      </AnimatedTouchable>
    </View>
  );
});

const responsiveDimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderBottomWidth: 1,
    gap: rs(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.08,
    shadowRadius: rs(3),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: rs(24),
    paddingHorizontal: rs(12),
    borderWidth: 1.5,
    minHeight: responsiveDimensions.inputHeight,
  },
  searchIcon: {
    marginRight: rs(8),
  },
  searchInput: {
    flex: 1,
    paddingVertical: rs(10),
    fontSize: rf(16),
    fontWeight: '500',
  },
  filterButton: {
    width: responsiveDimensions.buttonHeight,
    height: responsiveDimensions.buttonHeight,
    borderRadius: responsiveDimensions.buttonHeight / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.15,
    shadowRadius: rs(3),
  },

});
