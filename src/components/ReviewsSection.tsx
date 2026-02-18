import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { rf, rs } from '../utils/responsive';
import { Review, ReviewReply, ReviewSortOption } from '../types';
import { useReviewsAuth } from '../lib/authHelper';
import { UserProfileService } from '../services/user-profile.service';
import { ReviewReportsService } from '../services/review-reports.service';

interface ReviewsSectionProps {
  placeId: string;
  placeOwnerId?: string;
  currentUserId?: string;
  reviews: Review[];
  onAddReview: (rating: number, comment: string) => void;
  onLikeReview: (reviewId: string) => void;
  onDislikeReview: (reviewId: string) => void;
  onReplyToReview: (reviewId: string, comment: string) => void;
  onReportReview: (reviewId: string, category: string, reason: string, details?: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onSortChange: (sortOption: ReviewSortOption) => void;
  currentSort: ReviewSortOption;
  navigation?: any; // Add navigation prop for auth
  allowHostDelete?: boolean; // New prop to control host delete permissions
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  placeId,
  placeOwnerId,
  currentUserId,
  reviews,
  onAddReview,
  onLikeReview,
  onDislikeReview,
  onReplyToReview,
  onReportReview,
  onDeleteReview,
  onSortChange,
  currentSort,
  navigation,
  allowHostDelete = false, // Default to false - only allow in Dashboard
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { requireReviewAuth } = useReviewsAuth();
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({});

  // Interactive star selection preview and animations
  const [previewRating, setPreviewRating] = useState(0); // temporary highlight while pressing
  const starScalesRef = useRef(Array.from({ length: 5 }, () => new Animated.Value(1))).current;

  // When rating changes programmatically, animate the selected star briefly for feedback
  useEffect(() => {
    if (newReviewRating > 0) {
      const scale = starScalesRef[newReviewRating - 1];
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 140, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    }
  }, [newReviewRating]);
  
  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [selectedReportCategory, setSelectedReportCategory] = useState<string>('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const reviewInputRef = useRef<TextInput>(null);

  // Load user profiles for reviews
  useEffect(() => {
    loadUserProfiles();
  }, [reviews]);

  const loadUserProfiles = async () => {
    const profilePromises = reviews.map(async (review) => {
      if (review.user_id && !userProfiles[review.user_id]) {
        try {
          const profile = await UserProfileService.getProfileForReview(review.user_id);
          return { userId: review.user_id, profile };
        } catch (error) {
          console.error('Error loading profile for review:', error);
          return { userId: review.user_id, profile: null };
        }
      }
      return null;
    });

    const results = await Promise.all(profilePromises);
    const newProfiles = { ...userProfiles };
    
    results.forEach((result) => {
      if (result) {
        newProfiles[result.userId] = result.profile;
      }
    });

    setUserProfiles(newProfiles);
  };

  const handleAddReview = () => {
    if (newReviewRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }
    
    if (newReviewComment.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters');
      return;
    }

    onAddReview(newReviewRating, newReviewComment.trim());
    setNewReviewRating(0);
    setNewReviewComment('');
    setShowAddReview(false);
  };

  const handleWriteReviewPress = () => {
    if (!navigation) {
      setShowAddReview(true);
      return;
    }

    // Check authentication first
    const proceedWithWriteReview = () => {
      setShowAddReview(true);
    };

    requireReviewAuth(navigation, 'write', proceedWithWriteReview);
  };

  const handleLikePress = (reviewId: string) => {
    if (!navigation) {
      onLikeReview(reviewId);
      return;
    }

    // Check authentication first
    const proceedWithLike = () => {
      onLikeReview(reviewId);
    };

    requireReviewAuth(navigation, 'like', proceedWithLike);
  };

  const handleDislikePress = (reviewId: string) => {
    if (!navigation) {
      onDislikeReview(reviewId);
      return;
    }

    // Check authentication first
    const proceedWithDislike = () => {
      onDislikeReview(reviewId);
    };

    requireReviewAuth(navigation, 'dislike', proceedWithDislike);
  };

  const handleReplyPress = (reviewId: string, comment: string) => {
    if (!navigation) {
      onReplyToReview(reviewId, comment);
      return;
    }

    // Check authentication first
    const proceedWithReply = () => {
      onReplyToReview(reviewId, comment);
    };

    requireReviewAuth(navigation, 'reply', proceedWithReply);
  };

  const handleReportPress = (reviewId: string) => {
    if (!navigation) {
      openReportModal(reviewId);
      return;
    }

    // Check authentication first
    const proceedWithReport = () => {
      openReportModal(reviewId);
    };

    requireReviewAuth(navigation, 'report', proceedWithReport);
  };

  const openReportModal = (reviewId: string) => {
    setReportingReviewId(reviewId);
    setSelectedReportCategory('');
    setReportReason('');
    setReportDetails('');
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!reportingReviewId || !selectedReportCategory || !reportReason.trim()) {
      Alert.alert('Missing Information', 'Please select a category and provide a reason for reporting.');
      return;
    }

    const category = ReviewReportsService.getReportCategories().find(c => c.key === selectedReportCategory);
    const reason = category ? category.label : reportReason;

    onReportReview(reportingReviewId, selectedReportCategory, reason, reportDetails.trim() || undefined);
    
    // Close modal and reset state
    setShowReportModal(false);
    setReportingReviewId(null);
    setSelectedReportCategory('');
    setReportReason('');
    setReportDetails('');
  };

  const handleDeleteReview = (reviewId: string, isOwnReview: boolean) => {
    const deleteTitle = isOwnReview ? 'Delete Your Review' : 'Delete Review';
    const deleteMessage = isOwnReview 
      ? 'Are you sure you want to delete your review? This action cannot be undone.'
      : 'Are you sure you want to delete this review? This action cannot be undone.';

    Alert.alert(
      deleteTitle,
      deleteMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDeleteReview) {
              onDeleteReview(reviewId);
            }
          },
        },
      ]
    );
  };

  const renderStarRating = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isLit = i <= (previewRating || rating);
      const scale = starScalesRef[i - 1];

      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => {
            if (!interactive || !onRatingChange) return;

            // Immediately set the rating and animate this star for instant feedback
            onRatingChange(i);
            setPreviewRating(i);

            Animated.sequence([
              Animated.timing(scale, { toValue: 1.18, duration: 140, useNativeDriver: true }),
              Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
            ]).start(() => setPreviewRating(0));
          }}
          onPressIn={() => {
            if (!interactive) return;
            setPreviewRating(i);
            Animated.spring(scale, { toValue: 1.12, friction: 6, useNativeDriver: true }).start();
          }}
          onPressOut={() => {
            if (!interactive) return;
            setPreviewRating(0);
            Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
          }}
          disabled={!interactive}
          accessibilityRole={interactive ? 'button' : undefined}
          accessibilityLabel={interactive ? `${i} ${t('stars') || 'star'}` : undefined}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: rs(6) }}
        >
          <Animated.View style={{ transform: [{ scale }], marginRight: rs(4) }}>
            <MaterialIcons
              name="star"
              size={interactive ? rf(36) : rf(16)}
              color={isLit ? "#F59E0B" : "#D1D5DB"}
              style={[
                { marginRight: rs(2) },
                isLit && {
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9,
                  shadowRadius: 8,
                  elevation: 6,
                }
              ]}
            />
          </Animated.View>
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderSortButtons = () => (
    <View style={styles.sortContainer}>
      <TouchableOpacity
        style={[
          styles.sortButton,
          currentSort === 'newest' && styles.activeSortButton
        ]}
        onPress={() => onSortChange('newest')}
      >
        <Text style={[
          styles.sortButtonText,
          currentSort === 'newest' && styles.activeSortButtonText
        ]}>
          {t('newest') || 'Newest'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.sortButton,
          currentSort === 'most_liked' && styles.activeSortButton
        ]}
        onPress={() => onSortChange('most_liked')}
      >
        <Text style={[
          styles.sortButtonText,
          currentSort === 'most_liked' && styles.activeSortButtonText
        ]}>
          {t('mostLiked') || 'Most Liked'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.sortButton,
          currentSort === 'oldest' && styles.activeSortButton
        ]}
        onPress={() => onSortChange('oldest')}
      >
        <Text style={[
          styles.sortButtonText,
          currentSort === 'oldest' && styles.activeSortButtonText
        ]}>
          {t('oldest') || 'Oldest'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderReview = ({ item: review }: { item: Review }) => {
    const userProfile = userProfiles[review.user_id];
    const displayName = userProfile?.full_name || review.user_name || 'Anonymous User';
    const profileImageUrl = userProfile?.profile_image_url;
    const userCity = userProfile?.city;
    
    // Check if current user can delete this review
    const canDelete = currentUserId && (
      review.user_id === currentUserId || // Review author can always delete
      (allowHostDelete && placeOwnerId === currentUserId) // Host can delete only if allowHostDelete is true
    );
    
    return (
      <View key={review.id} style={styles.reviewContainer}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            {/* User Profile Image */}
            <View style={styles.userImageContainer}>
              {profileImageUrl ? (
                <Image 
                  source={{ uri: profileImageUrl }} 
                  style={styles.userImage}
                />
              ) : (
                <View style={[styles.userImagePlaceholder, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="person" size={rf(20)} color={colors.textInverse} />
                </View>
              )}
            </View>
            
            {/* User Details */}
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {String(displayName)}
              </Text>
              {userCity && (
                <Text style={[styles.userLocation, { color: colors.textSecondary }]}>
                  📍 {String(userCity)}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.reviewHeaderRight}>
            <Text style={[styles.reviewTime, { color: colors.textSecondary }]}>
              {String(new Date(review.created_at).toLocaleDateString())}
            </Text>
            
            {/* Delete Button - Only show for review author or place owner */}
            {canDelete && (
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}
                onPress={() => handleDeleteReview(review.id, review.user_id === currentUserId)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete" size={rf(18)} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          {renderStarRating(review.rating)}
        </View>
        
        <Text style={[styles.reviewText, { color: colors.text }]}>
          {String(review.comment || '')}
        </Text>
        
        {/* Host Response Section */}
        {review.host_response && (
          <View style={[styles.hostResponseContainer, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.hostResponseLabel, { color: colors.primary }]}>
              Host Reply:
            </Text>
            <Text style={[styles.hostResponseText, { color: colors.text }]}>
              {String(review.host_response)}
            </Text>
            {review.host_response_date && (
              <Text style={[styles.hostResponseDate, { color: colors.textSecondary }]}>
                {new Date(review.host_response_date).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikePress(review.id)}
          >
            <MaterialIcons 
              name="thumb-up" 
              size={rf(16)} 
              color={review.user_liked ? "#4CAF50" : "#8E8E93"} 
            />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {String(review.likes_count || 0)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDislikePress(review.id)}
          >
            <MaterialIcons 
              name="thumb-down" 
              size={rf(16)} 
              color={review.user_disliked ? "#EF4444" : "#8E8E93"} 
            />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {String(review.dislikes_count || 0)}
            </Text>
          </TouchableOpacity>

          {/* Report Button - Only show if not own review */}
          {currentUserId && review.user_id !== currentUserId && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReportPress(review.id)}
            >
              <MaterialIcons 
                name="flag" 
                size={rf(16)} 
                color="#FF9800" 
              />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                Report
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      marginTop: rs(20),
    },
    
    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: rs(16),
    },
    title: {
      fontSize: rf(18),
      fontWeight: '700',
      color: colors.text,
    },
    writeReviewButton: {
      backgroundColor: '#FF6B35',
      borderRadius: rs(20),
      paddingVertical: rs(8),
      paddingHorizontal: rs(16),
    },
    writeReviewText: {
      fontSize: rf(12),
      fontWeight: '600',
      color: colors.surface,
    },
    
    // Rules Section
    rulesContainer: {
      backgroundColor: 'rgba(139, 69, 19, 0.1)',
      padding: rs(12),
      borderRadius: rs(8),
      borderLeftWidth: rs(4),
      borderLeftColor: '#8B4513',
      marginBottom: rs(16),
    },
    rulesText: {
      fontSize: rf(12),
      color: '#8B4513',
      lineHeight: rf(16),
    },
    
    // Sort Buttons
    sortContainer: {
      flexDirection: 'row',
      marginBottom: rs(20),
    },
    sortButton: {
      paddingHorizontal: rs(16),
      paddingVertical: rs(8),
      borderRadius: rs(20),
      marginRight: rs(8),
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeSortButton: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    },
    sortButtonText: {
      fontSize: rf(14),
      color: colors.text,
      fontWeight: '500',
    },
    activeSortButtonText: {
      color: colors.surface,
      fontWeight: '600',
    },
    
    // Empty State
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: rs(40),
    },
    emptyIcon: {
      marginBottom: rs(16),
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: rf(18),
      fontWeight: '600',
      color: colors.text,
      marginBottom: rs(8),
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: rf(14),
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: rf(20),
    },
    
    // Review Item
    reviewContainer: {
      backgroundColor: colors.surface,
      borderRadius: rs(12),
      padding: rs(16),
      marginBottom: rs(12),
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: rs(8),
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    reviewHeaderRight: {
      alignItems: 'flex-end',
      gap: rs(8),
    },
    deleteButton: {
      width: rs(32),
      height: rs(32),
      borderRadius: rs(16),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: rs(4),
    },
    userImageContainer: {
      marginRight: rs(12),
    },
    userImage: {
      width: rs(40),
      height: rs(40),
      borderRadius: rs(20),
    },
    userImagePlaceholder: {
      width: rs(40),
      height: rs(40),
      borderRadius: rs(20),
      justifyContent: 'center',
      alignItems: 'center',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: rf(16),
      fontWeight: '600',
      marginBottom: rs(2),
    },
    userLocation: {
      fontSize: rf(12),
    },
    reviewTime: {
      fontSize: rf(12),
    },
    ratingContainer: {
      marginBottom: rs(8),
    },
    starsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reviewText: {
      fontSize: rf(14),
      color: colors.text,
      lineHeight: rf(20),
      marginBottom: rs(12),
    },
    
    // Host Response Styles
    hostResponseContainer: {
      padding: rs(12),
      borderRadius: rs(8),
      marginBottom: rs(12),
      borderLeftWidth: rs(3),
      borderLeftColor: colors.primary,
    },
    hostResponseLabel: {
      fontSize: rf(12),
      fontWeight: '600',
      marginBottom: rs(4),
    },
    hostResponseText: {
      fontSize: rf(13),
      lineHeight: rf(18),
      marginBottom: rs(4),
    },
    hostResponseDate: {
      fontSize: rf(11),
      textAlign: 'right',
    },
    
    reviewActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: rs(16),
    },
    actionText: {
      fontSize: rf(12),
      color: colors.textSecondary,
      marginLeft: rs(4),
    },
    
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: rs(20),
      paddingVertical: rs(16),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: rf(18),
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      padding: rs(8),
    },
    modalContent: {
      flex: 1,
      padding: rs(20),
    },
    ratingTitle: {
      fontSize: rf(16),
      fontWeight: '600',
      color: colors.text,
      marginBottom: rs(16),
      textAlign: 'center',
    },
    reviewInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rs(8),
      padding: rs(12),
      fontSize: rf(14),
      color: colors.text,
      minHeight: rs(100),
      textAlignVertical: 'top',
      marginTop: rs(20),
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: rs(8),
      paddingVertical: rs(12),
      alignItems: 'center',
      marginTop: rs(20),
    },
    submitButtonText: {
      fontSize: rf(16),
      fontWeight: '600',
      color: colors.surface,
    },
    
    // Report Modal Styles
    reportCategoriesContainer: {
      marginBottom: rs(20),
    },
    reportCategoryItem: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rs(8),
      marginBottom: rs(12),
      backgroundColor: colors.surface,
    },
    selectedReportCategory: {
      borderColor: '#FF5722',
      backgroundColor: 'rgba(255, 87, 34, 0.05)',
    },
    reportCategoryContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: rs(16),
    },
    radioButton: {
      width: rs(20),
      height: rs(20),
      borderRadius: rs(10),
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: rs(12),
      marginTop: rs(2),
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonSelected: {
      borderColor: '#FF5722',
    },
    radioButtonInner: {
      width: rs(10),
      height: rs(10),
      borderRadius: rs(5),
      backgroundColor: '#FF5722',
    },
    reportCategoryText: {
      flex: 1,
    },
    reportCategoryLabel: {
      fontSize: rf(16),
      fontWeight: '600',
      marginBottom: rs(4),
    },
    reportCategoryDescription: {
      fontSize: rf(14),
      lineHeight: rf(18),
    },
    reportSectionTitle: {
      fontSize: rf(16),
      fontWeight: '600',
      marginBottom: rs(12),
      marginTop: rs(8),
    },
    reportDetailsInput: {
      borderWidth: 1,
      borderRadius: rs(8),
      padding: rs(12),
      fontSize: rf(14),
      minHeight: rs(80),
      textAlignVertical: 'top',
      marginBottom: rs(20),
    },
    submitReportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: rs(8),
      paddingVertical: rs(14),
      paddingHorizontal: rs(20),
      marginBottom: rs(20),
    },
    submitReportButtonText: {
      fontSize: rf(16),
      fontWeight: '600',
      marginLeft: rs(8),
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('userReviews') || 'User Reviews'}</Text>
        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={handleWriteReviewPress}
        >
          <Text style={styles.writeReviewText}>{t('writeReview') || 'WRITE REVIEW'}</Text>
        </TouchableOpacity>
      </View>

      {/* Rules */}
      <View style={styles.rulesContainer}>
        <Text style={styles.rulesText}>
          {t('reviewRules') || 'Please read and apply the rules before posting a review.'}
        </Text>
        <Text style={styles.rulesText}>
          {t('reviewTerms') || 'By sharing your review, you agree to all the relevant terms.'}
        </Text>
      </View>

      {/* Sort Buttons */}
      {renderSortButtons()}

      {/* Reviews List or Empty State */}
      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="chat-bubble-outline" 
            size={rf(64)} 
            color={colors.textSecondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>{t('noReviewsYet') || 'No reviews yet'}</Text>
          <Text style={styles.emptyMessage}>
            {t('noReviewsMessage') || 'Be the first to share your experience about this place!'}
          </Text>
        </View>
      ) : (
        <View>
          {reviews.map((review) => renderReview({ item: review }))}
        </View>
      )}

      {/* Add Review Modal */}
      <Modal
        visible={showAddReview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('writeAReview') || 'Write a Review'}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddReview(false)}
            >
              <MaterialIcons name="close" size={rf(24)} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.ratingTitle}>{t('howWouldYouRate') || 'How would you rate this place?'}</Text>
            {renderStarRating(newReviewRating, true, setNewReviewRating)}
            
            <TextInput
              ref={reviewInputRef}
              style={styles.reviewInput}
              placeholder={t('shareExperiencePlaceholder') || 'Share your experience about this place...'}
              placeholderTextColor={colors.textSecondary}
              value={newReviewComment}
              onChangeText={setNewReviewComment}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddReview}
            >
              <Text style={styles.submitButtonText}>{t('post') || 'Post'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Review Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Review</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReportModal(false)}
            >
              <MaterialIcons name="close" size={rf(24)} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.ratingTitle, { textAlign: 'left', marginBottom: rs(16) }]}>
              Why are you reporting this review?
            </Text>
            
            {/* Report Categories */}
            <View style={styles.reportCategoriesContainer}>
              {ReviewReportsService.getReportCategories().map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.reportCategoryItem,
                    selectedReportCategory === category.key && styles.selectedReportCategory
                  ]}
                  onPress={() => {
                    setSelectedReportCategory(category.key);
                    setReportReason(category.label);
                  }}
                >
                  <View style={styles.reportCategoryContent}>
                    <View style={[
                      styles.radioButton,
                      selectedReportCategory === category.key && styles.radioButtonSelected
                    ]}>
                      {selectedReportCategory === category.key && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <View style={styles.reportCategoryText}>
                      <Text style={[styles.reportCategoryLabel, { color: colors.text }]}>
                        {category.label}
                      </Text>
                      <Text style={[styles.reportCategoryDescription, { color: colors.textSecondary }]}>
                        {category.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Additional Details */}
            <Text style={[styles.reportSectionTitle, { color: colors.text }]}>
              Additional Details (Optional)
            </Text>
            <TextInput
              style={[styles.reportDetailsInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Provide more details about why you're reporting this review..."
              placeholderTextColor={colors.textSecondary}
              value={reportDetails}
              onChangeText={setReportDetails}
              multiline
              maxLength={300}
            />
            
            <TouchableOpacity
              style={[
                styles.submitReportButton,
                { backgroundColor: selectedReportCategory ? '#FF5722' : colors.border }
              ]}
              onPress={handleSubmitReport}
              disabled={!selectedReportCategory}
            >
              <MaterialIcons 
                name="flag" 
                size={rf(20)} 
                color={selectedReportCategory ? 'white' : colors.textSecondary} 
              />
              <Text style={[
                styles.submitReportButtonText,
                { color: selectedReportCategory ? 'white' : colors.textSecondary }
              ]}>
                Submit Report
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};