import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserInfo } from '../lib/authHelper';
import { ReviewsService } from '../services/reviews.service';
import { Review } from '../types';
import { rf, rs } from '../utils/responsive';

interface MyReviewsScreenProps {
  navigation: any;
}

export const MyReviewsScreen: React.FC<MyReviewsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, getUserDisplayName } = useUserInfo();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserReviews();
      loadUserStats();
    }
  }, [isAuthenticated, user]);

  const loadUserReviews = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const userReviews = await ReviewsService.getUserReviews(user.uid);
      setReviews(userReviews);
    } catch (error) {
      console.error('Error loading user reviews:', error);
      // Don't show alert for now, just log the error
      // Alert.alert(t('error'), 'Failed to load your reviews');
      setReviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user?.uid) return;

    try {
      const userStats = await ReviewsService.getUserReviewStats(user.uid);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Set default stats on error
      setStats({
        totalReviews: 0,
        averageRating: 0,
        totalLikes: 0,
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserReviews(), loadUserStats()]);
    setRefreshing(false);
  };

  const handleDeleteReview = (reviewId: string, placeName: string) => {
    Alert.alert(
      t('deleteReview'),
      `${t('deleteReviewConfirmation')} "${placeName}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => confirmDeleteReview(reviewId),
        },
      ]
    );
  };

  const confirmDeleteReview = async (reviewId: string) => {
    if (!user?.uid) return;

    try {
      await ReviewsService.deleteReview(reviewId, user.uid);

      // Remove from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));

      // Update stats
      await loadUserStats();

      Alert.alert(t('success'), t('reviewDeletedSuccessfully'));
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert(t('error'), t('failedToDeleteReview'));
    }
  };

  const handleEditReview = (review: Review) => {
    // TODO: Navigate to edit review screen
    Alert.alert(t('comingSoon'), t('editReviewFeature'));
  };

  const handleViewPlace = (placeId: string) => {
    // Navigate to place details
    navigation.navigate('PlaceDetail', { placeId });
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name="star"
          size={rf(16)}
          color={i <= rating ? "#F59E0B" : "#D1D5DB"}
          style={{ marginRight: rs(2) }}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderStatsCard = () => (
    <View style={[styles.statsCard, { backgroundColor: colors.sectionBackground }]}>
      <Text style={[styles.statsTitle, { color: colors.text }]}>
        {t('reviewStatistics')}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.totalReviews}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('totalReviews')}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.averageRating.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('averageRating')}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.totalLikes}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('totalLikes')}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderReviewItem = (review: Review) => (
    <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.sectionBackground }]}>
      {/* Place Info */}
      <TouchableOpacity
        style={styles.placeInfo}
        onPress={() => handleViewPlace(review.place_id)}
      >
        <MaterialIcons name="place" size={rf(20)} color={colors.primary} />
        <View style={styles.placeDetails}>
          <Text style={[styles.placeName, { color: colors.text }]}>
            {(review as any).place_title || 'Unknown Place'}
          </Text>
          <Text style={[styles.placeAddress, { color: colors.textSecondary }]}>
            {(review as any).place_address || (review as any).place_city || 'Unknown Location'}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={rf(20)} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Review Content */}
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <View style={styles.ratingContainer}>
            {renderStarRating(review.rating)}
            <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
              {new Date(review.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditReview(review)}
            >
              <MaterialIcons name="edit" size={rf(20)} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteReview(review.id, (review as any).place_title || 'this place')}
            >
              <MaterialIcons name="delete" size={rf(20)} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.reviewText, { color: colors.text }]}>
          {review.comment}
        </Text>

        {/* Review Stats */}
        <View style={styles.reviewStats}>
          <View style={styles.statChip}>
            <MaterialIcons name="thumb-up" size={rf(14)} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {review.likes_count}
            </Text>
          </View>

          <View style={styles.statChip}>
            <MaterialIcons name="comment" size={rf(14)} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {review.replies_count}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="rate-review"
        size={rf(64)}
        color={colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t('noReviewsYet')}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {t('startWritingReviews')}
      </Text>

      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
      >
        <Text style={[styles.exploreButtonText, { color: colors.textInverse }]}>
          {t('explorePlaces')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loginPrompt}>
          <MaterialIcons name="login" size={rf(64)} color={colors.textSecondary} />
          <Text style={[styles.loginTitle, { color: colors.text }]}>
            {t('loginRequired')}
          </Text>
          <Text style={[styles.loginMessage, { color: colors.textSecondary }]}>
            {t('loginToViewReviews')}
          </Text>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              const { useAuthStore } = require('../lib/authStore');
              const { setReturnRoute } = useAuthStore.getState();
              setReturnRoute('MyReviews');
              navigation.navigate('Login');
            }}
          >
            <Text style={[styles.loginButtonText, { color: colors.textInverse }]}>
              {t('login')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.refreshIndicator]}
            tintColor={colors.refreshIndicator}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card */}
        {stats.totalReviews > 0 && renderStatsCard()}

        {/* Reviews List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('loadingReviews')}
            </Text>
          </View>
        ) : reviews.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.reviewsList}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('yourReviews')} ({reviews.length})
            </Text>
            {reviews.map(renderReviewItem)}
          </View>
        )}
      </ScrollView>
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

  // Stats Card
  statsCard: {
    margin: rs(16),
    padding: rs(20),
    borderRadius: rs(12),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  statsTitle: {
    fontSize: rf(18),
    fontWeight: '700',
    marginBottom: rs(16),
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: rf(24),
    fontWeight: '700',
    marginBottom: rs(4),
  },
  statLabel: {
    fontSize: rf(12),
    textAlign: 'center',
  },

  // Reviews List
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: '700',
    marginHorizontal: rs(16),
    marginBottom: rs(12),
  },
  reviewsList: {
    paddingBottom: rs(20),
  },
  reviewCard: {
    marginHorizontal: rs(16),
    marginBottom: rs(12),
    borderRadius: rs(12),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },

  // Place Info
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  placeDetails: {
    flex: 1,
    marginLeft: rs(12),
  },
  placeName: {
    fontSize: rf(16),
    fontWeight: '600',
    marginBottom: rs(2),
  },
  placeAddress: {
    fontSize: rf(12),
  },

  // Review Content
  reviewContent: {
    padding: rs(16),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rs(8),
  },
  ratingContainer: {
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(4),
  },
  reviewDate: {
    fontSize: rf(12),
  },
  reviewActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: rs(8),
    marginLeft: rs(8),
  },
  reviewText: {
    fontSize: rf(14),
    lineHeight: rf(20),
    marginBottom: rs(12),
  },
  reviewStats: {
    flexDirection: 'row',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: rs(16),
  },
  statText: {
    fontSize: rf(12),
    marginLeft: rs(4),
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: rs(60),
    paddingHorizontal: rs(20),
  },
  emptyIcon: {
    marginBottom: rs(16),
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: rf(20),
    fontWeight: '600',
    marginBottom: rs(8),
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: rf(14),
    textAlign: 'center',
    lineHeight: rf(20),
    marginBottom: rs(24),
  },
  exploreButton: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    borderRadius: rs(24),
  },
  exploreButtonText: {
    fontSize: rf(16),
    fontWeight: '600',
  },

  // Login Prompt
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(20),
  },
  loginTitle: {
    fontSize: rf(20),
    fontWeight: '600',
    marginTop: rs(16),
    marginBottom: rs(8),
    textAlign: 'center',
  },
  loginMessage: {
    fontSize: rf(14),
    textAlign: 'center',
    lineHeight: rf(20),
    marginBottom: rs(24),
  },
  loginButton: {
    paddingHorizontal: rs(32),
    paddingVertical: rs(12),
    borderRadius: rs(24),
  },
  loginButtonText: {
    fontSize: rf(16),
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: rs(40),
  },
  loadingText: {
    fontSize: rf(16),
  },
});