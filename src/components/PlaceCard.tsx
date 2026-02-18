import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Place } from '../types';
import { LocationService } from '../services/location.service';
import { BookmarksService } from '../services/bookmarks.service';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserInfo, useBookmarkAuth } from '../lib/authHelper';
import { PLACE_TYPES } from '../utils/constants';
import { getResponsiveDimensions, rs, rf } from '../utils/responsive';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
  navigation?: any; // Optional navigation prop for auth
}

const { width } = Dimensions.get('window');
const responsiveDimensions = getResponsiveDimensions();

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress, navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useUserInfo();
  const { requireBookmarkAuth } = useBookmarkAuth();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  
  // Animation states for scrolling text
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const scrollAnimation = useRef(new Animated.Value(0)).current;
  
  const placeTypeLabel = t(place.type);
  const distanceText = place.distance ? LocationService.formatDistance(place.distance) : '0m';
  const walkingTime = place.distance ? LocationService.formatWalkingTime(place.distance) : '0min walk';
  
  // Check bookmark status when component mounts or user changes
  useEffect(() => {
    checkBookmarkStatus();
  }, [user, place.id]);

  // Animation effect for scrolling text
  useEffect(() => {
    if (shouldAnimate && textWidth > containerWidth) {
      const startScrolling = () => {
        scrollAnimation.setValue(0);
        Animated.sequence([
          Animated.delay(1000), // Wait 1 second before starting
          Animated.timing(scrollAnimation, {
            toValue: -(textWidth - containerWidth + 20), // Scroll to show all text + padding
            duration: Math.max(3000, (textWidth - containerWidth) * 15), // Dynamic duration based on text length
            useNativeDriver: true,
          }),
          Animated.delay(1000), // Pause at the end
          Animated.timing(scrollAnimation, {
            toValue: 0, // Return to start
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Restart the animation after a delay
          setTimeout(startScrolling, 2000);
        });
      };

      startScrolling();
    }
  }, [shouldAnimate, textWidth, containerWidth, scrollAnimation]);

  const checkBookmarkStatus = async () => {
    if (!user?.uid) {
      setIsBookmarked(false);
      return;
    }

    try {
      const bookmarked = await BookmarksService.isBookmarked(user.uid, place.id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmarkPress = async () => {
    // Check authentication first
    const proceedWithBookmark = async () => {
      if (!user?.uid) return;

      try {
        setBookmarkLoading(true);
        const newBookmarkStatus = await BookmarksService.toggleBookmark(user.uid, place.id);
        setIsBookmarked(newBookmarkStatus);
        
        const message = newBookmarkStatus ? t('bookmarkAdded') : t('bookmarkRemoved');
        // You could show a toast here instead of alert for better UX
        console.log(message);
      } catch (error) {
        console.error('Error toggling bookmark:', error);
        
        // Check if it's a table missing error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('relation "bookmarks" does not exist') || 
            errorMessage.includes('table "bookmarks" does not exist')) {
          Alert.alert(
            'Database Setup Required',
            'The bookmarks feature requires database setup. Please run the setup script in Supabase.',
            [{ text: t('ok') }]
          );
        } else {
          Alert.alert(t('error'), t('failedToUpdateBookmark'));
        }
      } finally {
        setBookmarkLoading(false);
      }
    };

    // Require authentication for bookmarking
    if (navigation) {
      requireBookmarkAuth(navigation, proceedWithBookmark);
    } else {
      proceedWithBookmark();
    }
  };
  
  // Debug logging for images and validate URL
  if (place.photo) {
    console.log(`🖼️ PlaceCard Image URL for ${place.title}:`, place.photo);
    
    // Check for invalid URL schemes
      if (place.photo.startsWith('blob:') || 
        place.photo.startsWith('file:') || 
        place.photo.startsWith('content:') ||
        place.photo.startsWith('ph:')) {
      console.warn(`⚠️ Invalid URL scheme detected for ${place.title}:`, place.photo);
      // Don't try to load invalid URLs
      place.photo = undefined;
    }
  }

  // Get amenity icons for display
  const amenities = Object.entries(place.amenities ?? {})
    .filter(([_, value]) => value)
    .map(([key, _]) => key);

  // Debug logging for amenities
  if (amenities.length > 0) {
    console.log(`🏢 ${place.title} amenities:`, amenities);
    if (amenities.includes('women_area')) {
      console.log(`👩 Women area found for: ${place.title}`);
    }
  }

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully for: ${place.title}`);
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (error: any) => {
    console.error(`❌ Image failed to load for ${place.title}:`, error.nativeEvent?.error || 'Unknown error');
    console.error(`❌ Image URL was:`, place.photo);
    setImageLoading(false);
    setImageError(true);
  };

  // Handle text measurement for animation
  const handleTextLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setTextWidth(width);
  };

  const handleContainerLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
    setShouldAnimate(textWidth > width);
  };

  // Update animation trigger when measurements change
  useEffect(() => {
    setShouldAnimate(textWidth > containerWidth && containerWidth > 0);
  }, [textWidth, containerWidth]);

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container, 
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { backgroundColor: colors.backgroundSecondary, transform: [{ scale: 0.99 }] }
      ]} 
      onPress={onPress}
      android_ripple={{ color: colors.primaryLight, borderless: false }}
    >
      {/* Top Right Section - Contains both type badge and bookmark */}
      <View style={styles.topRightSection}>
        <View style={[styles.typeBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.typeText, { color: colors.textInverse }]}>{String(t(place.type))}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookmarkButton, { 
            backgroundColor: isBookmarked ? colors.primary : colors.surface,
            borderColor: colors.border,
          }]}
          onPress={handleBookmarkPress}
          disabled={bookmarkLoading}
        >
          {bookmarkLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons 
              name={isBookmarked ? "bookmark" : "bookmark-border"} 
              size={rf(20)} 
              color={isBookmarked ? colors.textInverse : colors.textSecondary} 
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
        {place.photo && !imageError ? (
          <>
            <Image 
              source={{ uri: place.photo }} 
              style={styles.image}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="cover"
              // Removed defaultSource to prevent fallback image issues
            />
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.backgroundSecondary }]}>
            <MaterialIcons name="mosque" size={rf(24)} color={colors.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection} onLayout={handleContainerLayout}>
          <View style={styles.titleContainer}>
            <Animated.Text 
              style={[
                styles.title, 
                { color: colors.text },
                shouldAnimate && {
                  transform: [{ translateX: scrollAnimation }]
                }
              ]}
              onLayout={handleTextLayout}
              numberOfLines={shouldAnimate ? 1 : 1}
            >
              {String(place.title)}
            </Animated.Text>
          </View>
        </View>
        
        {/* Address Section - Simplified */}
        {place.address && (
          <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
            {String(place.address)}
          </Text>
        )}
        
        {/* Distance & Time Section */}
        <View style={styles.distanceSection}>
          <View style={styles.distanceRow}>
            <Text style={[styles.distance, { color: colors.text }]}>{String(distanceText)}</Text>
            <Text style={[styles.walkingTime, { color: colors.textSecondary }]}>• {String(walkingTime)}</Text>
          </View>
        </View>
        
        {/* Amenities Section - Just show icons, no +X text */}
        {amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <View style={styles.amenitiesContainer}>
              {amenities.slice(0, 3).map((amenityKey) => (
                <View key={amenityKey} style={[styles.amenityBadge, { backgroundColor: colors.background }]}>
                  {amenityKey === 'wuzu' && <MaterialIcons name="water-drop" size={rf(14)} color={colors.textSecondary} />}
                  {amenityKey === 'washroom' && <MaterialIcons name="bathroom" size={rf(14)} color={colors.textSecondary} />}
                  {amenityKey === 'women_area' && <MaterialIcons name="female" size={rf(14)} color={colors.textSecondary} />}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.arrow}>
        <Feather name="chevron-right" size={rf(26)} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: responsiveDimensions.cardBorderRadius,
    padding: rs(16), // Reduced from 20 to remove excess padding
    marginHorizontal: responsiveDimensions.cardMargin,
    marginVertical: rs(8), // Reduced from 10
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(3) },
    shadowOpacity: 0.12,
    shadowRadius: rs(6),
    minHeight: rs(120), // Reduced from 130 for tighter layout
  },
  imageContainer: {
    width: rs(80), // Fixed size instead of percentage for consistency
    height: rs(80), // Fixed height to match width
    borderRadius: rs(12), // Subtle rounded corners
    overflow: 'hidden',
    elevation: 2, // Reduced elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: rf(10),
    marginTop: rs(4),
    textAlign: 'center',
  },

  content: {
    flex: 1,
    marginLeft: rs(16), // Reduced from 20
    paddingVertical: rs(4), // Reduced from 6
    justifyContent: 'space-between',
  },
  
  // Organized Content Sections
  titleSection: {
    marginBottom: rs(10),
    paddingRight: rs(120), // Add padding to prevent overlap with badges
    overflow: 'hidden', // Hide overflowing text during animation
  },
  titleContainer: {
    overflow: 'hidden',
  },
  title: {
    fontSize: rf(20),
    fontWeight: '600',
    lineHeight: rf(28), // Increased line height for readability
    letterSpacing: 0.2, // Reduced letter spacing
  },
  
  addressText: {
    fontSize: rf(13),
    fontWeight: '400', // Reduced from 500 for cleaner hierarchy
    lineHeight: rf(18), // Increased line height
    opacity: 0.7,
  },
  
  distanceSection: {
    marginBottom: rs(12),
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  distance: {
    fontSize: rf(14),
    fontWeight: '600',
    letterSpacing: 0.2,
    color: undefined, // Remove primary color, will use text color from component
  },
  walkingTime: {
    fontSize: rf(12),
    fontWeight: '500',
    opacity: 0.6, // Reduced from 0.7 to make it more secondary
  },
  
  amenitiesSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    gap: rs(6),
    flexWrap: 'wrap',
  },
  amenityBadge: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(5),
    borderRadius: rs(12),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: rs(28),
    height: rs(26),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  moreAmenities: {
    fontSize: rf(11),
    fontWeight: '600',
  },
  topRightSection: {
    position: 'absolute',
    top: rs(12),
    right: rs(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    zIndex: 10,
  },
  
  typeBadge: {
    paddingHorizontal: rs(10),
    paddingVertical: rs(6),
    borderRadius: rs(20),
  },
  typeText: {
    fontSize: rf(10),
    fontWeight: '600', // Reduced from 800 to make it less prominent
    textTransform: 'uppercase',
    letterSpacing: 0.6, // Reduced from 0.8
  },

  arrow: {
    justifyContent: 'center',
    alignItems: 'center',
    width: rs(28),
  },

  // Bookmark Button - Now in top right section
  bookmarkButton: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.2,
    shadowRadius: rs(4),
  },

});
