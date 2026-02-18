import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Place, Location } from "../types";
import { PlaceCard } from "../components/PlaceCard";
import { SearchBar } from "../components/SearchBar";
import { FilterModal, FilterOptions } from "../components/FilterModal";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

import { LocationService } from "../services/location.service";
import { PlacesService } from "../services/places.service";
import { ImageUploadService } from "../services/image-upload.service";
import { getResponsiveDimensions, rs, rf } from "../utils/responsive";
import { ImageDebugger } from "../utils/imageDebug";

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme, colors } = useTheme();
  const { t } = useLanguage();
  const [places, setPlaces] = useState<Place[]>([]);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false); // Track if we've loaded data successfully

  const [filters, setFilters] = useState<FilterOptions>({
    createdTime: null,
    rating: null,
    womenArea: false,
    radius: 5000, // Default 5km radius
    capacity: null,
    placeType: null,
  });

  useEffect(() => {
    initializeLocation();
  }, []);

  // Debounced search effect to prevent keyboard dismissal
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300); // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  useEffect(() => {
    if (userLocation && !hasLoadedData) {
      console.log('🎯 First time loading places for user location');
      fetchNearbyPlaces();
    } else if (userLocation && hasLoadedData) {
      console.log('🔒 User location changed but data already loaded - PRESERVING distances');
    }
  }, [userLocation]);

  useEffect(() => {
    // Apply filters and search whenever they change
    applyFiltersAndSearch();
  }, [allPlaces, filters, debouncedSearchText]); // Use debouncedSearchText instead of searchText

  // Determine whether any filter is active so we can show an indicator on the filter button
  const filtersActive = useMemo(() => {
    return !!(
      filters.createdTime ||
      filters.rating ||
      filters.womenArea === true ||
      (filters.radius !== null && filters.radius !== undefined) ||
      filters.capacity ||
      filters.placeType
    );
  }, [filters]);

  const initializeLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const hasPermission = await LocationService.requestPermission();
      if (!hasPermission) {
        setError(t('locationPermissionRequired'));
        setLoading(false);
        return;
      }

      // Get current location
      const location = await LocationService.getCurrentLocation();
      setUserLocation(location);

      // Proactive caching disabled to prevent interference with distance preservation
      console.log('📱 Proactive caching disabled - focusing on distance preservation');

    } catch (err) {
      console.error("Error initializing location:", err);
      setError(t('unableToGetLocation'));
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async (forceRefresh: boolean = false) => {
    if (!userLocation) return;

    // Only skip reload if we have data AND it's not a forced refresh AND not the initial load
    if (hasLoadedData && !forceRefresh && allPlaces.length > 0) {
      console.log(`🔒 PRESERVING existing ${allPlaces.length} places - NO RELOAD`);
      return;
    }

    try {
      setError(null);
      console.log(`🔄 Loading places from Supabase...`);
      
      // Always fetch fresh data from Supabase
      const nearbyPlaces = await PlacesService.getNearbyPlaces(
        userLocation,
        100000 // Increased radius to 100km to catch more places
      );
      
      console.log(`📊 Fetched ${nearbyPlaces.length} places from database`);
      
      if (nearbyPlaces.length > 0) {
        console.log(`✅ Loaded ${nearbyPlaces.length} fresh places with distances`);
        console.log(`📍 Sample places:`, nearbyPlaces.slice(0, 3).map(p => `${p.title} (${p.distance}m)`));
        
        // Debug image URLs for first 3 places
        console.log('🖼️ Debugging image URLs...');
        nearbyPlaces.slice(0, 3).forEach(place => {
          ImageDebugger.logImageInfo(place.title, place.photo);
        });
        
        setAllPlaces(nearbyPlaces);
        setHasLoadedData(true);
      } else {
        console.log(`⚠️ No places found in database`);
        setAllPlaces([]);
        setError(t('noPlacesInArea'));
      }

    } catch (err) {
      console.error("❌ Error fetching places:", err);
      setError(t('noInternetConnection'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...allPlaces];

    // Search filter (city, title, address) - use debounced search text
    if (debouncedSearchText.trim()) {
      const searchLower = debouncedSearchText.toLowerCase();
      filtered = filtered.filter(
        (place) =>
          place.title.toLowerCase().includes(searchLower) ||
          place.city.toLowerCase().includes(searchLower) ||
          (place.address && place.address.toLowerCase().includes(searchLower))
      );
    }

    // Radius filter - be more lenient with missing distance data
    if (filters.radius && userLocation) {
      filtered = filtered.filter(
        (place) => {
          if (!place.distance && place.distance !== 0) {
            return true; // Include places without distance data
          }
          // Ensure distance is in meters for comparison
          const distanceInMeters = place.distance;
          const withinRadius = distanceInMeters <= filters.radius!;
          return withinRadius;
        }
      );
    }

    // Place type filter
    if (filters.placeType) {
      filtered = filtered.filter((place) => place.type === filters.placeType);
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(
        (place) => place.avg_rating && place.avg_rating >= filters.rating!
      );
    }

    // Women's area filter
    if (filters.womenArea) {
      filtered = filtered.filter(
        (place) => place.amenities?.women_area === true
      );
    }

    // Capacity filter
    if (filters.capacity) {
      filtered = filtered.filter(
        (place) => place.capacity && place.capacity >= filters.capacity!
      );
    }

    // Created time filter
    if (filters.createdTime) {
      const now = new Date();

      switch (filters.createdTime) {
        case "hour":
          filtered = filtered.filter((place) => {
            if (!place.created_at) return false;
            const placeDate = new Date(place.created_at);
            const diffHours = Math.abs(
              (now.getTime() - placeDate.getTime()) / (1000 * 60 * 60)
            );
            return diffHours <= 1;
          });
          break;
        case "day":
          filtered = filtered.filter((place) => {
            if (!place.created_at) return false;
            const placeDate = new Date(place.created_at);
            const diffDays = Math.abs(
              Math.ceil(
                (now.getTime() - placeDate.getTime()) / (1000 * 60 * 60 * 24)
              )
            );
            return diffDays <= 1;
          });
          break;
        case "week":
          filtered = filtered.filter((place) => {
            if (!place.created_at) return false;
            const placeDate = new Date(place.created_at);
            const diffDays = Math.abs(
              Math.ceil(
                (now.getTime() - placeDate.getTime()) / (1000 * 60 * 60 * 24)
              )
            );
            return diffDays <= 7;
          });
          break;
        case "month":
          filtered = filtered.filter((place) => {
            if (!place.created_at) return false;
            const placeDate = new Date(place.created_at);
            const diffDays = Math.abs(
              Math.ceil(
                (now.getTime() - placeDate.getTime()) / (1000 * 60 * 60 * 24)
              )
            );
            return diffDays <= 30;
          });
          break;
      }
    }

    setPlaces(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userLocation) {
      fetchNearbyPlaces(true); // Force refresh when user pulls to refresh
    } else {
      initializeLocation();
    }
  };

  // Memoized render function for PlaceCard to prevent unnecessary re-renders
  const renderPlaceCard = useCallback(({ item }: { item: Place }) => (
    <PlaceCard place={item} onPress={() => handlePlacePress(item)} navigation={navigation} />
  ), [navigation]);

  const handlePlacePress = useCallback((place: Place) => {
    navigation.navigate("PlaceDetail", { placeId: place.id });
  }, [navigation]);

  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);



  const handleApplyFilters = (appliedFilters: FilterOptions) => {
    setFilters(appliedFilters);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="location-on" size={rf(56)} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noPrayerSpaces')}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {filters.radius 
          ? t('noPlacesWithinRadius').replace('{radius}', (filters.radius / 1000).toString())
          : t('noPlacesInArea')
        }
      </Text>
      <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
        {t('tapAddPlace')}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <MaterialIcons name="error" size={rf(56)} color={colors.error} />
      </View>
      <Text style={[styles.errorTitle, { color: colors.error }]}>{t('unableToLoad')}</Text>
      <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>{error}</Text>
      <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={onRefresh}>
        <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>{t('tryAgain')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <StatusBar backgroundColor={colors.statusBar} barStyle={colors.statusBarStyle} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <MaterialIcons name="my-location" size={rf(56)} color={colors.primary} />
          </View>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('findingLocation')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar backgroundColor={colors.statusBar} barStyle={colors.statusBarStyle} />
      
      {/* Fixed SearchBar outside of FlatList to prevent re-rendering */}
      <SearchBar
        value={searchText}
        onChangeText={handleSearchTextChange}
        onFilterPress={handleFilterPress}
        filtersActive={filtersActive}
      />

      {error && !places.length ? (
        renderErrorState()
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaceCard}
          getItemLayout={(data, index) => ({
            length: 130, // Approximate height of PlaceCard
            offset: 130 * index,
            index,
          })}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.surface}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />



    </View>
  );
};

const responsiveDimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIconContainer: {
    marginBottom: rs(16),
  },
  loadingText: {
    fontSize: rf(16),
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(32),
  },
  emptyIconContainer: {
    marginBottom: rs(16),
  },
  emptyTitle: {
    fontSize: rf(18),
    fontWeight: "600",
    marginBottom: rs(8),
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: rf(14),
    textAlign: "center",
    marginBottom: rs(16),
  },
  emptyHint: {
    fontSize: rf(13),
    textAlign: "center",
    fontStyle: "italic",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: rs(32),
  },
  errorIconContainer: {
    marginBottom: rs(16),
  },
  errorTitle: {
    fontSize: rf(18),
    fontWeight: "600",
    marginBottom: rs(8),
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: rf(14),
    textAlign: "center",
    marginBottom: rs(24),
  },
  retryButton: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    borderRadius: rs(24),
  },
  retryButtonText: {
    fontSize: rf(16),
    fontWeight: "600",
  },
});
