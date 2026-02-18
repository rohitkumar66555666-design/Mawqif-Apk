import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth, useAuthStore } from '../lib/authStore';
import { signOut } from '../lib/firebaseConfig';
import { UserProfileService, UserProfile } from '../services/user-profile.service';
import { PlacesService } from '../services/places.service';
import { ReviewReportsService } from '../services/review-reports.service';
import { Place } from '../types';
import { rs, rf } from '../utils/responsive';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, userProfile: authUserProfile } = useAuth();
  const { logout } = useAuthStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(authUserProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userPlaces, setUserPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [hostStats, setHostStats] = useState({
    totalPlaces: 0,
    totalReviews: 0,
    totalBookmarks: 0,
    averageRating: 0,
    hostSince: null as string | null,
    isHost: false,
  });
  const [hostReviews, setHostReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [hostReports, setHostReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportStats, setReportStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
  });
  const [replyingToReview, setReplyingToReview] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    phone_number: '',
    whatsapp_number: '',
  });

  useEffect(() => {
    if (user?.uid) {
      // Use profile from auth store if available
      if (authUserProfile) {
        setUserProfile(authUserProfile);
        setLoadingProfile(false);
      } else {
        loadUserProfile();
      }
      loadUserPlaces();
      loadHostReviews();
      loadHostReports();
    } else {
      setLoadingProfile(false);
      setLoadingPlaces(false);
      setLoadingReviews(false);
      setLoadingReports(false);
    }
  }, [user, authUserProfile]);

  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingProfile(true);
      const profile = await UserProfileService.getProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadUserPlaces = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingPlaces(true);
      console.log('📍 Loading places and statistics for user:', user.uid);
      
      // First check and update host status based on places
      const isHost = await PlacesService.checkAndUpdateHostStatus(user.uid);
      console.log('🔍 Host status check result:', isHost);
      
      // Load both places with status and statistics
      const [placesWithStatus, statistics] = await Promise.all([
        PlacesService.getHostPlacesWithStatus(user.uid),
        PlacesService.getHostStatistics(user.uid)
      ]);
      
      setUserPlaces(placesWithStatus);
      setHostStats(statistics);
      
      console.log(`✅ Loaded ${placesWithStatus.length} places with status and statistics for user`);
      console.log('📊 Host statistics:', statistics);
      console.log('🎯 Dashboard will show host features:', statistics.isHost ? 'YES' : 'NO');
      console.log('🏠 Places loaded:', placesWithStatus);
      console.log('📈 Statistics breakdown:', {
        totalPlaces: statistics.totalPlaces,
        totalReviews: statistics.totalReviews,
        averageRating: statistics.averageRating,
        isHost: statistics.isHost
      });
    } catch (error) {
      console.error('Error loading user places and statistics:', error);
      setUserPlaces([]);
      setHostStats({
        totalPlaces: 0,
        totalReviews: 0,
        totalBookmarks: 0,
        averageRating: 0,
        hostSince: null,
        isHost: false,
      });
    } finally {
      setLoadingPlaces(false);
    }
  };

  const loadHostReports = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingReports(true);
      console.log('🚨 Loading host reports for user:', user.uid);
      
      // Test if reports system is available
      const isReportsSystemAvailable = await ReviewReportsService.testConnection();
      if (!isReportsSystemAvailable) {
        console.log('⚠️ Reports system not available - skipping reports load');
        setHostReports([]);
        setReportStats({ totalReports: 0, pendingReports: 0, resolvedReports: 0, dismissedReports: 0 });
        return;
      }
      
      const [reports, stats] = await Promise.all([
        ReviewReportsService.getHostReports(user.uid),
        ReviewReportsService.getHostReportStats(user.uid)
      ]);
      
      setHostReports(reports);
      setReportStats(stats);
      
      console.log(`✅ Loaded ${reports.length} host reports`);
    } catch (error) {
      console.error('Error loading host reports:', error);
      setHostReports([]);
      setReportStats({ totalReports: 0, pendingReports: 0, resolvedReports: 0, dismissedReports: 0 });
    } finally {
      setLoadingReports(false);
    }
  };

  const loadHostReviews = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingReviews(true);
      console.log('📝 Loading host reviews for user:', user.uid);
      
      const reviews = await PlacesService.getHostReviews(user.uid);
      setHostReviews(reviews);
      
      console.log(`✅ Loaded ${reviews.length} host reviews`);
    } catch (error) {
      console.error('Error loading host reviews:', error);
      setHostReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReplyToReview = async (reviewId: string) => {
    if (!replyText.trim()) {
      Alert.alert(t('error'), t('pleaseEnterReplyMessage'));
      return;
    }

    try {
      await PlacesService.replyToReview(reviewId, replyText.trim());
      setReplyingToReview(null);
      setReplyText('');
      loadHostReviews(); // Refresh reviews
      Alert.alert(t('success'), t('replyAddedSuccessfully'));
    } catch (error) {
      console.error('Error replying to review:', error);
      Alert.alert(t('error'), t('failedToAddReply'));
    }
  };

  const handleDeleteReview = async (reviewId: string, reviewerName: string) => {
    Alert.alert(
      t('deleteReview'),
      t('deleteReviewConfirmation').replace('{reviewerName}', reviewerName),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await PlacesService.deleteReview(reviewId);
              loadHostReviews(); // Refresh reviews
              Alert.alert(t('success'), t('reviewDeletedSuccessfully'));
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert(t('error'), t('failedToDeleteReview'));
            }
          },
        },
      ]
    );
  };

  const handleUpdateReportStatus = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed', reporterName: string) => {
    const statusLabels = {
      reviewed: t('markAsReviewed'),
      resolved: t('markAsResolved'),
      dismissed: t('dismissReport')
    };

    const confirmMessages = {
      reviewed: t('markAsReviewedConfirm').replace('{reporterName}', reporterName),
      resolved: t('markAsResolvedConfirm').replace('{reporterName}', reporterName),
      dismissed: t('dismissReportConfirm').replace('{reporterName}', reporterName)
    };

    Alert.alert(
      statusLabels[status],
      confirmMessages[status],
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: status === 'dismissed' ? t('dismiss') : t('confirm'),
          style: status === 'dismissed' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await ReviewReportsService.updateReportStatus(reportId, status, user?.uid || '', `${status} by host`);
              loadHostReports(); // Refresh reports
              const successMessages = {
                reviewed: t('reportReviewedSuccessfully'),
                resolved: t('reportResolvedSuccessfully'),
                dismissed: t('reportDismissedSuccessfully')
              };
              Alert.alert(t('success'), successMessages[status]);
            } catch (error) {
              console.error('Error updating report status:', error);
              Alert.alert(t('error'), t('failedToUpdateReportStatus'));
            }
          },
        },
      ]
    );
  };

  const handleTogglePlaceStatus = async (placeId: string, currentStatus: boolean, placeName: string) => {
    console.log(`🔄 Toggle button clicked - Place: ${placeName}, Current: ${currentStatus}`);
    
    const newStatus = !currentStatus;
    
    if (!newStatus) {
      // If closing, ask for reason using Alert.alert (works on all platforms)
      Alert.alert(
        t('closePlace').replace('{placeName}', placeName),
        t('doYouWantToProvideReason'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('closeWithoutReason'),
            onPress: async () => {
              console.log('🔒 Closing place without reason');
              await togglePlaceStatus(placeId, newStatus);
            },
          },
          {
            text: t('addReason'),
            onPress: () => {
              // For now, use a simple reason - you can enhance this later
              const reason = t('temporarilyClosed');
              console.log('🔒 Closing place with reason:', reason);
              togglePlaceStatus(placeId, newStatus, reason);
            },
          },
        ]
      );
    } else {
      // If opening, just confirm
      console.log('🔓 Opening place');
      Alert.alert(
        t('openPlace'),
        t('openPlaceConfirm'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('openPlace'),
            onPress: async () => {
              console.log('✅ Confirmed opening place');
              await togglePlaceStatus(placeId, newStatus);
            },
          },
        ]
      );
    }
  };

  const togglePlaceStatus = async (placeId: string, isOpen: boolean, statusMessage?: string) => {
    try {
      console.log(`🔄 Starting toggle process - ID: ${placeId}, Open: ${isOpen}, Message: ${statusMessage}`);
      setTogglingStatus(placeId);
      
      await PlacesService.togglePlaceStatus(placeId, isOpen, statusMessage, user?.uid);
      console.log('✅ PlacesService.togglePlaceStatus completed successfully');
      
      loadUserPlaces(); // Refresh places with new status
      console.log('🔄 Refreshing user places...');
      
      Alert.alert(t('success'), `${t('place')} ${isOpen ? t('placeOpenedSuccessfully') : t('placeClosedSuccessfully')}`);
    } catch (error) {
      console.error('❌ Error toggling place status:', error);
      Alert.alert(t('error'), t('failedToUpdatePlaceStatus').replace('{error}', error.message || 'Unknown error'));
    } finally {
      setTogglingStatus(null);
      console.log('🏁 Toggle process completed');
    }
  };

  const handleEditContact = () => {
    // Initialize form with current values
    setContactForm({
      phone_number: userProfile?.phone_number || user?.phoneNumber || '',
      whatsapp_number: (userProfile as any)?.whatsapp_number || '',
    });
    setEditingContact(true);
  };

  const handleSaveContact = async () => {
    if (!user?.uid) return;

    try {
      console.log('💾 Saving contact information...');
      
      // Update user profile with new contact info
      const updateData = {
        phone_number: contactForm.phone_number.trim(),
        whatsapp_number: contactForm.whatsapp_number.trim(),
        updated_at: new Date().toISOString(),
      };

      await UserProfileService.updateProfile(user.uid, updateData);
      
      // Sync contact info to all host's places
      console.log('🔄 Syncing contact info to all places...');
      await PlacesService.syncHostContactToPlaces(user.uid, {
        phone_number: updateData.phone_number,
        whatsapp_number: updateData.whatsapp_number,
      });
      
      // Refresh profile data
      await loadUserProfile();
      
      setEditingContact(false);
      Alert.alert(t('success'), t('contactInfoUpdatedAndSynced'));
    } catch (error) {
      console.error('❌ Error updating contact info:', error);
      Alert.alert(t('error'), t('failedToUpdateContactInfo'));
    }
  };

  const handleCancelEditContact = () => {
    setEditingContact(false);
    setContactForm({
      phone_number: '',
      whatsapp_number: '',
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadUserProfile(),
        loadUserPlaces(),
        loadHostReviews(),
        loadHostReports(),
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      t('signOut'),
      t('signOutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              logout();
              navigation.navigate('Main');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  // Component variables - ensure they're inside the component function
  const displayName = userProfile?.full_name || userProfile?.first_name || user?.displayName || 'User';
  const profileImageUrl = userProfile?.profile_image_url;
  const isActive = userProfile?.is_active ?? true;
  const phoneNumber = userProfile?.phone_number || user?.phoneNumber || t('notProvided');
  // WhatsApp number may not exist in profile yet - show "Not provided" if missing
  const whatsappNumber = (userProfile as any)?.whatsapp_number || t('notProvided');

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.refreshIndicator]}
          tintColor={colors.refreshIndicator}
        />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {profileImageUrl ? (
            <Image 
              source={{ uri: profileImageUrl }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="person" size={rf(50)} color={colors.textInverse} />
            </View>
          )}
          {/* Active Status Indicator */}
          <View style={[
            styles.activeStatusIndicator, 
            { backgroundColor: isActive ? '#4CAF50' : '#9E9E9E' }
          ]}>
            <View style={styles.activeStatusDot} />
          </View>
        </View>
        
        <Text style={[styles.profileName, { color: colors.text }]}>
          {displayName}
        </Text>
        <View style={styles.statusBadge}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isActive ? '#4CAF50' : '#9E9E9E' }
          ]} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {isActive ? t('active').toUpperCase() : 'INACTIVE'}
          </Text>
        </View>
      </View>

      {/* Host Statistics */}
      {true && (
        <View style={[styles.userInfo, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
          <Text style={[styles.userInfoTitle, { color: colors.text }]}>{t('hostStatistics')}</Text>
          <View style={styles.hostStatsContainer}>
            <View style={[styles.hostStatCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.hostStatNumber, { color: colors.primary }]}>{hostStats.totalPlaces}</Text>
              <Text style={[styles.hostStatLabel, { color: colors.textSecondary }]}>{t('places')}</Text>
            </View>
            <View style={[styles.hostStatCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.hostStatNumber, { color: colors.primary }]}>{hostStats.totalReviews}</Text>
              <Text style={[styles.hostStatLabel, { color: colors.textSecondary }]}>{t('reviews')}</Text>
            </View>
            <View style={[styles.hostStatCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.hostStatNumber, { color: colors.primary }]}>{hostStats.averageRating.toFixed(1)}</Text>
              <Text style={[styles.hostStatLabel, { color: colors.textSecondary }]}>{t('rating')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Places Management Section */}
      {true && (
        <View style={[styles.userInfo, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
          <View style={styles.placesHeader}>
            <Text style={[styles.userInfoTitle, { color: colors.text }]}>{t('placesManagement')}</Text>
            <View style={[styles.placesCountBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.placesCountText, { color: colors.primary }]}>
                {loadingPlaces ? '...' : `${userPlaces.length} ${t('places')}`}
              </Text>
            </View>
          </View>

          {loadingPlaces ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loadingPlaces')}</Text>
            </View>
          ) : userPlaces.length === 0 ? (
            <View style={styles.emptyPlacesContainer}>
              <MaterialIcons name="add-location" size={rf(32)} color={colors.textSecondary} />
              <Text style={[styles.emptyPlacesText, { color: colors.textSecondary }]}>{t('noPlacesAddedYet')}</Text>
              <Text style={[styles.emptyPlacesSubtext, { color: colors.textSecondary }]}>
                {t('addFirstPlaceToHelp')}
              </Text>
            </View>
          ) : (
            <View style={styles.placesList}>
              {userPlaces.slice(0, 3).map((place) => (
                <View key={place.id} style={[styles.placeCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={styles.placeHeader}>
                    <View style={styles.placeInfo}>
                      <Text style={[styles.placeName, { color: colors.text }]}>{place.title}</Text>
                      <Text style={[styles.placeAddress, { color: colors.textSecondary }]}>{place.address}</Text>
                      <Text style={[styles.placeType, { backgroundColor: colors.primaryLight, color: colors.primary }]}>
                        {place.type}
                      </Text>
                    </View>
                    <View style={styles.placeStatusContainer}>
                      <View style={[
                        styles.placeStatusBadge,
                        { backgroundColor: place.is_open ? '#22C55E' : '#EF4444' }
                      ]}>
                        <Text style={styles.placeStatusText}>
                          {place.is_open ? t('open').toUpperCase() : t('closed').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.statusToggle}>
                        <Text style={[styles.statusToggleText, { color: colors.textSecondary }]}>
                          {place.is_open ? t('close') : t('open')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Host Action Buttons */}
          <View style={styles.hostActions}>
            <TouchableOpacity
              style={[styles.hostActionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddPlace')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add-circle" size={rf(20)} color="white" />
              <Text style={styles.hostActionButtonText}>{t('addPlace')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.hostActionButton, { backgroundColor: '#4ECDC4' }]}
              onPress={() => navigation.navigate('MyPlaces')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="edit-location" size={rf(20)} color="white" />
              <Text style={styles.hostActionButtonText}>{t('managePlaces')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Place Status Management Section */}
      {true && (
        <View style={[styles.userInfo, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
          <Text style={[styles.userInfoTitle, { color: colors.text }]}>{t('placeStatusControl')}</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            {t('manageOpenClosedStatus')}
          </Text>
          
          <View style={styles.placeStatusList}>
            {userPlaces.map((place) => (
              <View key={place.id} style={[styles.placeStatusCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.placeStatusHeader}>
                  <View style={styles.placeStatusInfo}>
                    <Text style={[styles.placeStatusName, { color: colors.text }]} numberOfLines={1}>
                      {place.title}
                    </Text>
                    <Text style={[styles.placeStatusType, { color: colors.textSecondary }]}>
                      {place.type.charAt(0).toUpperCase() + place.type.slice(1)}
                    </Text>
                  </View>
                  
                  <View style={styles.placeStatusControls}>
                    <View style={[
                      styles.statusIndicator, 
                      { backgroundColor: place.is_open ? '#4CAF50' : '#F44336' }
                    ]}>
                      <Text style={styles.statusIndicatorText}>
                        {place.is_open ? t('open').toUpperCase() : t('closed').toUpperCase()}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.statusToggleButton,
                        { 
                          backgroundColor: place.is_open ? '#F44336' : '#4CAF50',
                          opacity: togglingStatus === place.id ? 0.6 : 1
                        }
                      ]}
                      onPress={() => {
                        console.log(`🎯 Toggle button pressed for place: ${place.title} (${place.id})`);
                        console.log(`📊 Current status: ${place.is_open ? 'OPEN' : 'CLOSED'}`);
                        handleTogglePlaceStatus(place.id, place.is_open ?? true, place.title);
                      }}
                      disabled={togglingStatus === place.id}
                      activeOpacity={0.8}
                    >
                      {togglingStatus === place.id ? (
                        <MaterialIcons name="hourglass-empty" size={rf(16)} color="white" />
                      ) : (
                        <MaterialIcons 
                          name={place.is_open ? 'close' : 'check'} 
                          size={rf(16)} 
                          color="white" 
                        />
                      )}
                      <Text style={styles.statusToggleText}>
                        {place.is_open ? t('close') : t('open')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Status Message */}
                {place.status_message && (
                  <View style={[styles.statusMessageContainer, { backgroundColor: colors.primaryLight }]}>
                    <MaterialIcons name="info" size={rf(14)} color={colors.primary} />
                    <Text style={[styles.statusMessageText, { color: colors.text }]}>
                      {place.status_message}
                    </Text>
                  </View>
                )}
                
                {/* Last Updated */}
                {place.status_updated_at && (
                  <Text style={[styles.statusUpdatedText, { color: colors.textSecondary }]}>
                    {t('statusUpdated')} {new Date(place.status_updated_at).toLocaleDateString()} {t('at')} {new Date(place.status_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Reviews Management Section */}
      {true && (
        <View style={[styles.userInfo, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.userInfoTitle, { color: colors.text }]}>{t('recentReviews')}</Text>
            <View style={[styles.reviewsCountBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.reviewsCountText, { color: colors.primary }]}>
                {loadingReviews ? '...' : `${hostReviews.length} reviews`}
              </Text>
            </View>
          </View>

          {loadingReviews ? (
            <View style={styles.loadingContainer}>
              <MaterialIcons name="hourglass-empty" size={rf(24)} color={colors.textSecondary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loadingReviews')}</Text>
            </View>
          ) : hostReviews.length === 0 ? (
            <View style={styles.emptyReviewsContainer}>
              <MaterialIcons name="rate-review" size={rf(32)} color={colors.textSecondary} />
              <Text style={[styles.emptyReviewsText, { color: colors.textSecondary }]}>
                {t('noReviewsYet')}
              </Text>
              <Text style={[styles.emptyReviewsSubtext, { color: colors.textSecondary }]}>
                {t('reviewsFromVisitors')}
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {hostReviews.slice(0, 3).map((review) => (
                <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  {/* Review Header */}
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Text style={[styles.reviewerName, { color: colors.text }]}>{review.reviewer_name}</Text>
                      <View style={styles.ratingContainer}>
                        {[...Array(5)].map((_, i) => (
                          <MaterialIcons
                            key={i}
                            name="star"
                            size={rf(14)}
                            color={i < review.rating ? '#FFD700' : colors.border}
                          />
                        ))}
                      </View>
                    </View>
                    <View style={styles.reviewActions}>
                      <TouchableOpacity
                        style={[styles.reviewActionButton, { backgroundColor: colors.primary }]}
                        onPress={() => setReplyingToReview(replyingToReview === review.id ? null : review.id)}
                      >
                        <MaterialIcons name="reply" size={rf(16)} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.reviewActionButton, { backgroundColor: colors.error }]}
                        onPress={() => handleDeleteReview(review.id, review.reviewer_name)}
                      >
                        <MaterialIcons name="delete" size={rf(16)} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Place Name */}
                  <Text style={[styles.reviewPlaceName, { color: colors.textSecondary }]}>
                    On: {review.places?.title || 'Unknown Place'}
                  </Text>

                  {/* Review Content */}
                  <Text style={[styles.reviewComment, { color: colors.text }]}>{review.comment}</Text>

                  {/* Host Response */}
                  {review.host_response && (
                    <View style={[styles.hostResponseContainer, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.hostResponseLabel, { color: colors.primary }]}>{t('yourReply')}</Text>
                      <Text style={[styles.hostResponseText, { color: colors.text }]}>{review.host_response}</Text>
                    </View>
                  )}

                  {/* Reply Input */}
                  {replyingToReview === review.id && !review.host_response && (
                    <View style={styles.replyInputContainer}>
                      <TextInput
                        style={[styles.replyInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        value={replyText}
                        onChangeText={setReplyText}
                        placeholder={t('writeYourReply')}
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={2}
                      />
                      <View style={styles.replyButtons}>
                        <TouchableOpacity
                          style={[styles.replyButton, styles.cancelButton, { backgroundColor: colors.textSecondary }]}
                          onPress={() => {
                            setReplyingToReview(null);
                            setReplyText('');
                          }}
                        >
                          <Text style={styles.replyButtonText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.replyButton, styles.sendButton, { backgroundColor: colors.primary }]}
                          onPress={() => handleReplyToReview(review.id)}
                        >
                          <Text style={styles.replyButtonText}>{t('sendReply')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Review Date */}
                  <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}

              {hostReviews.length > 3 && (
                <TouchableOpacity
                  style={[styles.viewAllReviewsButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    // TODO: Navigate to full reviews screen
                    Alert.alert(t('comingSoon'), t('comingSoonFullReviews'));
                  }}
                >
                  <Text style={styles.viewAllReviewsText}>{t('viewAllReviews').replace('{count}', hostReviews.length.toString())}</Text>
                  <MaterialIcons name="arrow-forward" size={rf(16)} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* Reports Management Section */}
      {true && (
        <View style={[styles.userInfo, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.userInfoTitle, { color: colors.text }]}>{t('reportsManagement')}</Text>
            <View style={[styles.reviewsCountBadge, { backgroundColor: '#FF5722' }]}>
              <Text style={[styles.reviewsCountText, { color: 'white' }]}>
                {loadingReports ? '...' : `${reportStats.pendingReports} ${t('pending')}`}
              </Text>
            </View>
          </View>

          {loadingReports ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('loadingReports')}</Text>
            </View>
          ) : hostReports.length === 0 ? (
            <View style={styles.emptyReviewsContainer}>
              <MaterialIcons name="flag" size={rf(32)} color={colors.textSecondary} />
              <Text style={[styles.emptyReviewsText, { color: colors.textSecondary }]}>{t('noReportsYet')}</Text>
              <Text style={[styles.emptyReviewsSubtext, { color: colors.textSecondary }]}>
                {t('reportsAboutReviews')}
              </Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {hostReports.slice(0, 3).map((report) => (
                <View key={report.report_id} style={[styles.reportCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  {/* Report Header */}
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text style={[styles.reportCategory, { color: '#FF5722' }]}>
                        {report.report_category.toUpperCase()}
                      </Text>
                      <Text style={[styles.reportReason, { color: colors.text }]}>
                        {report.report_reason}
                      </Text>
                    </View>
                    <View style={[
                      styles.reportStatusBadge,
                      { backgroundColor: report.status === 'pending' ? '#FF9800' : report.status === 'resolved' ? '#4CAF50' : '#9E9E9E' }
                    ]}>
                      <Text style={styles.reportStatusText}>
                        {report.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Reported Review */}
                  <View style={[styles.reportedReviewContainer, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.reportedReviewLabel, { color: colors.primary }]}>{t('reportedReview')}</Text>
                    <Text style={[styles.reportedReviewText, { color: colors.text }]} numberOfLines={2}>
                      "{report.review_comment}"
                    </Text>
                    <Text style={[styles.reportedReviewMeta, { color: colors.textSecondary }]}>
                      By {report.reviewer_name} • {report.review_rating}⭐ • On {report.place_name}
                    </Text>
                  </View>

                  {/* Reporter Info */}
                  <Text style={[styles.reporterInfo, { color: colors.textSecondary }]}>
                    {t('reportedBy')} {report.reporter_name} • {new Date(report.reported_at).toLocaleDateString()}
                  </Text>

                  {/* Additional Details */}
                  {report.additional_details && (
                    <Text style={[styles.reportDetails, { color: colors.text }]}>
                      {t('details')} {report.additional_details}
                    </Text>
                  )}

                  {/* Report Actions */}
                  {report.status === 'pending' && (
                    <View style={styles.reportActions}>
                      <TouchableOpacity
                        style={[styles.reportActionButton, { backgroundColor: '#4CAF50' }]}
                        onPress={() => handleUpdateReportStatus(report.report_id, 'resolved', report.reporter_name)}
                      >
                        <MaterialIcons name="check" size={rf(16)} color="white" />
                        <Text style={styles.reportActionText}>{t('resolve')}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.reportActionButton, { backgroundColor: '#9E9E9E' }]}
                        onPress={() => handleUpdateReportStatus(report.report_id, 'dismissed', report.reporter_name)}
                      >
                        <MaterialIcons name="close" size={rf(16)} color="white" />
                        <Text style={styles.reportActionText}>{t('dismiss')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {hostReports.length > 3 && (
                <TouchableOpacity
                  style={[styles.viewAllReviewsButton, { backgroundColor: '#FF5722' }]}
                  onPress={() => {
                    Alert.alert(t('comingSoon'), t('comingSoonFullReviews'));
                  }}
                >
                  <Text style={styles.viewAllReviewsText}>{t('viewAllReports').replace('{count}', hostReports.length.toString())}</Text>
                  <MaterialIcons name="arrow-forward" size={rf(16)} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {/* User Info */}
      <View style={[styles.userInfo, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
        <View style={styles.contactHeader}>
          <Text style={[styles.userInfoTitle, { color: colors.text }]}>{t('contactInformation')}</Text>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primaryLight }]}
            onPress={handleEditContact}
            activeOpacity={0.7}
          >
            <MaterialIcons name="edit" size={rf(16)} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {editingContact ? (
          <View style={styles.contactEditContainer}>
            <View style={styles.contactInputContainer}>
              <Text style={[styles.contactInputLabel, { color: colors.text }]}>{t('phoneNumber')}</Text>
              <TextInput
                style={[styles.contactInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={contactForm.phone_number}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, phone_number: text }))}
                placeholder={t('enterPhoneNumber')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.contactInputContainer}>
              <Text style={[styles.contactInputLabel, { color: colors.text }]}>{t('whatsappNumber')}</Text>
              <TextInput
                style={[styles.contactInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={contactForm.whatsapp_number}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, whatsapp_number: text }))}
                placeholder={t('enterWhatsAppNumber')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.contactEditButtons}>
              <TouchableOpacity
                style={[styles.contactEditButton, styles.cancelButton, { backgroundColor: colors.textSecondary }]}
                onPress={handleCancelEditContact}
              >
                <Text style={styles.editContactButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.contactEditButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveContact}
              >
                <Text style={styles.editContactButtonText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.userInfoRow}>
              <MaterialIcons name="phone" size={rf(24)} color={colors.primary} style={styles.userInfoIcon} />
              <Text style={[styles.userInfoText, { color: colors.text }]}>{phoneNumber}</Text>
            </View>
            
            <View style={styles.userInfoRow}>
              <MaterialIcons name="chat" size={rf(24)} color="#25D366" style={styles.userInfoIcon} />
              <Text style={[styles.userInfoText, { color: colors.text }]}>{whatsappNumber}</Text>
            </View>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <MaterialIcons 
          name="logout" 
          size={rf(24)} 
          color={colors.error} 
          style={styles.actionButtonIcon}
        />
        <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
          {t('signOut')}
        </Text>
        <MaterialIcons 
          name="chevron-right" 
          size={rf(20)} 
          color={colors.error}
          style={styles.actionButtonChevron}
        />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: rs(24),
    paddingTop: rs(40),
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: rs(16),
  },
  profileImage: {
    width: rs(100),
    height: rs(100),
    borderRadius: rs(50),
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  profileImagePlaceholder: {
    width: rs(100),
    height: rs(100),
    borderRadius: rs(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  activeStatusIndicator: {
    position: 'absolute',
    bottom: rs(5),
    right: rs(5),
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  activeStatusDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: 'white',
  },
  profileName: {
    fontSize: rf(24),
    fontWeight: '700',
    marginBottom: rs(8),
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(16),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  statusDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    marginRight: rs(6),
  },
  statusText: {
    fontSize: rf(12),
    fontWeight: '600',
  },
  
  // User Info Styles
  userInfo: {
    margin: rs(16),
    padding: rs(20),
    borderRadius: rs(12),
    borderWidth: 1,
  },
  userInfoTitle: {
    fontSize: rf(18),
    fontWeight: '700',
    marginBottom: rs(16),
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(16),
  },
  editButton: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(12),
  },
  userInfoIcon: {
    marginRight: rs(12),
    width: rs(24),
  },
  userInfoText: {
    fontSize: rf(16),
    flex: 1,
  },
  
  // Host Statistics Styles
  hostStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(12),
    marginBottom: rs(16),
  },
  hostStatCard: {
    flex: 1,
    minWidth: rs(80),
    padding: rs(12),
    borderRadius: rs(8),
    alignItems: 'center',
    borderWidth: 1,
  },
  hostStatNumber: {
    fontSize: rf(20),
    fontWeight: '700',
    marginBottom: rs(4),
  },
  hostStatLabel: {
    fontSize: rf(12),
    textAlign: 'center',
  },

  // Places Management Styles
  placesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(16),
  },
  placesCountBadge: {
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(16),
  },
  placesCountText: {
    fontSize: rf(12),
    fontWeight: '600',
  },
  loadingContainer: {
    padding: rs(20),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: rf(14),
  },
  emptyPlacesContainer: {
    alignItems: 'center',
    padding: rs(20),
  },
  emptyPlacesText: {
    fontSize: rf(16),
    fontWeight: '600',
    marginTop: rs(12),
    marginBottom: rs(8),
  },
  emptyPlacesSubtext: {
    fontSize: rf(14),
    textAlign: 'center',
    lineHeight: rf(20),
  },
  placesList: {
    gap: rs(12),
  },
  placeCard: {
    borderWidth: 1,
    borderRadius: rs(12),
    padding: rs(16),
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rs(12),
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: rf(16),
    fontWeight: '600',
    marginBottom: rs(4),
  },
  placeAddress: {
    fontSize: rf(14),
    marginBottom: rs(8),
  },
  placeType: {
    fontSize: rf(12),
    fontWeight: '600',
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
    alignSelf: 'flex-start',
  },
  placeStatusContainer: {
    alignItems: 'flex-end',
  },
  placeStatusBadge: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
    marginBottom: rs(8),
  },
  placeStatusText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: 'white',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusToggleText: {
    fontSize: rf(12),
    marginRight: rs(8),
  },

  // Host Action Buttons
  hostActions: {
    flexDirection: 'row',
    gap: rs(12),
    marginTop: rs(16),
  },
  hostActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(14),
    borderRadius: rs(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(3),
  },
  hostActionButtonText: {
    fontSize: rf(14),
    fontWeight: '600',
    color: 'white',
    marginLeft: rs(8),
  },

  // Place Status Management Styles
  sectionSubtitle: {
    fontSize: rf(12),
    marginBottom: rs(16),
    lineHeight: rf(16),
  },
  placeStatusList: {
    gap: rs(12),
  },
  placeStatusCard: {
    padding: rs(16),
    borderRadius: rs(12),
    borderWidth: 1,
  },
  placeStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(8),
  },
  placeStatusInfo: {
    flex: 1,
    marginRight: rs(12),
  },
  placeStatusName: {
    fontSize: rf(16),
    fontWeight: '600',
    marginBottom: rs(2),
  },
  placeStatusType: {
    fontSize: rf(12),
    textTransform: 'capitalize',
  },
  placeStatusControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  statusIndicator: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
  },
  statusIndicatorText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  statusToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(16),
    gap: rs(4),
  },
  statusToggleText: {
    fontSize: rf(12),
    fontWeight: '600',
    color: 'white',
  },
  statusMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(8),
    borderRadius: rs(6),
    marginBottom: rs(4),
    gap: rs(6),
  },
  statusMessageText: {
    fontSize: rf(12),
    flex: 1,
    lineHeight: rf(16),
  },
  statusUpdatedText: {
    fontSize: rf(10),
    textAlign: 'right',
  },

  // Reviews Management Styles
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(16),
  },
  reviewsCountBadge: {
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(16),
  },
  reviewsCountText: {
    fontSize: rf(12),
    fontWeight: '600',
  },
  emptyReviewsContainer: {
    alignItems: 'center',
    paddingVertical: rs(20),
  },
  emptyReviewsText: {
    fontSize: rf(14),
    fontWeight: '500',
    marginTop: rs(8),
    textAlign: 'center',
  },
  emptyReviewsSubtext: {
    fontSize: rf(12),
    marginTop: rs(4),
    textAlign: 'center',
  },
  reviewsList: {
    gap: rs(12),
  },
  reviewCard: {
    padding: rs(16),
    borderRadius: rs(12),
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rs(8),
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: rf(14),
    fontWeight: '600',
    marginBottom: rs(4),
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: rs(8),
  },
  reviewActionButton: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewPlaceName: {
    fontSize: rf(12),
    fontStyle: 'italic',
    marginBottom: rs(8),
  },
  reviewComment: {
    fontSize: rf(14),
    lineHeight: rf(20),
    marginBottom: rs(8),
  },
  hostResponseContainer: {
    padding: rs(12),
    borderRadius: rs(8),
    marginBottom: rs(8),
  },
  hostResponseLabel: {
    fontSize: rf(12),
    fontWeight: '600',
    marginBottom: rs(4),
  },
  hostResponseText: {
    fontSize: rf(13),
    lineHeight: rf(18),
  },
  replyInputContainer: {
    marginTop: rs(8),
  },
  replyInput: {
    borderWidth: 1,
    borderRadius: rs(8),
    padding: rs(12),
    fontSize: rf(14),
    minHeight: rs(60),
    textAlignVertical: 'top',
    marginBottom: rs(8),
  },
  replyButtons: {
    flexDirection: 'row',
    gap: rs(8),
  },
  replyButton: {
    flex: 1,
    paddingVertical: rs(8),
    paddingHorizontal: rs(16),
    borderRadius: rs(6),
    alignItems: 'center',
  },
  sendButton: {
    flex: 0.6,
  },
  replyButtonText: {
    fontSize: rf(12),
    fontWeight: '600',
    color: 'white',
  },
  reviewDate: {
    fontSize: rf(11),
    textAlign: 'right',
  },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(12),
    borderRadius: rs(8),
    marginTop: rs(8),
  },
  viewAllReviewsText: {
    fontSize: rf(14),
    fontWeight: '600',
    color: 'white',
    marginRight: rs(8),
  },

  // Reports Management Styles
  reportCard: {
    borderWidth: 1,
    borderRadius: rs(12),
    padding: rs(16),
    marginBottom: rs(12),
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rs(12),
  },
  reportInfo: {
    flex: 1,
  },
  reportCategory: {
    fontSize: rf(12),
    fontWeight: '700',
    marginBottom: rs(4),
  },
  reportReason: {
    fontSize: rf(16),
    fontWeight: '600',
  },
  reportStatusBadge: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
  },
  reportStatusText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: 'white',
  },
  reportedReviewContainer: {
    padding: rs(12),
    borderRadius: rs(8),
    marginBottom: rs(12),
  },
  reportedReviewLabel: {
    fontSize: rf(12),
    fontWeight: '600',
    marginBottom: rs(4),
  },
  reportedReviewText: {
    fontSize: rf(14),
    fontStyle: 'italic',
    marginBottom: rs(4),
  },
  reportedReviewMeta: {
    fontSize: rf(12),
  },
  reporterInfo: {
    fontSize: rf(12),
    marginBottom: rs(8),
  },
  reportDetails: {
    fontSize: rf(13),
    fontStyle: 'italic',
    marginBottom: rs(12),
  },
  reportActions: {
    flexDirection: 'row',
    gap: rs(8),
  },
  reportActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    borderRadius: rs(6),
    flex: 1,
    justifyContent: 'center',
  },
  reportActionText: {
    fontSize: rf(12),
    fontWeight: '600',
    color: 'white',
    marginLeft: rs(4),
  },
  
  // Contact Edit Styles
  contactEditContainer: {
    gap: rs(16),
  },
  contactInputContainer: {
    marginBottom: rs(12),
  },
  contactInputLabel: {
    fontSize: rf(14),
    fontWeight: '500',
    marginBottom: rs(8),
  },
  contactInput: {
    borderWidth: 1,
    borderRadius: rs(8),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    fontSize: rf(14),
  },
  contactEditButtons: {
    flexDirection: 'row',
    gap: rs(12),
    marginTop: rs(8),
  },
  contactEditButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(10),
    paddingHorizontal: rs(16),
    borderRadius: rs(8),
    gap: rs(6),
  },
  cancelButton: {
    flex: 0.4,
  },
  saveButton: {
    flex: 0.6,
  },
  editContactButtonText: {
    fontSize: rf(14),
    fontWeight: '600',
    color: 'white',
  },
  
  // Action Button Styles
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: rs(16),
    borderRadius: rs(12),
    borderWidth: 1,
    margin: rs(16),
  },
  actionButtonIcon: {
    marginRight: rs(12),
  },
  actionButtonText: {
    fontSize: rf(16),
    fontWeight: '500',
    flex: 1,
  },
  actionButtonTextDanger: {
    color: '#EF4444',
  },
  actionButtonChevron: {
    marginLeft: rs(8),
  },
});