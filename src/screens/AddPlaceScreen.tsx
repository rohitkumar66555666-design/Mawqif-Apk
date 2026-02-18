import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { CreatePlaceInput, Location, ImageData } from "../types";
import { PlacesService } from "../services/places.service";
import { ImageUploadService } from "../services/image-upload.service";
import { LocationService } from "../services/location.service";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { UserProfileService, UserProfile } from "../services/user-profile.service";
import { MultipleImagePicker } from "../components/MultipleImagePicker";
import {
  validatePlaceTitle,
  validateCity,
  validateCapacity,
  validatePhoneNumber,
  validateWhatsAppNumber,
  validateContactInfo,
} from "../utils/validation";
import { PLACE_TYPES } from "../utils/constants";
import { rf, rs, getResponsiveDimensions } from "../utils/responsive";
import { useAddPlaceAuth, useUserInfo } from "../lib/authHelper";

interface AddPlaceScreenProps {
  navigation: any;
}

export const AddPlaceScreen: React.FC<AddPlaceScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { requireAddPlaceAuth } = useAddPlaceAuth();
  const { user, isAuthenticated, getUserDisplayName } = useUserInfo();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [hostedPlaces, setHostedPlaces] = useState(0); // TODO: Connect to actual hosted places count

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    type: "masjid",
    city: "",
    capacity: "",
    contact_phone: "",
    whatsapp_number: "",
    amenities: {
      wuzu: false,
      washroom: false,
      women_area: false,
    },
  });
  const [location, setLocation] = useState<Location | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const googlePlacesRef = useRef<any>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProfile();
    }
    getCurrentLocation();
    setImages([]);
    console.log('🔄 AddPlaceScreen mounted - cleared images state');
  }, [isAuthenticated, user]);

  const loadUserProfile = async () => {
    if (!user?.uid) return;

    try {
      setLoadingProfile(true);
      const profile = await UserProfileService.getProfile(user.uid);
      setUserProfile(profile);

      // Auto-fill contact information from host profile
      if (profile) {
        console.log('📞 Auto-filling contact info from host profile...');
        setFormData(prevData => ({
          ...prevData,
          contact_phone: profile.phone_number || user.phoneNumber || '',
          whatsapp_number: (profile as any).whatsapp_number || '',
        }));
        console.log('✅ Contact info auto-filled from host profile');
      }

      // TODO: Load hosted places count
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await LocationService.getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.log("Location error (expected in browser):", error);
      // For browser testing, use default Mumbai coordinates
      setLocation({
        latitude: 19.076,
        longitude: 72.8777,
      });
    }
  };

  const isProfileComplete = !!(userProfile?.full_name && userProfile?.city); // Removed profile_image_url requirement for testing

  const renderHostHeader = () => {
    if (isAuthenticated && user) {
      const displayName = userProfile?.full_name || getUserDisplayName();
      const profileImageUrl = userProfile?.profile_image_url;

      return (
        <>
          <View style={[styles.profileSection, { backgroundColor: colors.background, margin: rs(16), marginBottom: rs(0) }]}>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity
                style={styles.profileImageTouchable}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                {profileImageUrl ? (
                  <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
                    <MaterialIcons name="person" size={rf(40)} color="white" />
                  </View>
                )}
                <View style={[styles.editPencil, { backgroundColor: colors.surface }]}>
                  <MaterialIcons name="edit" size={rf(12)} color={colors.primary} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: colors.text }]}>{displayName || t('user') || 'User'}</Text>
              <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
                {t('memberSince') || 'Member since'} {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'December 2025'}
              </Text>

              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: isProfileComplete ? '#4CAF50' : '#FFC107' }]} />
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {isProfileComplete ? (t('canHost') || 'CAN HOST') : (t('incompleteProfile') || 'INCOMPLETE PROFILE')}
                </Text>
              </View>
            </View>
          </View>

          {/* Host Stats Cards - Matching ProfileScreen UI */}
          <View style={[styles.statsContainer, { backgroundColor: colors.background, marginHorizontal: rs(16), marginBottom: rs(16) }]}>
            <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
              <View style={styles.statItem}>
                <MaterialIcons name="business" size={rf(24)} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>{hostedPlaces || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('placesHosted') || 'Places Hosted'}
                </Text>
              </View>

              <View style={styles.statItem}>
                <MaterialIcons name="star" size={rf(24)} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('totalReviews') || 'Total Reviews'}
                </Text>
              </View>
            </View>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={[styles.profileSection, { backgroundColor: colors.background, margin: rs(16) }]}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              style={styles.profileImageTouchable}
              onPress={() => {
                const { useAuthStore } = require('../lib/authStore');
                const { setReturnRoute } = useAuthStore.getState();
                setReturnRoute('AddPlace');
                navigation.navigate('Login');
              }}
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
              {t('loginToHost') || 'Login to host a place'}
            </Text>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary, marginTop: rs(8) }]}
              onPress={() => {
                const { useAuthStore } = require('../lib/authStore');
                const { setReturnRoute } = useAuthStore.getState();
                setReturnRoute('AddPlace');
                navigation.navigate('Login');
              }}
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

  const handlePlaceSelect = (data: any, details?: any) => {
    try {
      if (details?.formatted_address) {
        const fullAddress = details.formatted_address;

        // Don't overwrite the title, just set the location
        setSelectedPlace(details);

        // Extract city from address components
        const addressComponents = details.address_components || [];
        let extractedCity = "";

        // Try to find city (locality), otherwise use administrative_area_level_1
        for (let component of addressComponents) {
          if (component.types.includes("locality")) {
            extractedCity = component.long_name;
            break;
          } else if (component.types.includes("administrative_area_level_1")) {
            extractedCity = component.long_name;
          }
        }

        // Auto-fill city field only
        if (extractedCity) {
          setFormData((prevState) => ({
            ...prevState,
            city: extractedCity,
          }));
        }

        console.log("✅ Place selected:", fullAddress);
        console.log("🏙️ City auto-filled:", extractedCity);
      }
    } catch (error) {
      console.error("Error handling place selection:", error);
    }
  };

  const clearPlaceSelection = () => {
    setFormData({
      ...formData,
      title: "",
      address: "",
      city: "",
    });
    setSelectedPlace(null);
    if (googlePlacesRef.current) {
      googlePlacesRef.current.setAddressText("");
    }
  };



  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleError = validatePlaceTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    // Add address validation
    if (!formData.address.trim()) {
      newErrors.address = t('addressRequired');
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Please enter a complete address";
    }

    const cityError = validateCity(formData.city);
    if (cityError) newErrors.city = cityError;

    const capacityError = validateCapacity(formData.capacity);
    if (capacityError) newErrors.capacity = capacityError;

    // MANDATORY CONTACT VALIDATION
    const phoneError = validatePhoneNumber(formData.contact_phone);
    if (phoneError) newErrors.contact_phone = phoneError;

    const whatsappError = validateWhatsAppNumber(formData.whatsapp_number);
    if (whatsappError) newErrors.whatsapp_number = whatsappError;

    // Ensure at least one contact method is valid
    const contactError = validateContactInfo(formData.contact_phone, formData.whatsapp_number);
    if (contactError) {
      newErrors.contact_info = contactError;
    }

    if (!location) {
      newErrors.location = t('locationRequired');
    }

    // TODO: Uncomment when Google Places is enabled
    // if (!selectedPlace) {
    //   newErrors.location = "Please select a location from search results";
    // }

    // Images are required for good user experience
    if (!images || images.length === 0) {
      newErrors.images = t('photoRequired'); // Reuse existing translation
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Check authentication first
    const proceedWithSubmission = async () => {
      console.log("🚀 handleSubmit called");
      console.log("📍 Current location:", location);
      console.log("📝 Form data:", formData);

      const isValid = validateForm();
      console.log("✅ Form validation result:", isValid);
      console.log("❌ Validation errors:", errors);

      if (!isValid) {
        console.log("❌ Form validation failed, stopping submission");
        return;
      }

      if (!location) {
        console.log("❌ No location available, stopping submission");
        return;
      }

      console.log("🔄 Starting submission process...");
      setLoading(true);

      try {
        // Create place data with all required fields
        const placeData: CreatePlaceInput = {
          title: formData.title.trim(),
          address: formData.address.trim(), // Add address field
          type: formData.type,
          latitude: location.latitude,
          longitude: location.longitude,
          city: formData.city.trim(),
          amenities: formData.amenities, // Include amenities (optional with default in DB)
          owner_id: user?.uid, // Set the current user as owner for host tracking
        };

        // Helper to proceed with creating the place (used when user chooses to continue without image)
        const proceedWithPlaceCreation = async () => {
          try {
            const result = await PlacesService.createPlace(placeData);
            console.log("✅ Place created successfully:", result);
            console.log("🔍 Created place photo field:", result.photo || 'undefined - NO IMAGE SAVED');

            Alert.alert(t('success'), t('placeAddedSuccess'), [
              {
                text: t('viewPlaces'),
                onPress: () => {
                  // Reset form completely but preserve host contact info
                  console.log('🔄 Resetting form after successful submission...');
                  const hostContactInfo = {
                    contact_phone: userProfile?.phone_number || user?.phoneNumber || '',
                    whatsapp_number: (userProfile as any)?.whatsapp_number || '',
                  };
                  setFormData({
                    title: "",
                    address: "",
                    type: "masjid",
                    city: "",
                    capacity: "",
                    contact_phone: hostContactInfo.contact_phone,
                    whatsapp_number: hostContactInfo.whatsapp_number,
                    amenities: {
                      wuzu: false,
                      washroom: false,
                      women_area: false,
                    },
                  });
                  setImages([]); // Clear images state
                  setErrors({}); // Clear any errors
                  console.log('✅ Form reset completed with host contact info preserved');

                  // Navigate back to main tabs
                  navigation.navigate("Main");
                },
              },
            ]);
          } catch (error) {
            console.error("❌ Error creating place:", error);
            const errorMessage = error instanceof Error ? error.message : t('error');
            Alert.alert(t('error'), `Unable to add place: ${errorMessage}`);
          } finally {
            setLoading(false);
            console.log("🏁 Submission process completed");
          }
        };

        // Add optional fields only if they have values
        if (formData.capacity && formData.capacity.trim()) {
          placeData.capacity = parseInt(formData.capacity);
        }

        // Add contact information if provided
        if (formData.contact_phone && formData.contact_phone.trim()) {
          placeData.contact_phone = formData.contact_phone.trim();
        }

        if (formData.whatsapp_number && formData.whatsapp_number.trim()) {
          placeData.whatsapp_number = formData.whatsapp_number.trim();
        }

        console.log("📤 Sending place data to Supabase:", placeData);

        // Upload multiple images to Supabase Storage if images exist
        if (images && images.length > 0) {
          console.log(`📤 Uploading ${images.length} images to cloud storage...`);

          try {
            const uploadedImages = [];

            for (let i = 0; i < images.length; i++) {
              const image = images[i];
              console.log(`📱 Uploading image ${i + 1}/${images.length}:`, image.uri);

              const publicImageUrl = await ImageUploadService.uploadPlaceImage(image.uri!);

              // Validate that we got a proper Supabase URL
              if (publicImageUrl && publicImageUrl.includes('supabase.co') && publicImageUrl.includes('/public/')) {
                uploadedImages.push({
                  id: image.id,
                  url: publicImageUrl,
                  is_primary: image.isPrimary || false,
                  uploaded_at: new Date().toISOString(),
                });
                console.log(`✅ Image ${i + 1} uploaded successfully:`, publicImageUrl);
              } else {
                console.error('❌ Invalid image URL returned:', publicImageUrl);
                throw new Error(`Invalid image URL format for image ${i + 1}`);
              }
            }

            // Set the uploaded images array
            placeData.images = uploadedImages;

            // Also set the primary image as the legacy photo field for backward compatibility
            const primaryImage = uploadedImages.find(img => img.is_primary) || uploadedImages[0];
            if (primaryImage) {
              placeData.photo = primaryImage.url;
            }

            console.log(`✅ All ${uploadedImages.length} images uploaded successfully`);

          } catch (imageError) {
            console.error('❌ Image upload failed:', imageError);

            // Show alert with options
            Alert.alert(
              "Image Upload Failed",
              `Error: ${imageError instanceof Error ? imageError.message : 'Unknown error'}\n\nPlease try:\n• Selecting different images\n• Using smaller image files\n• Checking your internet connection`,
              [
                {
                  text: t('tryAgain'),
                  style: "default",
                  onPress: () => {
                    // Don't continue - let user try again
                    console.log('❌ User will try uploading again');
                  }
                },
                {
                  text: "Continue Without Images",
                  style: "destructive",
                  onPress: async () => {
                    const confirmContinue = await new Promise<boolean>((resolve) => {
                      Alert.alert(
                        "Are you sure?",
                        "Places without photos get less visibility. Users prefer to see what the place looks like.",
                        [
                          { text: t('cancel'), onPress: () => resolve(false) },
                          { text: "Continue Anyway", onPress: () => resolve(true) }
                        ]
                      );
                    });

                    if (confirmContinue) {
                      // Continue without images
                      console.log('⚠️ User chose to continue without images');
                      // Don't set placeData.images or placeData.photo
                      proceedWithPlaceCreation();
                    }
                  }
                }
              ]
            );

            return; // Exit early - don't continue with place creation
          }
        } else {
          console.log('📷 No images selected - creating place without images');
        }

        await proceedWithPlaceCreation();
      } catch (error) {
        console.error("❌ Error creating place:", error);
        console.error("❌ Error details:", JSON.stringify(error, null, 2));
        const errorMessage =
          error instanceof Error ? error.message : t('error');
        Alert.alert(t('error'), `Unable to add place: ${errorMessage}`);
      } finally {
        setLoading(false);
        console.log("🏁 Submission process completed");
      }
    };

    // Require authentication for adding a place
    requireAddPlaceAuth(navigation, proceedWithSubmission);
  };

  const renderTypeSelector = () => (
    <View style={[styles.sectionContainer, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('typeOfPlace')} *</Text>
      <View style={styles.typeButtons}>
        {PLACE_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
              formData.type === type.value && [
                styles.typeButtonActive,
                { backgroundColor: colors.primary, borderColor: colors.primary }
              ],
            ]}
            onPress={() => setFormData({ ...formData, type: type.value })}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: colors.text },
                formData.type === type.value && [
                  styles.typeButtonTextActive,
                  { color: colors.textInverse }
                ],
              ]}
            >
              {t(type.value)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.type && (
        <Text style={[styles.errorText, { color: colors.error }]}>{errors.type}</Text>
      )}
    </View>
  );

  const renderAmenities = () => (
    <View style={[styles.sectionContainer, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('availableAmenities')}</Text>
      {Object.entries(formData.amenities).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.amenityRow,
            { backgroundColor: value ? colors.primaryLight : 'transparent' }
          ]}
          onPress={() =>
            setFormData({
              ...formData,
              amenities: {
                ...formData.amenities,
                [key]: !value,
              },
            })
          }
        >
          <View style={[
            styles.checkbox,
            { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
            value && [
              styles.checkboxActive,
              { backgroundColor: colors.primary, borderColor: colors.primary }
            ]
          ]}>
            {value && <MaterialIcons name="check" size={rf(20)} color={colors.textInverse} />}
          </View>
          <Text style={[styles.amenityLabel, { color: colors.text }]}>
            {t(key)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {isAuthenticated && isProfileComplete ? (
          <View style={styles.content}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {t('helpFellowMuslims')}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t('placeName')} *</Text>
              <View style={styles.placeNameWrapper}>
                {/* TODO: Uncomment when Google API is ready */}
                {/* 
              <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder="Enter place name (e.g., Al-Noor Masjid, Mumbai)"
                onPress={(data, details) => {
                  console.log("✅ Place selected:", data, details);
                  handlePlaceSelect(data, details);
                }}
                onFail={(error) => {
                  console.error("❌ Google Places API Error:", error);
                  Alert.alert("API Error", "Google Places search failed. Please check your internet connection.");
                }}
                onNotFound={() => {
                  console.log("⚠️ No places found");
                }}
                query={{
                  key: "AIzaSyAW9rqfI9yHaXgxMMUB5tzSoZqkaNKWUNs",
                  language: "en",
                  components: "country:in",
                  types: "establishment|geocode",
                }}
                styles={{
                  textInput: styles.googlePlacesInput,
                  container: styles.googlePlacesContainer,
                  listView: styles.googlePlacesListView,
                  row: styles.googlePlacesRow,
                  description: styles.googlePlacesDescription,
                }}
                textInputProps={{
                  placeholderTextColor: colors.textSecondary,
                  onFocus: () => console.log("🔍 Google Places input focused"),
                  onChangeText: (text) => console.log("📝 Typing:", text),
                }}
                currentLocation={false}
                currentLocationLabel="Current location"
                debounce={300}
                minLength={2}
                fetchDetails={true}
                enablePoweredByContainer={false}
                isRowScrollable={false}
                requestUrl={{
                  useOnPlatform: 'web',
                }}
              />
              */}

                {/* Temporary simple input - will be replaced with Google Places later */}
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border },
                    errors.title && { borderColor: colors.error, backgroundColor: colors.errorLight }
                  ]}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder={t('enterPlaceName')}
                  placeholderTextColor={colors.textSecondary}
                />

                {selectedPlace && (
                  <TouchableOpacity
                    style={[styles.clearButton, { backgroundColor: colors.error }]}
                    onPress={clearPlaceSelection}
                  >
                    <MaterialIcons name="close" size={rf(22)} color={colors.textInverse} />
                  </TouchableOpacity>
                )}
              </View>
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t('address')} *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }, errors.address && { borderColor: colors.error }]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder={t('enterFullAddress')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
              />
              {errors.address && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.address}</Text>
              )}
            </View>

            {renderTypeSelector()}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t('city')} *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }, errors.city && { borderColor: colors.error }]}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder={t('enterCity')}
                placeholderTextColor={colors.textSecondary}
              />
              {errors.city && <Text style={[styles.errorText, { color: colors.error }]}>{errors.city}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>{t('capacityOptional')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }, errors.capacity && { borderColor: colors.error }]}
                value={formData.capacity}
                onChangeText={(text) =>
                  setFormData({ ...formData, capacity: text })
                }
                placeholder={t('enterCapacity')}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.capacity && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.capacity}</Text>
              )}
            </View>

            {/* Contact Information Section */}
            <View style={[styles.sectionContainer, { backgroundColor: colors.sectionBackground, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('contactInformation')}</Text>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>{t('phoneNumber')} *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border },
                    errors.contact_phone && { borderColor: colors.error, backgroundColor: colors.errorLight }
                  ]}
                  value={formData.contact_phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, contact_phone: text })
                  }
                  placeholder="Required: +91 9876543210"
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.textSecondary}
                />
                {errors.contact_phone && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.contact_phone}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>{t('whatsappNumber')} *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border },
                    errors.whatsapp_number && { borderColor: colors.error, backgroundColor: colors.errorLight }
                  ]}
                  value={formData.whatsapp_number}
                  onChangeText={(text) =>
                    setFormData({ ...formData, whatsapp_number: text })
                  }
                  placeholder="Required: +91 9876543210"
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.textSecondary}
                />
                {errors.whatsapp_number && (
                  <Text style={[styles.errorText, { color: colors.error }]}>{errors.whatsapp_number}</Text>
                )}
              </View>

              {/* Overall contact validation error */}
              {errors.contact_info && (
                <View style={styles.contactErrorContainer}>
                  <MaterialIcons name="error" size={rf(24)} color={colors.error} />
                  <Text style={[styles.contactErrorText, { color: colors.error }]}>{errors.contact_info}</Text>
                </View>
              )}
            </View>

            {renderAmenities()}

            <MultipleImagePicker
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              required={true}
            />
            {errors.images && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.images}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                loading && [styles.submitButtonDisabled, { backgroundColor: colors.disabled }],
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(12) }}>
                  <MaterialIcons name="hourglass-empty" size={rf(20)} color={colors.textInverse} />
                  <Text style={[styles.submitButtonText, { color: colors.textInverse }]}>
                    {t('addingPlace')}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.submitButtonText, { color: colors.textInverse }]}>
                  {t('addPrayerSpace')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : isAuthenticated ? (
          <View style={styles.content}>
            <View style={[styles.sectionContainer, { alignItems: 'center', padding: rs(32), backgroundColor: colors.sectionBackground }]}>
              <MaterialIcons name="assignment-ind" size={rf(64)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: rs(16), color: colors.text }]}>
                {t('completeProfileTitle') || 'Complete Your Profile'}
              </Text>
              <Text style={[styles.description, { textAlign: 'center', color: colors.textSecondary }]}>
                {t('completeProfileDescription') || 'You need to complete your profile (Name, Photo, City) before you can host a prayer space.'}
              </Text>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary, width: '100%', marginTop: rs(16) }]}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={[styles.submitButtonText, { color: colors.textInverse }]}>
                  {t('goToProfile') || 'Go to Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={[styles.sectionContainer, { alignItems: 'center', padding: rs(32), backgroundColor: colors.sectionBackground }]}>
              <MaterialIcons name="login" size={rf(64)} color={colors.primary} />
              <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: rs(16), color: colors.text }]}>
                {t('loginRequired') || 'Login Required'}
              </Text>
              <Text style={[styles.description, { textAlign: 'center', color: colors.textSecondary }]}>
                {t('loginToAddPlace') || 'Please login to add a prayer space and become a host.'}
              </Text>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary, width: '100%', marginTop: rs(16) }]}
                onPress={() => {
                  const { useAuthStore } = require('../lib/authStore');
                  const { setReturnRoute } = useAuthStore.getState();
                  setReturnRoute('AddPlace');
                  navigation.navigate('Login');
                }}
              >
                <Text style={[styles.submitButtonText, { color: colors.textInverse }]}>
                  {t('login') || 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const responsiveDimensions = getResponsiveDimensions();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: rs(20),
    paddingBottom: rs(32),
  },
  description: {
    fontSize: rf(16),
    textAlign: "center",
    marginBottom: rs(32),
    lineHeight: rf(24),
    paddingHorizontal: rs(16),
  },
  inputContainer: {
    marginBottom: rs(24),
  },
  sectionContainer: {
    marginBottom: rs(28),
    padding: rs(20),
    borderRadius: rs(16),
    borderWidth: 0,
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(8),
  },
  sectionTitle: {
    fontSize: rf(20),
    fontWeight: "700",
    marginBottom: rs(20),
    letterSpacing: 0.5,
  },
  label: {
    fontSize: rf(16),
    fontWeight: "600",
    marginBottom: rs(12),
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: rs(12),
    padding: rs(16),
    fontSize: rf(16),
    minHeight: rs(56),
    textAlignVertical: 'top',
  },
  inputError: {
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: rf(14),
    marginTop: rs(8),
    fontWeight: '500',
  },
  contactErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    padding: rs(16),
    borderRadius: rs(12),
    marginTop: rs(12),
    gap: rs(12),
    borderLeftWidth: rs(4),
    borderLeftColor: '#D32F2F',
  },
  contactErrorText: {
    fontSize: rf(14),
    flex: 1,
    fontWeight: '500',
    lineHeight: rf(20),
  },
  typeContainer: {
    marginBottom: rs(24),
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(12),
  },
  typeButton: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    borderRadius: rs(25),
    borderWidth: 1.5,
    minWidth: rs(100),
    alignItems: 'center',
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  typeButtonActive: {
    elevation: 3,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.15,
    shadowRadius: rs(4),
  },
  typeButtonText: {
    fontSize: rf(15),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  typeButtonTextActive: {
    fontWeight: '700',
  },
  amenitiesContainer: {
    marginBottom: rs(24),
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rs(14),
    paddingHorizontal: rs(4),
    borderRadius: rs(8),
    marginBottom: rs(4),
  },
  checkbox: {
    width: rs(28),
    height: rs(28),
    borderWidth: 2,
    borderRadius: rs(8),
    marginRight: rs(16),
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  checkboxActive: {
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.15,
    shadowRadius: rs(3),
  },

  amenityLabel: {
    fontSize: rf(16),
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  photoContainer: {
    marginBottom: rs(24),
  },
  locationContainer: {
    marginBottom: rs(28),
  },
  locationText: {
    fontSize: rf(15),
    padding: rs(16),
    borderRadius: rs(12),
    lineHeight: rf(22),
    fontWeight: '500',
  },
  locationButton: {
    padding: rs(16),
    borderRadius: rs(12),
    alignItems: "center",
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(8),
    minHeight: rs(56),
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  locationButtonText: {
    fontSize: rf(16),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  submitButton: {
    paddingVertical: rs(20),
    borderRadius: rs(16),
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: rs(4) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    minHeight: rs(60),
    marginTop: rs(16),
  },
  submitButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: rf(18),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  placeNameWrapper: {
    position: "relative",
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    paddingTop: rs(20),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  backButton: {
    padding: rs(12),
    borderRadius: rs(12),
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  menuButton: {
    padding: rs(12),
    borderRadius: rs(12),
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  headerTitle: {
    fontSize: rf(20),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(20),
    borderRadius: rs(16),
    marginBottom: rs(20),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(8),
  },
  profileImageContainer: {
    marginRight: rs(16),
  },
  profileImageTouchable: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(36),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.15,
    shadowRadius: rs(4),
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImagePlaceholder: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBadge: {
    position: 'absolute',
    bottom: rs(2),
    right: rs(2),
    width: rs(24),
    height: rs(24),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.2,
    shadowRadius: rs(2),
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: rf(18),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  memberSince: {
    fontSize: rf(13),
    marginTop: rs(6),
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: rs(10),
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
  },
  statusDot: {
    width: rs(10),
    height: rs(10),
    borderRadius: rs(5),
    marginRight: rs(8),
  },
  statusText: {
    fontSize: rf(13),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statsContainer: {
    marginBottom: rs(16),
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: rs(20),
    borderRadius: rs(16),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(8),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: rf(20),
    fontWeight: '700',
    marginTop: rs(8),
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: rf(13),
    marginTop: rs(6),
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: rs(16),
    padding: rs(4),
    borderRadius: rs(12),
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  tab: {
    flex: 1,
    padding: rs(14),
    borderRadius: rs(10),
    alignItems: 'center',
    marginHorizontal: rs(2),
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(6),
  },
  activeTab: {
    elevation: 3,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.15,
    shadowRadius: rs(4),
  },
  tabText: {
    fontSize: rf(15),
    marginLeft: rs(8),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  loginButton: {
    marginTop: rs(16),
    paddingVertical: rs(12),
    paddingHorizontal: rs(20),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  loginButtonText: {
    fontSize: rf(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  googlePlacesContainer: {
    flex: 0,
    position: "relative",
    zIndex: 10,
  },
  googlePlacesInput: {
    borderWidth: 1.5,
    borderRadius: rs(12),
    padding: rs(16),
    fontSize: rf(16),
    paddingRight: rs(50), // Space for clear button
    minHeight: rs(56),
  },
  googlePlacesListView: {
    borderWidth: 1,
    borderRadius: rs(12),
    marginTop: rs(8),
    maxHeight: rs(300),
    elevation: 12,
    shadowOffset: { width: 0, height: rs(6) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    zIndex: 100,
  },
  googlePlacesRow: {
    padding: rs(16),
    borderBottomWidth: 1,
  },
  googlePlacesDescription: {
    fontSize: rf(15),
    lineHeight: rf(22),
  },
  clearButton: {
    position: "absolute",
    right: rs(16),
    top: rs(16),
    width: rs(28),
    height: rs(28),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: rs(14),
    zIndex: 15,
    elevation: 2,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.2,
    shadowRadius: rs(2),
  },

  // Added missing styles referenced in renderHostHeader
  editPencil: {
    position: 'absolute',
    bottom: rs(0),
    right: rs(0),
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.2,
    shadowRadius: rs(4),
  },
  statIconCircle: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rs(8),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: rs(4),
    borderRadius: rs(12),
    overflow: 'hidden',
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(12),
    paddingHorizontal: rs(16),
    gap: rs(8),
  },
  segmentButtonActive: {
    elevation: 3,
    borderRadius: rs(10),
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.15,
    shadowRadius: rs(4),
  },

});
