import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Modal,
  Platform,
  RefreshControl,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuthStore } from '../lib/authStore';
import { useUserInfo } from '../lib/authHelper';
import { ImageUploadService } from '../services/image-upload.service';
import { UserProfileService, UserProfile } from '../services/user-profile.service';
import { BookmarksService } from '../services/bookmarks.service';
import { ReviewsService } from '../services/reviews.service';
import { rf, rs } from '../utils/responsive';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { logout, userProfile: authUserProfile, loadUserProfile, updateUserProfile } = useAuthStore();
  const { user, isAuthenticated, getUserDisplayName, getUserPhone, isVerifiedUser } = useUserInfo();

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(authUserProfile as UserProfile | null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Stats state
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    city: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Manual date selection state
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 18);
  const [calendarView, setCalendarView] = useState<'days' | 'months' | 'years'>('days');
  // Age constraints
  const MIN_AGE = 15;
  const MAX_AGE = 90;

  // Load user profile on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Use profile from auth store if available, otherwise load it
      if (authUserProfile) {
        setUserProfile(authUserProfile as UserProfile);
        // Load stats even if profile is cached
        loadUserStats();
      } else {
        loadUserProfileData();
      }
    } else {
      setUserProfile(null);
      // Reset stats when not authenticated
      setBookmarkCount(0);
      setReviewCount(0);
    }
  }, [isAuthenticated, user, authUserProfile]);

  const loadUserProfileData = async () => {
    if (!isAuthenticated || !user?.uid) {
      console.log('❌ User not authenticated or no user ID available');
      return;
    }

    try {
      setLoadingProfile(true);
      console.log('👤 Loading profile for user:', user.uid);

      // Use auth store method to load profile
      await loadUserProfile();

      // Also load stats
      await loadUserStats();

    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadUserStats = async () => {
    if (!isAuthenticated || !user?.uid) {
      console.log('❌ User not authenticated or no user ID available for loading stats');
      setBookmarkCount(0);
      setReviewCount(0);
      return;
    }

    try {
      setLoadingStats(true);
      console.log('📊 Loading user stats for:', user.uid);

      // Load bookmark count
      const bookmarkStats = await BookmarksService.getUserBookmarkStats(user.uid);
      setBookmarkCount(bookmarkStats.totalBookmarks);

      // Load review count
      const reviewStats = await ReviewsService.getUserReviewStats(user.uid);
      setReviewCount(reviewStats.totalReviews);

    } catch (error) {
      console.error('❌ Error loading user stats:', error);
      setBookmarkCount(0);
      setReviewCount(0);
    } finally {
      setLoadingStats(false);
    }
  };

  // Helper functions for manual date selection
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const generateCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const days: Array<{ day: number | null; isCurrentMonth: boolean; isDisabled?: boolean }> = [];

    // Compute age constraints relative to today
    const todayDate = new Date();
    const maxBirthDate = new Date(todayDate.getFullYear() - MIN_AGE, todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 999); // latest allowed birth date
    const minBirthDate = new Date(todayDate.getFullYear() - MAX_AGE, todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0); // earliest allowed birth date

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add days of the current month (mark disabled if they would lead to age < MIN_AGE or > MAX_AGE)
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(selectedYear, selectedMonth - 1, i);
      const isDisabled = dayDate > maxBirthDate || dayDate < minBirthDate || dayDate > new Date();
      days.push({ day: i, isCurrentMonth: true, isDisabled });
    }

    // Add days from next month to fill the grid (if needed)
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const getMonthNames = () => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDayNames = () => ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getMonthName = (monthNumber: number) => {
    const months = getMonthNames();
    return months[monthNumber - 1];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYear - 1 : selectedYear + 1;
    const currentYear = new Date().getFullYear();

    // Prevent going too far into the future or past
    if (newYear >= 1900 && newYear <= currentYear) {
      setSelectedYear(newYear);
    }
  };

  const handleCalendarDayPress = (day: number) => {
    if (!day) return; // Ignore empty cells

    // Just update the selected day, don't apply the date yet
    setSelectedDay(day);
  };

  const handleCalendarOkPress = () => {
    if (!selectedDay) {
      Alert.alert(
        t('error') || 'Error',
        t('pleaseSelectDate') || 'Please select a date first'
      );
      return;
    }

    // Create the selected date object
    const selectedDateObj = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const today = new Date();

    // Validate date is not in future
    if (selectedDateObj > today) {
      Alert.alert(
        t('error') || 'Error',
        t('invalidBirthDate') || 'Please select a valid birth date (not in the future)'
      );
      return;
    }

    // Validate date is not too old (more than MAX_AGE years)
    const maxPastDate = new Date();
    maxPastDate.setFullYear(today.getFullYear() - MAX_AGE);

    if (selectedDateObj < maxPastDate) {
      Alert.alert(
        t('error') || 'Error',
        t('birthDateTooOld') || 'Please select a more recent birth date'
      );
      return;
    }

    // Validate minimum age (not under MIN_AGE years)
    const minAllowedDate = new Date();
    minAllowedDate.setFullYear(today.getFullYear() - MIN_AGE);
    minAllowedDate.setHours(23, 59, 59, 999);

    if (selectedDateObj > minAllowedDate) {
      Alert.alert(
        t('error') || 'Error',
        t('minimumAgeError') || `You must be at least ${MIN_AGE} years old`
      );
      return;
    }

    // Create date string in YYYY-MM-DD format
    const dateString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;

    // Update form immediately and close modal
    setEditForm(prev => ({ ...prev, date_of_birth: dateString }));
    setShowDatePicker(false);
  };

  // Image picker functions
  const openImagePickerOptions = () => {
    const title = t('selectImage') || 'Select Image';
    const message = t('choose Profile Image Source') || 'choose Profile Image Source';

    // iOS: use ActionSheet for native behavior
    if (Platform.OS === 'ios' && ActionSheetIOS && ActionSheetIOS.showActionSheetWithOptions) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('camera') || 'Camera', t('gallery') || 'Gallery', t('cancel') || 'Cancel'],
          cancelButtonIndex: 2,
        },
        (buttonIndex: number) => {
          if (buttonIndex === 0) handleImagePickerOption('camera');
          else if (buttonIndex === 1) handleImagePickerOption('gallery');
        }
      );
      return;
    }

    // Android / fallback: show an Alert dialog with three buttons
    Alert.alert(
      title,
      message,
      [
        { text: t('camera') || 'Camera', onPress: () => handleImagePickerOption('camera') },
        { text: t('gallery') || 'Gallery', onPress: () => handleImagePickerOption('gallery') },
        { text: t('cancel') || 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true }
    );
  };

  const handleProfileImagePress = () => {
    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    // Show native action sheet / dialog
    openImagePickerOptions();
  };

  const handleImagePickerOption = async (option: 'camera' | 'gallery') => {
    setShowImagePicker(false);

    try {
      let result;

      if (option === 'camera') {
        // Request camera permissions
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert(
            t('error') || 'Error',
            t('cameraPermissionRequired') || 'Permission to access camera is required'
          );
          return;
        }

        // Launch camera (request base64 data to avoid file:// vs content:// issues)
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true, // <--- enable base64
        });
      } else {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            t('error') || 'Error',
            t('permissionRequired') || 'Permission to access media library is required'
          );
          return;
        }

        // Launch image library (request base64 data)
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true, // <--- enable base64
        });
      }

      if (!result.canceled && result.assets[0]) {
        // Store base64 and uri for the upload service to use (handles content:// URIs on Android)
        try {
          (global as any).selectedImageData = {
            base64: result.assets[0].base64,
            uri: result.assets[0].uri,
            fileName: result.assets[0].fileName || `photo_${Date.now()}`,
            type: result.assets[0].type || 'image',
          };
        } catch (storeErr) {
          console.warn('⚠️ Could not store selected image data:', storeErr);
        }

        await uploadProfileImage(result.assets[0].uri);
      }

    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert(
        t('error') || 'Error',
        t('failedToPickImage') || 'Failed to pick image'
      );
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    if (!user?.uid) return;

    try {
      setUploadingImage(true);

      // Upload image using ImageUploadService (ensure correct param order: imageUri, userId)
      const imageUrl = await ImageUploadService.uploadProfileImage(imageUri, user.uid);

      // Update profile with new image URL
      await updateUserProfile({
        profile_image_url: imageUrl,
      });

      // Update local state
      setUserProfile(authUserProfile as UserProfile | null);

      Alert.alert(
        t('success') || 'Success',
        t('profileImageUpdated') || 'Profile image updated successfully'
      );

    } catch (error) {
      console.error('❌ Upload profile image error:', error);
      const message = error instanceof Error ? error.message : (t('failedToUploadImage') || 'Failed to upload image');
      Alert.alert(
        t('error') || 'Error',
        message
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDatePickerPress = () => {
    // Initialize manual date selection with current form value or defaults
    if (editForm.date_of_birth) {
      const date = new Date(editForm.date_of_birth);
      const todayDate = new Date();
      const maxBirthDate = new Date(todayDate.getFullYear() - MIN_AGE, todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 999);

      // If prefilled date would make the user under MIN_AGE, warn and fall back to defaults
      if (date > maxBirthDate) {
        Alert.alert(
          t('error') || 'Error',
          t('minimumAgeError') || `You must be at least ${MIN_AGE} years old`
        );
        const currentYear = new Date().getFullYear();
        setSelectedDay(1);
        setSelectedMonth(1);
        setSelectedYear(currentYear - MIN_AGE);
        setSelectedDate(new Date(currentYear - MIN_AGE, 0, 1));
      } else {
        setSelectedDay(date.getDate());
        setSelectedMonth(date.getMonth() + 1);
        setSelectedYear(date.getFullYear());
        setSelectedDate(date);
      }
    } else {
      // Set neutral defaults that don't assume user's age
      const currentYear = new Date().getFullYear();
      setSelectedDay(1);
      setSelectedMonth(1);
      setSelectedYear(currentYear - 18); // Legal adult age as neutral default
      const defaultDate = new Date(currentYear - 18, 0, 1);
      setSelectedDate(defaultDate);
    }
    setCalendarView('days'); // Always start with days view
    setShowDatePicker(true);
  };

  // Helper function to format date nicely
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to calculate age
  const calculateAge = (dateString: string) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const isSelectedDateAllowed = () => {
    if (!selectedDay) return false;
    const todayDate = new Date();
    const selectedDateObj = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const maxBirthDate = new Date(todayDate.getFullYear() - MIN_AGE, todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 999);
    const minBirthDate = new Date(todayDate.getFullYear() - MAX_AGE, todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);

    if (selectedDateObj > maxBirthDate || selectedDateObj < minBirthDate || selectedDateObj > todayDate) return false;
    return true;
  };

  const handleEditProfile = () => {
    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    // Pre-fill form with current profile data
    setEditForm({
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      date_of_birth: userProfile?.date_of_birth || '',
      gender: userProfile?.gender || '',
      city: userProfile?.city || '',
    });

    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    // Check if user is authenticated before proceeding
    if (!isAuthenticated || !user?.uid) {
      Alert.alert(t('error'), t('pleaseLoginFirst') || 'Please login first');
      return;
    }

    try {
      setLoadingProfile(true);

      // Optimistic update - update UI immediately
      const optimisticProfile = {
        ...userProfile,
        first_name: editForm.first_name.trim() || undefined,
        last_name: editForm.last_name.trim() || undefined,
        full_name: `${editForm.first_name.trim()} ${editForm.last_name.trim()}`.trim() || undefined,
        date_of_birth: editForm.date_of_birth || undefined,
        gender: editForm.gender || undefined,
        city: editForm.city.trim() || undefined,
      };

      // Update local state immediately for quick response
      setUserProfile(optimisticProfile as UserProfile);
      setShowEditModal(false);

      // Show success message immediately
      Alert.alert(t('success'), t('profileUpdated'));

      // Update in background
      await updateUserProfile({
        first_name: editForm.first_name.trim() || undefined,
        last_name: editForm.last_name.trim() || undefined,
        date_of_birth: editForm.date_of_birth || undefined,
        gender: editForm.gender || undefined,
        city: editForm.city.trim() || undefined,
      });

      // Sync with auth store after successful update
      setUserProfile(authUserProfile as UserProfile | null);

    } catch (error) {
      console.error('❌ Error updating profile:', error);

      // Revert optimistic update on error
      setUserProfile(authUserProfile as UserProfile | null);
      setShowEditModal(true); // Reopen modal on error

      Alert.alert(t('error'), t('failedToUpdateProfile') || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogin = () => {
    // Set return route to Profile screen
    const { setReturnRoute } = useAuthStore.getState();
    setReturnRoute('Profile');

    navigation.navigate('Login');
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert(t('success'), t('loggedOutSuccessfully'));
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert(t('error'), t('logoutFailed'));
            }
          },
        },
      ]
    );
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserProfile();
      await loadUserStats(); // Also refresh stats
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderProfileHeader = () => {
    if (isAuthenticated && user) {
      const displayName = userProfile?.full_name || getUserDisplayName();
      const profileImageUrl = userProfile?.profile_image_url;

      return (
        <>
          {/* Profile Info Section */}
          <View style={[styles.profileSection, { backgroundColor: colors.background }]}>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity
                style={styles.profileImageTouchable}
                onPress={handleProfileImagePress}
                disabled={uploadingImage}
              >
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    style={[styles.profileImage, { borderWidth: rs(6), borderColor: colors.background }]}
                  />
                ) : (
                  <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary, borderWidth: rs(6), borderColor: colors.background }]}>
                    <MaterialIcons name="person" size={rf(40)} color="white" />
                  </View>
                )}

                <View style={[styles.editImageOverlay, { backgroundColor: 'white', borderWidth: 1.5, borderColor: colors.primary }]}>
                  {uploadingImage ? (
                    <MaterialIcons name="hourglass-empty" size={rf(16)} color={colors.primary} />
                  ) : (
                    <MaterialIcons name="edit" size={rf(16)} color={colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {displayName}
              </Text>

              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {t('active') || 'ACTIVE'}
                </Text>
              </View>

              <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
                {t('memberSince') || 'Member since'} {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'December 23, 2025'}
              </Text>
            </View>
          </View>

          {/* Profile Information Table */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('profileInformation') || 'Profile Information'}
            </Text>
            <View style={[styles.infoTable, { backgroundColor: colors.sectionBackground }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('fullName') || 'Full Name'}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userProfile?.full_name || getUserDisplayName() || 'User'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('age') || 'Age'}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userProfile?.age || '-'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('gender') || 'Gender'}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userProfile?.gender ? t(userProfile.gender) : '-'}
                </Text>
              </View>
            </View>

            {/* Contact Information Group */}
            <Text style={[styles.infoGroupTitle, { color: colors.text }]}>
              {t('contactInformation') || 'Contact Information'}
            </Text>
            <View style={[styles.infoTable, { backgroundColor: colors.sectionBackground }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('city') || 'City'}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {userProfile?.city || '-'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('phoneNumber') || 'Phone number'}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text, marginLeft: -5 }]}>
                  {getUserPhone() || t('notProvided') || 'Not provided'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.editButton, { borderColor: colors.primary }]}
              onPress={handleEditProfile}
            >
              <MaterialIcons name="edit" size={rf(18)} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                {t('editProfile') || 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    return (
      <>
        {/* Guest Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.background }]}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              style={styles.profileImageTouchable}
              onPress={handleLogin}
            >
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.textSecondary }]}>
                <MaterialIcons name="person" size={rf(40)} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileDetails}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {t('guestUser') || 'Guest User'}
            </Text>
            <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
              {t('notLoggedIn') || 'Not logged in'}
            </Text>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
            >
              <Text style={[styles.loginButtonText, { color: 'white' }]}>
                {t('login') || 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
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
        {loadingProfile ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t('loadingProfile')}
            </Text>
          </View>
        ) : (
          renderProfileHeader()
        )}

        {/* Logout Button */}
        {isAuthenticated && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.surface }]}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={rf(20)} color={colors.error} />
              <Text style={[styles.logoutButtonText, { color: colors.error }]}>
                {t('logout')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('editProfile')}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowEditModal(false)}
            >
              <MaterialIcons name="close" size={rf(24)} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('personalInformation')}
            </Text>

            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('firstName')}
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder={t('enterFirstName')}
                placeholderTextColor={colors.textSecondary}
                value={editForm.first_name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, first_name: text }))}
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('lastName')}
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder={t('enterLastName')}
                placeholderTextColor={colors.textSecondary}
                value={editForm.last_name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, last_name: text }))}
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('dateOfBirth')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: editForm.date_of_birth ? colors.primary : colors.border,
                    borderWidth: editForm.date_of_birth ? 2 : 1
                  }
                ]}
                onPress={handleDatePickerPress}
                activeOpacity={0.7}
              >
                <View style={styles.dateButtonContent}>
                  <View style={styles.dateButtonLeft}>
                    <MaterialIcons
                      name="calendar-today"
                      size={rf(22)}
                      color={editForm.date_of_birth ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                      styles.dateButtonText,
                      {
                        color: editForm.date_of_birth ? colors.text : colors.textSecondary,
                        fontWeight: editForm.date_of_birth ? '600' : '400'
                      }
                    ]}>
                      {editForm.date_of_birth ? formatDateForDisplay(editForm.date_of_birth) : t('selectDateOfBirth') || 'Select your date of birth'}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={rf(24)}
                    color={colors.textSecondary}
                  />
                </View>

                {/* Age Display */}
                {editForm.date_of_birth && (
                  <View style={[styles.ageDisplay, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.ageText, { color: colors.primary }]}>
                      Age: {calculateAge(editForm.date_of_birth)} years old
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('gender')}
              </Text>
              <View style={styles.genderContainer}>
                {['male', 'female', 'other'].map((genderOption) => (
                  <TouchableOpacity
                    key={genderOption}
                    style={[
                      styles.genderButton,
                      {
                        backgroundColor: editForm.gender === genderOption ? colors.primary : colors.surface,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setEditForm(prev => ({ ...prev, gender: genderOption as any }))}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      { color: editForm.gender === genderOption ? colors.textInverse : colors.text }
                    ]}>
                      {t(genderOption)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('city')}
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder={t('enterCity')}
                placeholderTextColor={colors.textSecondary}
                value={editForm.city}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, city: text }))}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveProfile}
              disabled={loadingProfile}
            >
              <Text style={[styles.saveButtonText, { color: colors.textInverse }]}>
                {loadingProfile ? t('loading') : t('saveChanges')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modernCalendarOverlay}>
            <View style={[styles.modernCalendarModal, { backgroundColor: colors.background }]}>
              {/* Blue Header with Selected Date */}
              <View style={[styles.modernCalendarHeader, { backgroundColor: colors.primary }]}>
                <TouchableOpacity onPress={() => setCalendarView('years')}>
                  <Text style={[styles.modernHeaderYear, { color: colors.textInverse, opacity: 0.7 }]}>{selectedYear}</Text>
                </TouchableOpacity>
                <Text style={[styles.modernHeaderDate, { color: colors.textInverse }]}>
                  {selectedDay ? `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(selectedYear, selectedMonth - 1, selectedDay).getDay()]}, ${selectedDay} ${getMonthName(selectedMonth).slice(0, 3)}` : 'Select Date'}
                </Text>
              </View>

              {/* White Calendar Section */}
              <View style={[styles.modernCalendarContent, { backgroundColor: colors.background }]}>
                {calendarView === 'days' && (
                  <>
                    {/* Month/Year Navigation */}
                    <View style={styles.modernCalendarNav}>
                      <TouchableOpacity
                        style={styles.modernNavButton}
                        onPress={() => navigateMonth('prev')}
                      >
                        <Text style={[styles.modernNavText, { color: colors.textSecondary }]}>‹</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setCalendarView('months')}>
                        <Text style={[styles.modernMonthYearText, { color: colors.text }]}>
                          {getMonthName(selectedMonth)} {selectedYear}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modernNavButton}
                        onPress={() => navigateMonth('next')}
                      >
                        <Text style={[styles.modernNavText, { color: colors.textSecondary }]}>›</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Day Names */}
                    <View style={styles.modernDayNames}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <View key={index} style={styles.modernDayNameCell}>
                          <Text style={[styles.modernDayNameText, { color: colors.textSecondary }]}>{day}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.modernCalendarGrid}>
                      {generateCalendarGrid().map((dayItem, index) => {
                        const disabled = !dayItem.isCurrentMonth || !!dayItem.isDisabled;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.modernCalendarDay,
                              dayItem.day === selectedDay && dayItem.isCurrentMonth && !dayItem.isDisabled && { backgroundColor: colors.primary },
                              disabled && { opacity: 0.4 }
                            ]}
                            onPress={() => !disabled && dayItem.day && handleCalendarDayPress(dayItem.day)}
                            disabled={disabled}
                          >
                            <Text style={[
                              styles.modernCalendarDayText,
                              { color: colors.text },
                              dayItem.day === selectedDay && dayItem.isCurrentMonth && !dayItem.isDisabled && { color: colors.textInverse, fontWeight: '500' },
                              !dayItem.isCurrentMonth && { color: colors.textSecondary, opacity: 0.5 },
                              dayItem.isDisabled && { color: colors.textSecondary, opacity: 0.35 }
                            ]}>
                              {dayItem.day || ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {calendarView === 'months' && (
                  <>
                    {/* Year Navigation */}
                    <View style={styles.modernCalendarNav}>
                      <TouchableOpacity
                        style={styles.modernNavButton}
                        onPress={() => navigateYear('prev')}
                      >
                        <Text style={[styles.modernNavText, { color: colors.textSecondary }]}>‹</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setCalendarView('years')}>
                        <Text style={[styles.modernMonthYearText, { color: colors.text }]}>{selectedYear}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modernNavButton}
                        onPress={() => navigateYear('next')}
                      >
                        <Text style={[styles.modernNavText, { color: colors.textSecondary }]}>›</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Months Grid */}
                    <View style={styles.modernMonthsGrid}>
                      {getMonthNames().map((month, index) => {
                        const monthIndex = index + 1;
                        const todayDate = new Date();
                        const maxBirthDate = new Date(todayDate.getFullYear() - MIN_AGE, todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 999);
                        const minBirthDate = new Date(todayDate.getFullYear() - MAX_AGE, todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);
                        const monthStart = new Date(selectedYear, monthIndex - 1, 1);
                        const isDisabled = monthStart > maxBirthDate || monthStart < minBirthDate;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.modernMonthItem,
                              selectedMonth === monthIndex && !isDisabled && { backgroundColor: colors.primary, borderRadius: 50 },
                              isDisabled && { opacity: 0.3 }
                            ]}
                            onPress={() => {
                              if (!isDisabled) {
                                setSelectedMonth(monthIndex);
                                setCalendarView('days');
                              }
                            }}
                            disabled={isDisabled}
                          >
                            <Text style={[
                              styles.modernMonthText,
                              { color: colors.text },
                              selectedMonth === monthIndex && !isDisabled && { color: colors.textInverse, fontWeight: '500' },
                              isDisabled && { color: colors.textSecondary, opacity: 0.35 }
                            ]}>
                              {month.slice(0, 3)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {calendarView === 'years' && (
                  <>
                    {/* Year Range Navigation */}
                    <View style={styles.modernCalendarNav}>
                      <TouchableOpacity
                        style={styles.modernNavButton}
                        onPress={() => setSelectedYear(selectedYear - 12)}
                      >
                        <Text style={[styles.modernNavText, { color: colors.textSecondary }]}>‹</Text>
                      </TouchableOpacity>

                      <Text style={[styles.modernMonthYearText, { color: colors.text }]}>
                        {selectedYear - 6} - {selectedYear + 5}
                      </Text>

                      <TouchableOpacity
                        style={styles.modernNavButton}
                        onPress={() => setSelectedYear(selectedYear + 12)}
                      >
                        <Text style={[styles.modernNavText, { color: colors.textSecondary }]}>›</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Years Grid */}
                    <View style={styles.modernYearsGrid}>
                      {Array.from({ length: 12 }, (_, index) => {
                        const year = selectedYear - 6 + index;
                        const todayDate = new Date();
                        const cutoffYear = todayDate.getFullYear() - MIN_AGE;
                        const minBirthYear = Math.max(1900, todayDate.getFullYear() - MAX_AGE);
                        const isDisabled = year > cutoffYear || year < minBirthYear;

                        return (
                          <TouchableOpacity
                            key={year}
                            style={[
                              styles.modernYearItem,
                              selectedYear === year && !isDisabled && { backgroundColor: colors.primary, borderRadius: 50 },
                              isDisabled && { opacity: 0.3 }
                            ]}
                            onPress={() => {
                              if (!isDisabled) {
                                setSelectedYear(year);
                                setCalendarView('months');
                              }
                            }}
                            disabled={isDisabled}
                          >
                            <Text style={[
                              styles.modernYearText,
                              { color: colors.text },
                              selectedYear === year && !isDisabled && { color: colors.textInverse, fontWeight: '500' },
                              isDisabled && { color: colors.textSecondary, opacity: 0.5 }
                            ]}>
                              {year}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {/* Action Buttons */}
                <View style={styles.modernCalendarActions}>
                  <TouchableOpacity
                    style={styles.modernCancelButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={[styles.modernCancelText, { color: colors.primary }]}>CANCEL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modernOkButton}
                    onPress={handleCalendarOkPress}
                    disabled={!selectedDay || !isSelectedDateAllowed()}
                  >
                    <Text style={[
                      styles.modernOkText,
                      { color: colors.primary },
                      (!selectedDay || !isSelectedDateAllowed()) && { color: colors.textSecondary, opacity: 0.5 }
                    ]}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.imagePickerOverlay}>
          <View style={[styles.imagePickerModal, { backgroundColor: colors.background }]}>
            <Text style={[styles.imagePickerTitle, { color: colors.text }]}>
              {t('selectImage') || 'Select Image'}
            </Text>

            <Text style={[styles.imagePickerSubtitle, { color: colors.textSecondary }]}>
              {t('choose Profile ImageSource') || 'choose Profile Image Source'}
            </Text>

            <View style={[styles.imagePickerButtonsContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <View style={styles.imagePickerButtons}>
                <TouchableOpacity
                  style={styles.imagePickerButtonHorizontal}
                  onPress={() => handleImagePickerOption('camera')}
                >
                  <Text style={[styles.imagePickerButtonTextHorizontal, { color: colors.primary }]}>
                    {t('camera') || 'CAMERA'}
                  </Text>
                </TouchableOpacity>

                <View style={[styles.buttonSeparator, { backgroundColor: colors.border }]} />

                <TouchableOpacity
                  style={styles.imagePickerButtonHorizontal}
                  onPress={() => handleImagePickerOption('gallery')}
                >
                  <Text style={[styles.imagePickerButtonTextHorizontal, { color: colors.primary }]}>
                    {t('gallery') || 'GALLERY'}
                  </Text>
                </TouchableOpacity>

                <View style={[styles.buttonSeparator, { backgroundColor: colors.border }]} />

                <TouchableOpacity
                  style={styles.imagePickerButtonHorizontal}
                  onPress={() => setShowImagePicker(false)}
                >
                  <Text style={[styles.imagePickerButtonTextHorizontal, { color: colors.primary }]}>
                    {t('cancel') || 'CANCEL'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal> 
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Profile Section
  profileSection: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(24),
    alignItems: 'center',
    paddingTop: rs(30),
    zIndex: 1,
  },
  profileImageContainer: {
    marginBottom: rs(16),
    marginTop: -rs(2),
  },


  profileImageTouchable: {
    position: 'relative',
  },
  profileImage: {
    width: rs(110),
    height: rs(110),
    borderRadius: rs(55),
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImagePlaceholder: {
    width: rs(110),
    height: rs(110),
    borderRadius: rs(55),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.15,
    shadowRadius: rs(4),
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(3) },
    shadowOpacity: 0.25,
    shadowRadius: rs(5),
  },
  profileDetails: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: rf(28),
    fontWeight: '700',
    marginBottom: rs(2),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(8),
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: rs(16),
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
    opacity: 1,
  },
  memberSince: {
    fontSize: rf(12),
    opacity: 0.6,
    marginBottom: rs(12),
  },
  loginButton: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(10),
    borderRadius: rs(20),
    marginTop: rs(12),
  },
  loginButtonText: {
    fontSize: rf(14),
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    padding: rs(40),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: rf(16),
  },

  // Sections
  section: {
    marginBottom: rs(24),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: '700',
    marginBottom: rs(16),
    marginHorizontal: rs(24),
  },

  // Info Table
  infoTable: {
    marginHorizontal: rs(24),
    borderRadius: rs(12),
    paddingVertical: rs(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.05,
    shadowRadius: rs(2),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: rf(14),
    fontWeight: '400',
    opacity: 0.7,
    textTransform: 'none',
  },
  infoValue: {
    fontSize: rf(14),
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: rs(16),
  },

  infoGroupTitle: {
    fontSize: rf(16),
    fontWeight: '600',
    marginBottom: rs(12),
    marginHorizontal: rs(24),
    opacity: 0.8,
    marginTop: rs(20),
  },

  // Edit Button
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: rs(24),
    marginTop: rs(16),
    paddingVertical: rs(12),
    borderRadius: rs(8),
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    gap: rs(6),
  },
  editButtonText: {
    fontSize: rf(15),
    fontWeight: '600',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(16),
    marginHorizontal: rs(24),
    marginTop: rs(32),
    borderRadius: rs(12),
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.05,
    shadowRadius: rs(2),
  },
  logoutButtonText: {
    fontSize: rf(15),
    fontWeight: '600',
    marginLeft: rs(6),
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderBottomWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  modalTitle: {
    fontSize: rf(17),
    fontWeight: '700',
  },
  closeButton: {
    padding: rs(6),
    borderRadius: rs(12),
  },
  modalContent: {
    flex: 1,
    padding: rs(16),
  },

  // Form Styles
  inputGroup: {
    marginBottom: rs(16),
  },
  inputLabel: {
    fontSize: rf(14),
    fontWeight: '600',
    marginBottom: rs(6),
  },
  textInput: {
    borderWidth: 1,
    borderRadius: rs(8),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    fontSize: rf(14),
    minHeight: rs(42),
  },
  dateButton: {
    flexDirection: 'column',
    borderWidth: 1,
    borderRadius: rs(12),
    paddingHorizontal: rs(16),
    paddingVertical: rs(14),
    minHeight: rs(56),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.05,
    shadowRadius: rs(2),
  },
  dateButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dateButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateButtonText: {
    fontSize: rf(15),
    marginLeft: rs(12),
    flex: 1,
  },
  ageDisplay: {
    marginTop: rs(8),
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
    borderRadius: rs(8),
    alignSelf: 'flex-start',
  },
  ageText: {
    fontSize: rf(12),
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
  },
  genderButton: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(8),
    borderRadius: rs(16),
    borderWidth: 1,
    minWidth: rs(65),
    alignItems: 'center',
  },
  genderButtonText: {
    fontSize: rf(13),
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: rs(8),
    paddingVertical: rs(12),
    alignItems: 'center',
    marginTop: rs(20),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  saveButtonText: {
    fontSize: rf(15),
    fontWeight: '700',
  },

  // Modern Calendar Styles - Material Design Style
  modernCalendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modernCalendarModal: {
    width: '90%',
    maxWidth: 360,
    borderRadius: 8,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  modernCalendarHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modernHeaderYear: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
    opacity: 0.7,
  },
  modernHeaderDate: {
    fontSize: 24,
    fontWeight: '400',
  },
  modernCalendarContent: {
    paddingBottom: 8,
  },
  modernCalendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modernNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernNavText: {
    fontSize: 24,
    fontWeight: '400',
  },
  modernMonthYearText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modernDayNames: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modernDayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  modernDayNameText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modernCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modernCalendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50, // Make it perfectly circular
    minHeight: 40,
    minWidth: 40,
  },
  modernCalendarDayText: {
    fontSize: 14,
    fontWeight: '400',
  },
  modernCalendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  modernCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  modernCancelText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  modernOkButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  modernOkText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Month Selection Styles
  modernMonthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modernMonthItem: {
    width: '33.33%',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 50, // Make it perfectly circular
    minHeight: 48,
  },
  modernMonthText: {
    fontSize: 14,
    fontWeight: '400',
  },

  // Year Selection Styles
  modernYearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modernYearItem: {
    width: '33.33%',
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 50, // Make it perfectly circular
    minHeight: 48,
  },
  modernYearText: {
    fontSize: 14,
    fontWeight: '400',
  },

  // Image Picker Modal Styles
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(20),
  },
  imagePickerModal: {
    width: '100%',
    maxWidth: rs(340),
    borderRadius: rs(12),
    paddingTop: rs(20),
    paddingHorizontal: rs(20),
    paddingBottom: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(5) },
    shadowOpacity: 0.3,
    shadowRadius: rs(10),
    overflow: 'hidden',
  },
  imagePickerTitle: {
    fontSize: rf(16),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: rs(6),
  },
  imagePickerSubtitle: {
    fontSize: rf(12),
    textAlign: 'center',
    marginBottom: rs(16),
    opacity: 0.7,
  },
  imagePickerButtonsContainer: {
    marginHorizontal: -rs(20),
    marginBottom: -rs(0),
    borderTopWidth: 1,
    paddingVertical: rs(12),
  },
  imagePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    width: '100%',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(16),
    paddingHorizontal: rs(20),
    borderRadius: rs(8),
    gap: rs(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  imagePickerButtonText: {
    fontSize: rf(14),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  imagePickerButtonHorizontal: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(8),
    paddingHorizontal: rs(16),
    minWidth: rs(80),
  },
  imagePickerButtonTextHorizontal: {
    fontSize: rf(14),
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonSeparator: {
    width: 1,
    height: rs(20),
    opacity: 0.3,
  },
});