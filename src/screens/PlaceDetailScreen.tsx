import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import { Place, Review, ReviewSortOption } from "../types";
import { PlacesService } from "../services/places.service";
import { ReviewsService } from "../services/reviews.service";
import { ReviewReportsService } from "../services/review-reports.service";
import { BookmarksService } from "../services/bookmarks.service";
import { LocationService } from "../services/location.service";
import { useUserInfo } from "../lib/authHelper";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { PLACE_TYPES } from "../utils/constants";
import { getResponsiveDimensions, rs, rf } from "../utils/responsive";
import { ReviewsSection } from "../components/ReviewsSection";
import { ImageCarousel } from "../components/ImageCarousel";
import { useDirectionsAuth, useWhatsAppAuth, useBookmarkAuth } from "../lib/authHelper";




interface PlaceDetailScreenProps {
  route: {
    params: {
      placeId: string;
    };
  };
  navigation: any;
}



const responsiveDimensions = getResponsiveDimensions();
const { width: screenWidth } = Dimensions.get('window');

export const PlaceDetailScreen: React.FC<PlaceDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { placeId } = route.params;
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { requireDirectionsAuth } = useDirectionsAuth();
  const { requireWhatsAppAuth } = useWhatsAppAuth();
  const { requireBookmarkAuth } = useBookmarkAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>('newest');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const buttonScale = new Animated.Value(1);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { user, isAuthenticated, getUserDisplayName } = useUserInfo();

  // Use authenticated user ID or fallback
  const currentUserId = user?.uid || 'current_user_123';

  // Test database connection on component mount
  useEffect(() => {
    const testDatabase = async () => {
      try {
        console.log('🔄 Starting database diagnostics...');
        await ReviewsService.testConnection();
        console.log('✅ All database tests passed!');
      } catch (error) {
        console.error('❌ DATABASE SETUP ISSUE:', error);
        
        // Show user-friendly error message
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
        
        if (errorMessage.includes('REVIEWS TABLE MISSING')) {
          Alert.alert(
            'Database Setup Required',
            'The reviews system needs to be set up. Please run the SQL setup file in your Supabase dashboard.',
            [{ text: t('ok') || 'OK' }]
          );
        } else if (errorMessage.includes('NO PLACES IN DATABASE')) {
          Alert.alert(
            'No Places Found',
            'You need to add some places to your database before you can review them.',
            [{ text: t('ok') || 'OK' }]
          );
        } else {
          Alert.alert(
            'Database Connection Issue',
            `There's an issue with the database: ${errorMessage}`,
            [{ text: t('ok') || 'OK' }]
          );
        }
      }
    };
    
    testDatabase();
  }, []);

  // Refresh authentication state when screen comes into focus
  // Header configuration is now handled by navigator

  // Star Rating Component - Professional star icons instead of emojis
  const renderStarRating = (rating: number, reviewCount?: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Professional star rating - Perfect size for visibility
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialIcons key={`full-${i}`} name="star" size={rf(22)} color="#F59E0B" style={styles.starIcon} />
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <MaterialIcons key="half" name="star-half" size={rf(22)} color="#F59E0B" style={styles.starIcon} />
      );
    }
    
    // Empty stars with subtle gray
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialIcons key={`empty-${i}`} name="star-outline" size={rf(22)} color="#D1D5DB" style={styles.starIcon} />
      );
    }
    
    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {stars}
        </View>
        <Text style={styles.ratingText}>
          {rating > 0 ? rating.toFixed(1) : '0.0'} {
            reviewCount === 0 ? `(${t('noReviewsYet') || 'No reviews yet'})` : 
            reviewCount === 1 ? `(1 ${t('review') || 'review'})` : 
            reviewCount ? `(${reviewCount} ${t('reviews') || 'reviews'})` : `(${t('noReviewsYet') || 'No reviews yet'})`
          }
        </Text>
      </View>
    );
  };

  useEffect(() => {
    fetchPlaceDetails();
    fetchReviews();
    checkBookmarkStatus();
  }, [placeId]);

  useEffect(() => {
    if (reviewSort) {
      fetchReviews();
    }
  }, [reviewSort]);

  // Check bookmark status when user changes
  useEffect(() => {
    checkBookmarkStatus();
  }, [user]);

  const checkBookmarkStatus = async () => {
    if (!user?.uid || !placeId) {
      setIsBookmarked(false);
      return;
    }

    try {
      const bookmarked = await BookmarksService.isBookmarked(user.uid, placeId);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const fetchPlaceDetails = async () => {
    try {
      const placeData = await PlacesService.getPlaceById(placeId);
      setPlace(placeData);
    } catch (error) {
      console.error("Error fetching place details:", error);
      Alert.alert(t('error') || 'Error', t('unableToLoad') || 'Unable to load place details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const reviewsData = await ReviewsService.getReviewsForPlace(placeId, reviewSort, 50, currentUserId);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      // Keep existing reviews or show empty state
      setReviews([]);
    }
  };

  const handleGetDirections = () => {
    if (!place) return;

    // Check authentication first
    const proceedWithDirections = () => {
      // Add button press animation
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const url = `geo:${place.latitude},${place.longitude}?q=${place.latitude},${place.longitude}(${place.title})`;

      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            Alert.alert(t('error') || 'Error', "Unable to open maps application");
          }
        })
        .catch((err) => {
          console.error("Error opening maps:", err);
          Alert.alert(t('error') || 'Error', "Unable to open directions");
        });
    };

    // Require authentication for directions
    requireDirectionsAuth(navigation, proceedWithDirections);
  };

  const handleCall = () => {
    // Check if place has contact phone from owner's profile
    if (!place?.contact_phone) {
      Alert.alert(
        "No Contact Number", 
        "The place owner hasn't provided a contact number yet.",
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    const phoneUrl = `tel:${place.contact_phone}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert(t('error') || 'Error', "Unable to make phone calls");
        }
      })
      .catch((err) => {
        console.error("Error making call:", err);
        Alert.alert(t('error') || 'Error', "Unable to make call");
      });
  };

  const handleWhatsApp = () => {
    // Check if place has WhatsApp number from owner's profile
    if (!place?.whatsapp_number) {
      Alert.alert(
        "No WhatsApp Number", 
        "The place owner hasn't provided a WhatsApp number yet.",
        [{ text: t('ok') || 'OK' }]
      );
      return;
    }

    // Check authentication first
    const proceedWithWhatsApp = () => {
      // Remove any non-numeric characters and ensure proper format
      const cleanNumber = (place.whatsapp_number || '').replace(/[^0-9]/g, '');
      const message = `Hi! I found your place "${place?.title || 'Unknown Place'}" on Mawqif app. I'd like to know more about it.`;
      const whatsappUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
      
      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            // Fallback to web WhatsApp
            const webWhatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
            return Linking.openURL(webWhatsappUrl);
          }
        })
        .catch((err) => {
          console.error("Error opening WhatsApp:", err);
          Alert.alert(t('error') || 'Error', "Unable to open WhatsApp");
        });
    };

    // Require authentication for WhatsApp contact
    requireWhatsAppAuth(navigation, proceedWithWhatsApp);
  };

  const handleBookmark = () => {
    if (!place) return;

    // Check authentication first
    const proceedWithBookmark = async () => {
      if (!user?.uid) return;

      try {
        setBookmarkLoading(true);
        const newBookmarkStatus = await BookmarksService.toggleBookmark(user.uid, place.id);
        setIsBookmarked(newBookmarkStatus);
        
        const message = newBookmarkStatus ? (t('bookmarkAdded') || 'Place bookmarked successfully!') : (t('bookmarkRemoved') || 'Bookmark removed successfully!');
        Alert.alert(t('success') || 'Success', message);
      } catch (error) {
        console.error('Error toggling bookmark:', error);
        
        // Check if it's a table missing error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('relation "bookmarks" does not exist') || 
            errorMessage.includes('table "bookmarks" does not exist')) {
          Alert.alert(
            'Database Setup Required',
            'The bookmarks feature requires database setup. Please run the COMPLETE_REVIEWS_AND_BOOKMARKS_FIX.sql script in your Supabase SQL Editor.',
            [{ text: t('ok') || 'OK' }]
          );
        } else {
          Alert.alert(t('error') || 'Error', t('failedToUpdateBookmark') || 'Failed to update bookmark');
        }
      } finally {
        setBookmarkLoading(false);
      }
    };

    // Require authentication for bookmarking
    requireBookmarkAuth(navigation, proceedWithBookmark);
  };

  // Review handling functions
  const handleAddReview = async (rating: number, comment: string) => {
    try {
      console.log('🔄 Adding review:', { placeId, currentUserId, rating, comment });
      const userName = getUserDisplayName();
      await ReviewsService.addReview(placeId, currentUserId, userName, rating, comment);
      Alert.alert(t('success') || 'Success', 'Your review has been added successfully!');
      fetchReviews(); // Refresh reviews
      fetchPlaceDetails(); // Refresh place rating
    } catch (error) {
      console.error('❌ Error adding review:', error);
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(t('error') || 'Error', `Unable to add review: ${errorMessage}`);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    try {
      await ReviewsService.likeReview(reviewId, currentUserId);
      fetchReviews(); // Refresh to show updated counts
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleDislikeReview = async (reviewId: string) => {
    try {
      await ReviewsService.dislikeReview(reviewId, currentUserId);
      fetchReviews(); // Refresh to show updated counts
    } catch (error) {
      console.error('Error disliking review:', error);
    }
  };

  const handleReplyToReview = async (reviewId: string, comment: string) => {
    try {
      const isOwner = currentUserId === place?.owner_id;
      await ReviewsService.addReply(reviewId, currentUserId, 'Current User', comment, isOwner);
      Alert.alert(t('success') || 'Success', 'Your reply has been added successfully!');
      fetchReviews(); // Refresh to show new reply
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert(t('error') || 'Error', 'Unable to add reply. Please try again.');
    }
  };

  const handleReportReview = async (reviewId: string, category: string, reason: string, details?: string) => {
    try {
      // Test if reports system is available
      const isReportsSystemAvailable = await ReviewReportsService.testConnection();
      if (!isReportsSystemAvailable) {
        Alert.alert(
          'Reports System Setup Required',
          'The reporting system needs to be set up. Please run the SIMPLE_REVIEW_REPORTS_SETUP.sql script in your Supabase SQL Editor.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Check if user has already reported this review
      const hasReported = await ReviewReportsService.hasUserReportedReview(reviewId, currentUserId);
      if (hasReported) {
        Alert.alert('Already Reported', 'You have already reported this review.');
        return;
      }

      // Create the report
      await ReviewReportsService.reportReview({
        review_id: reviewId,
        reported_by: currentUserId,
        report_reason: reason,
        report_category: category,
        additional_details: details
      });

      Alert.alert('Reported', 'Thank you for reporting. We will review this content and take appropriate action.');
    } catch (error) {
      console.error('Error reporting review:', error);
      
      // Check if it's a table missing error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('relation "review_reports" does not exist') || 
          errorMessage.includes('table "review_reports" does not exist')) {
        Alert.alert(
          'Reports System Setup Required',
          'The reporting system needs to be set up. Please run the SIMPLE_REVIEW_REPORTS_SETUP.sql script in your Supabase SQL Editor.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(t('error') || 'Error', 'Unable to report review. Please try again.');
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await ReviewsService.deleteReview(reviewId, currentUserId);
      Alert.alert('Deleted', 'Review has been deleted successfully.');
      fetchReviews(); // Refresh reviews
      fetchPlaceDetails(); // Refresh place rating
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert(t('error') || 'Error', 'Unable to delete review. Please try again.');
    }
  };

  const handleSortChange = (sortOption: ReviewSortOption) => {
    setReviewSort(sortOption);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPlaceDetails(),
        fetchReviews(),
        checkBookmarkStatus(),
      ]);
    } catch (error) {
      console.error('Error refreshing place details:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loading') || 'Loading...'}</Text>
        </View>
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>Place not found</Text>
        </View>
      </View>
    );
  }

  const placeTypeLabel = t(place.type);
  const distanceText = place.distance
    ? LocationService.formatDistance(place.distance)
    : "";
  const walkingTime = place.distance
    ? LocationService.formatWalkingTime(place.distance)
    : "";

  const amenities = Object.entries(place.amenities ?? {})
    .filter(([_, value]) => value)
    .map(([key, _]) => ({
      key,
      label: t(key),
    }));

  // Get all images from the new images array or fallback to legacy photo
  const allImages = place.images && place.images.length > 0 
    ? place.images.map((img: any, index: number) => ({
        id: img.id || index,
        url: img.url,
        isPrimary: img.is_primary || false,
      }))
    : place.photo 
    ? [{
        id: 1,
        url: place.photo,
        isPrimary: true,
      }] 
    : [];



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.ScrollView 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.refreshIndicator]}
            tintColor={colors.refreshIndicator}
          />
        }
      >

        {/* Image Carousel Section */}
        <View style={styles.imageContainer}>
          <ImageCarousel 
            images={allImages}
            height={320} // Height to fill the orange box area - from top to just above "Mumbai"
            onImagePress={(index) => {
              // Optional: Add fullscreen modal functionality here
              console.log('Image pressed:', index);
            }}
          />
        </View>

        <View style={styles.content}>
          {/* Header with Title, Type, and Bookmark */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>{place.title}</Text>
              {/* Address below title */}
              {place.address && (
                <View style={styles.addressContainer}>
                  <MaterialIcons name="location-on" size={rf(16)} color={colors.textSecondary} />
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>{place.address}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.headerActions}>
              <View style={[styles.typeBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.typeText, { color: colors.surface }]}>{placeTypeLabel}</Text>
              </View>
              
              {/* Bookmark Button */}
              <TouchableOpacity
                style={[styles.bookmarkButton, { backgroundColor: isBookmarked ? colors.primary : colors.surface }]}
                onPress={handleBookmark}
                disabled={bookmarkLoading}
              >
                {bookmarkLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <MaterialIcons 
                    name={isBookmarked ? "bookmark" : "bookmark-border"} 
                    size={rf(24)} 
                    color={isBookmarked ? colors.textInverse : colors.textSecondary} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Star Rating Section */}
          <View style={styles.ratingSection}>
            {renderStarRating(
              place?.avg_rating || 0, 
              place?.review_count || 0
            )}
          </View>

          {/* Status and Location Info Combined */}
          <View style={styles.statusLocationContainer}>
            {/* Open/Closed Status */}
            <View style={[
              styles.statusBadge, 
              place.is_open ? styles.openBadge : styles.closedBadge
            ]}>
              <View style={styles.statusContent}>
                <MaterialIcons 
                  name={place.is_open ? "schedule" : "access-time"} 
                  size={rf(18)} 
                  color={place.is_open ? "#22C55E" : "#EF4444"} 
                  style={styles.statusIcon}
                />
                <Text style={[
                  styles.statusText,
                  place.is_open ? styles.openText : styles.closedText
                ]}>
                  {place.is_open ? "Open Now" : "Closed"}
                </Text>
              </View>
            </View>

            {/* Location Info */}
            <View style={styles.locationDetails}>
              {distanceText ? <Text style={[styles.distance, { color: colors.primary }]}>{distanceText}</Text> : null}
              {walkingTime ? <Text style={[styles.walkingTime, { color: colors.textSecondary }]}>{walkingTime}</Text> : null}
              <Text style={[styles.city, { color: colors.textSecondary }]}>{place.city}</Text>
            </View>
          </View>

          {/* Capacity */}
          {place.capacity && (
            <View style={styles.capacityContainer}>
              <Text style={[styles.capacityLabel, { color: colors.text }]}>{t('capacity') || 'Capacity'}:</Text>
              <Text style={[styles.capacityValue, { color: colors.primary }]}>{place.capacity} people</Text>
            </View>
          )}

          {/* Amenities - Professional icons instead of emojis */}
          {amenities.length > 0 && (
            <View style={styles.amenitiesContainer}>
              <Text style={[styles.amenitiesTitle, { color: colors.text }]}>{t('availableAmenities') || 'Available Amenities'}:</Text>
              <View style={styles.amenitiesList}>
                {amenities.map((amenity) => (
                  <View key={amenity.key} style={[styles.amenityItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    {/* Professional amenity icons - Optimal size for clarity */}
                    {amenity.key === 'wuzu' && <MaterialIcons name="water-drop" size={rf(20)} color="#6B7280" style={styles.amenityIconStyle} />}
                    {amenity.key === 'washroom' && <MaterialIcons name="bathroom" size={rf(20)} color="#6B7280" style={styles.amenityIconStyle} />}
                    {amenity.key === 'women_area' && <MaterialIcons name="female" size={rf(20)} color="#6B7280" style={styles.amenityIconStyle} />}
                    <Text style={[styles.amenityLabel, { color: colors.textSecondary }]}>{amenity.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Information - Always show */}
          <View style={styles.contactContainer}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>{t('contactInformation') || 'Contact Information'}</Text>
            
            <TouchableOpacity 
              style={[styles.contactButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleCall}
            >
              <MaterialIcons name="call" size={rf(28)} color={colors.primary} style={styles.contactIcon} />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.text }]}>{t('call') || 'Call'}</Text>
                <Text style={[styles.contactNumber, { color: colors.textSecondary }]}>
                  {place.contact_phone || t('notProvided') || 'Not provided'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.whatsappButton, { backgroundColor: colors.surface, borderColor: '#4CAF50' }]}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={rf(28)} color="#25D366" style={styles.whatsappIcon} />
              <View style={styles.contactInfo}>
                <Text style={styles.whatsappLabel}>{t('whatsapp') || 'WhatsApp'}</Text>
                <Text style={[styles.contactNumber, { color: colors.textSecondary }]}>
                  {place.whatsapp_number ? "Chat" : t('notProvided') || 'Not provided'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Review Section Hint */}
          <View style={[styles.reviewHintContainer, { backgroundColor: 'rgba(76, 175, 80, 0.05)', borderLeftColor: colors.primary }]}>
            <Text style={[styles.reviewHintText, { color: colors.textSecondary }]}>
              <MaterialIcons name="reviews" size={rf(20)} color={colors.textSecondary} style={{ marginRight: rs(6) }} />
              Check reviews and ratings from other users below
            </Text>
          </View>

          {/* Enhanced Reviews Section */}
          <ReviewsSection
            placeId={placeId}
            placeOwnerId={place.owner_id}
            currentUserId={currentUserId}
            reviews={reviews}
            onAddReview={handleAddReview}
            onLikeReview={handleLikeReview}
            onDislikeReview={handleDislikeReview}
            onReplyToReview={handleReplyToReview}
            onReportReview={handleReportReview}
            onDeleteReview={handleDeleteReview}
            onSortChange={handleSortChange}
            currentSort={reviewSort}
            navigation={navigation}
          />

        </View>
      </Animated.ScrollView>

      {/* Floating Get Directions Button */}
      <Animated.View style={[styles.floatingDirectionsButton, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.floatingButtonTouchable}
          onPress={handleGetDirections}
          activeOpacity={0.8}
        >
          <View style={styles.floatingDirectionsContent}>
            <MaterialIcons name="navigation" size={rf(24)} color={colors.surface} />
            <Text style={[styles.floatingDirectionsText, { color: colors.surface }]}>{t('getDirections') || 'Get Directions'}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: rf(16),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: rf(16),
  },
  
  // Image Container
  imageContainer: {
    width: '100%', // Ensure full width
    // Remove any height constraints that might be limiting the image size
  },

  // Content Styles
  content: {
    padding: responsiveDimensions.cardPadding,
    paddingBottom: rs(100), // Extra padding for floating button
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: rs(12),
  },
  title: {
    fontSize: responsiveDimensions.titleSize,
    fontWeight: "600",
    flex: 1,
    marginRight: rs(12),
  },
  titleContainer: {
    flex: 1,
    marginRight: rs(12),
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: rs(8),
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: rs(6),
  },
  addressText: {
    fontSize: rf(14),
    marginLeft: rs(4),
    flex: 1,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(16),
  },
  typeText: {
    fontSize: rf(14),
    fontWeight: "500",
  },
  
  // Bookmark Button
  bookmarkButton: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.2,
    shadowRadius: rs(3),
  },
  
  // Star Rating Styles - Clean and professional
  ratingSection: {
    marginBottom: rs(12),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: rs(8),
  },
  starIcon: {
    marginRight: rs(2),
  },
  ratingText: {
    fontSize: rf(14),
    fontWeight: '600',
  },
  
  // Status and Location Combined
  statusLocationContainer: {
    marginBottom: rs(10),
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(16),
    borderWidth: 1,
    marginBottom: rs(8),
  },
  openBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22C55E',
  },
  closedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: rs(4),
  },
  statusText: {
    fontSize: rf(12),
    fontWeight: '600',
  },
  openText: {
    color: '#22C55E',
  },
  closedText: {
    color: '#EF4444',
  },
  
  // Location Details
  locationDetails: {
    // No extra margin needed since it's in the combined container
  },
  distance: {
    fontSize: rf(18),
    fontWeight: "600",
  },
  walkingTime: {
    fontSize: rf(14),
    marginTop: rs(1),
  },
  city: {
    fontSize: rf(14),
    marginTop: rs(2),
  },
  
  // Capacity
  capacityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  capacityValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Amenities
  amenitiesContainer: {
    marginBottom: rs(16),
  },
  amenitiesTitle: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: rs(10),
  },
  amenitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(8),
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    borderRadius: rs(20),
    borderWidth: 1,
  },
  amenityIconStyle: {
    marginRight: rs(6),
  },
  amenityLabel: {
    fontSize: rf(12),
    fontWeight: '500',
  },
  
  // Contact Information
  contactContainer: {
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  contactIcon: {
    marginRight: rs(16),
  },
  whatsappIcon: {
    marginRight: rs(16),
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  whatsappLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
  },
  
  // Review Hint
  reviewHintContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  reviewHintText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Floating Directions Button
  floatingDirectionsButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 12,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 1000,
  },
  floatingButtonTouchable: {
    paddingVertical: rs(16),
    paddingHorizontal: rs(20),
    alignItems: "center",
    borderRadius: rs(12),
  },
  floatingDirectionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: rs(200), // Ensure minimum width
  },
  floatingDirectionsText: {
    fontSize: rf(18),
    fontWeight: "700",
    flexShrink: 0,
    marginLeft: rs(8), // Add margin instead of style prop
  },
});
