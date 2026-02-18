import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { PLACE_TYPES } from "../utils/constants";
import { rf } from "../utils/responsive";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  createdTime?: "hour" | "day" | "week" | "month" | null;
  rating?: number | null;
  womenArea?: boolean;
  radius?: number | null; // Allow null to disable radius filter
  capacity?: number | null;
  placeType?: string | null;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: rf(24),
      fontWeight: "700",
    },

    resetButton: {
      fontSize: rf(16),
      fontWeight: "600",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    filterSection: {
      marginBottom: 32,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: rf(18),
      fontWeight: "700",
      marginLeft: 10,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    ratingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 28,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      minWidth: 70,
      minHeight: 48,
      justifyContent: 'center',
    },
    ratingButtonActive: {
    },
    ratingButtonText: {
      fontSize: rf(16),
      fontWeight: "600",
      marginLeft: 8,
    },
    ratingButtonTextActive: {
    },
    filterButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonGroup: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
    },
    filterButton: {
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 28,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      fontSize: rf(16),
      fontWeight: "600",
      marginLeft: 4,
      color: colors.text,
    },
    filterButtonTextActive: {
      color: colors.textInverse,
    },
    radiusInfo: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 16,
    },
    radiusValue: {
      fontSize: rf(24),
      fontWeight: "700",
      marginRight: 10,
    },
    radiusKm: {
      fontSize: rf(16),
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderTopWidth: 1,
    },
    applyButton: {
      paddingVertical: 20,
      borderRadius: 16,
      alignItems: "center",
      elevation: 4,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      minHeight: 56,
    },
    applyButtonText: {
      fontSize: rf(18),
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: FilterOptions = {
      createdTime: null,
      rating: null,
      womenArea: false,
      radius: 5000,
      capacity: null,
      placeType: null,
    };
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={rf(32)} color={colors.textInverse} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textInverse }]}>{t('filters')}</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={[styles.resetButton, { color: colors.textInverse }]}>{t('reset')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Place Added Filter */}
          <View style={styles.filterSection}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="schedule" size={rf(20)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('placeAdded')}</Text>
            </View>
            <View style={styles.buttonGroup}>
              {[
                { label: t('lastHour'), value: "hour" },
                { label: t('lastDay'), value: "day" },
                { label: t('lastWeek'), value: "week" },
                { label: t('lastMonth'), value: "month" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterButton,
                    filters.createdTime === option.value &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      createdTime:
                        filters.createdTime === option.value
                          ? null
                          : (option.value as any),
                    })
                  }
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.createdTime === option.value &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterSection}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="star" size={rf(20)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('minimumRating')}</Text>
            </View>
            <View style={styles.buttonGroup}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={[
                    styles.ratingButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    filters.rating === star && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      rating: filters.rating === star ? null : star,
                    })
                  }
                >
                  <MaterialIcons 
                    name="star" 
                    size={rf(20)} 
                    color={filters.rating === star ? colors.textInverse : "#F59E0B"} 
                  />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      { color: colors.text },
                      filters.rating === star && { color: colors.textInverse },
                    ]}
                  >
                    {star}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Women's Area Filter */}
          <View style={styles.filterSection}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="woman" size={rf(20)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('womenAreaFilter')}</Text>
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  filters.womenArea === true && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() =>
                  setFilters({
                    ...filters,
                    womenArea: filters.womenArea === true ? false : true,
                  })
                }
              >
                <View style={styles.filterButtonContent}>
                  <MaterialIcons name="check" size={rf(18)} color={filters.womenArea === true ? colors.textInverse : colors.success} />
                  <Text
                    style={[
                      styles.filterButtonText,
                      { color: colors.text },
                      filters.womenArea === true && { color: colors.textInverse },
                    ]}
                  >
                    {t('yes')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.womenArea === false && styles.filterButtonActive,
                ]}
                onPress={() =>
                  setFilters({
                    ...filters,
                    womenArea: false,
                  })
                }
              >
                <View style={styles.filterButtonContent}>
                  <MaterialIcons name="close" size={rf(18)} color={filters.womenArea === false ? colors.textInverse : colors.error} />
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.womenArea === false &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {t('no')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Radius Filter */}
          <View style={styles.filterSection}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="location-on" size={rf(20)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('searchRadius')}</Text>
            </View>
            <View style={styles.radiusInfo}>
              <Text style={[styles.radiusValue, { color: colors.primary }]}>{filters.radius || 5000}m</Text>
              <Text style={[styles.radiusKm, { color: colors.textSecondary }]}>
                ({((filters.radius || 5000) / 1000).toFixed(1)}km)
              </Text>
            </View>
            <View style={styles.buttonGroup}>
              {[500, 1000, 2000, 3000, 5000].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.filterButton,
                    filters.radius === radius && styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      radius: radius,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.radius === radius &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Capacity Filter */}
          <View style={styles.filterSection}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="group" size={rf(20)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('capacity')}</Text>
            </View>
            <View style={styles.buttonGroup}>
              {[50, 100, 150, 200, 300, 400].map((capacity) => (
                <TouchableOpacity
                  key={capacity}
                  style={[
                    styles.filterButton,
                    filters.capacity === capacity && styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      capacity: filters.capacity === capacity ? null : capacity,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.capacity === capacity &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {capacity}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Place Type Filter */}
          <View style={styles.filterSection}>
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="business" size={rf(20)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('typeOfPlaceFilter')}</Text>
            </View>
            <View style={styles.buttonGroup}>
              {PLACE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.filterButton,
                    filters.placeType === type.value &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setFilters({
                      ...filters,
                      placeType:
                        filters.placeType === type.value ? null : type.value,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.placeType === type.value &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {t(type.value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={[styles.applyButton, { backgroundColor: colors.primary }]} onPress={handleApply}>
            <Text style={[styles.applyButtonText, { color: colors.textInverse }]}>{t('applyFilters')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
