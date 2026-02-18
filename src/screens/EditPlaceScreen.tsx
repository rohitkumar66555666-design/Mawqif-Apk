import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Place, CreatePlaceInput } from '../types';
import { PlacesService } from '../services/places.service';
import { ImageUploadService } from '../services/image-upload.service';
import { SimpleImagePicker } from '../components/MultipleImagePicker';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  validatePlaceTitle,
  validateCity,
  validateCapacity,
} from '../utils/validation';
import { PLACE_TYPES } from '../utils/constants';
import { rf, rs } from '../utils/responsive';

interface EditPlaceScreenProps {
  navigation: any;
  route: {
    params: {
      placeId: string;
    };
  };
}

export const EditPlaceScreen: React.FC<EditPlaceScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { placeId } = route.params;

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    type: 'masjid',
    city: '',
    capacity: '',
    contact_phone: '',
    whatsapp_number: '',
    amenities: {
      wuzu: false,
      washroom: false,
      women_area: false,
    },
  });
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  useEffect(() => {
    loadPlaceDetails();
  }, [placeId]);

  const loadPlaceDetails = async () => {
    try {
      setLoading(true);
      console.log('📍 Loading place details for editing:', placeId);
      
      const placeDetails = await PlacesService.getPlaceById(placeId);
      
      if (!placeDetails) {
        Alert.alert('Error', 'Place not found');
        navigation.goBack();
        return;
      }

      setPlace(placeDetails);
      setFormData({
        title: placeDetails.title || '',
        address: placeDetails.address || '',
        type: placeDetails.type || 'masjid',
        city: placeDetails.city || '',
        capacity: placeDetails.capacity?.toString() || '',
        contact_phone: placeDetails.contact_phone || '',
        whatsapp_number: placeDetails.whatsapp_number || '',
        amenities: placeDetails.amenities || {
          wuzu: false,
          washroom: false,
          women_area: false,
        },
      });
      
      // Handle multiple images - convert existing images to array format
      const existingImages: string[] = [];
      if (placeDetails.images && placeDetails.images.length > 0) {
        // Use the images array if available
        existingImages.push(...placeDetails.images.map(img => img.url));
      } else if (placeDetails.photo || placeDetails.primary_photo) {
        // Fallback to single photo
        existingImages.push(placeDetails.photo || placeDetails.primary_photo);
      }
      
      setSelectedImages(existingImages);
      setPrimaryImageIndex(0); // First image is primary by default
      
      console.log('✅ Place details loaded for editing');
    } catch (error) {
      console.error('Error loading place details:', error);
      Alert.alert('Error', 'Failed to load place details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleError = validatePlaceTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    const cityError = validateCity(formData.city);
    if (cityError) newErrors.city = cityError;

    if (formData.capacity) {
      const capacityError = validateCapacity(formData.capacity);
      if (capacityError) newErrors.capacity = capacityError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (!place) return;

    try {
      setSaving(true);
      console.log('💾 Saving place changes...');

      // Prepare update data
      const updateData: Partial<CreatePlaceInput> = {
        title: formData.title.trim(),
        address: formData.address.trim(),
        type: formData.type,
        city: formData.city.trim(),
        amenities: formData.amenities,
      };

      // Add optional fields
      if (formData.capacity) {
        updateData.capacity = parseInt(formData.capacity);
      }

      if (formData.contact_phone) {
        updateData.contact_phone = formData.contact_phone.trim();
      }

      if (formData.whatsapp_number) {
        updateData.whatsapp_number = formData.whatsapp_number.trim();
      }

      // Handle multiple images upload
      if (selectedImages.length > 0) {
        try {
          console.log('📤 Uploading images...');
          
          const uploadedImages: string[] = [];
          
          for (let i = 0; i < selectedImages.length; i++) {
            const imageUri = selectedImages[i];
            
            // Skip if it's already a URL (existing image)
            if (imageUri.startsWith('http')) {
              uploadedImages.push(imageUri);
              continue;
            }
            
            // Upload new image
            const imageUrl = await ImageUploadService.uploadPlaceImage(imageUri);
            uploadedImages.push(imageUrl);
          }
          
          // Set primary photo (first image) and images array
          if (uploadedImages.length > 0) {
            updateData.photo = uploadedImages[primaryImageIndex] || uploadedImages[0];
            updateData.images = uploadedImages.map((url, index) => ({
              url,
              isPrimary: index === primaryImageIndex,
            }));
          }
          
          console.log('✅ Images uploaded successfully');
        } catch (imageError) {
          console.error('❌ Image upload failed:', imageError);
          Alert.alert('Image Upload Failed', 'The place will be updated without the new images.');
        }
      }

      // Update the place
      const updatedPlace = await PlacesService.updatePlace(placeId, updateData);
      
      console.log('✅ Place updated successfully');
      
      Alert.alert(
        'Success',
        'Place updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error updating place:', error);
      Alert.alert('Error', 'Failed to update place. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.typeContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{t('typeOfPlace')} *</Text>
      <View style={styles.typeButtons}>
        {PLACE_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              formData.type === type.value && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setFormData({ ...formData, type: type.value })}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: colors.text },
                formData.type === type.value && { color: colors.textInverse },
              ]}
            >
              {t(type.value)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAmenities = () => (
    <View style={styles.amenitiesContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{t('availableAmenities')}</Text>
      {Object.entries(formData.amenities).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={styles.amenityRow}
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
            { borderColor: colors.border, backgroundColor: colors.surface },
            value && { backgroundColor: colors.primary, borderColor: colors.primary }
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: 'white' }]}>Edit Place</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.center}>
          <MaterialIcons name="hourglass-empty" size={rf(48)} color={colors.textSecondary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading place details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: 'white' }]}>Edit Place</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saving}
        >
          <MaterialIcons name="save" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Multiple Photos Section */}
          <View style={[styles.photoSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Place Photos</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Add up to 5 photos. The first photo will be the main photo.
            </Text>
            
            <SimpleImagePicker
              selectedImages={selectedImages}
              onImagesChange={setSelectedImages}
              primaryImageIndex={primaryImageIndex}
              onPrimaryImageChange={setPrimaryImageIndex}
              maxImages={5}
            />
          </View>

          {/* Basic Information */}
          <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Place Name *</Text>
              <TextInput
                style={[styles.modernInput, { backgroundColor: colors.background, color: colors.text, borderColor: errors.title ? colors.error : colors.border }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter place name"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.title && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.title}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Address *</Text>
              <TextInput
                style={[styles.modernInput, styles.multilineInput, { backgroundColor: colors.background, color: colors.text, borderColor: errors.address ? colors.error : colors.border }]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Enter full address"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
              />
              {errors.address && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.address}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>City *</Text>
              <TextInput
                style={[styles.modernInput, { backgroundColor: colors.background, color: colors.text, borderColor: errors.city ? colors.error : colors.border }]}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Enter city"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.city && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.city}</Text>
              )}
            </View>
          </View>

          {/* Type Selection */}
          <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Place Type *</Text>
            <View style={styles.typeGrid}>
              {PLACE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    formData.type === type.value && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.value })}
                >
                  <Text
                    style={[
                      styles.typeCardText,
                      { color: colors.text },
                      formData.type === type.value && { color: colors.textInverse },
                    ]}
                  >
                    {t(type.value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Details */}
          <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Capacity (Optional)</Text>
              <TextInput
                style={[styles.modernInput, { backgroundColor: colors.background, color: colors.text, borderColor: errors.capacity ? colors.error : colors.border }]}
                value={formData.capacity}
                onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                placeholder="Number of people"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.capacity && (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.capacity}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Contact Phone</Text>
              <TextInput
                style={[styles.modernInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={formData.contact_phone}
                onChangeText={(text) => setFormData({ ...formData, contact_phone: text })}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>WhatsApp Number</Text>
              <TextInput
                style={[styles.modernInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={formData.whatsapp_number}
                onChangeText={(text) => setFormData({ ...formData, whatsapp_number: text })}
                placeholder="WhatsApp number"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Amenities */}
          <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {Object.entries(formData.amenities).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.amenityCard,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    value && { backgroundColor: colors.primary, borderColor: colors.primary }
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
                  <MaterialIcons 
                    name={value ? "check-circle" : "radio-button-unchecked"} 
                    size={rf(20)} 
                    color={value ? colors.textInverse : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.amenityCardText, 
                    { color: colors.text },
                    value && { color: colors.textInverse }
                  ]}>
                    {t(key)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              saving && { backgroundColor: colors.textSecondary },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <MaterialIcons 
              name={saving ? "hourglass-empty" : "save"} 
              size={rf(20)} 
              color="white" 
            />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    height: rs(56), // Fixed height to match React Navigation header
    elevation: 1,
    shadowOffset: { width: 0, height: rs(0.5) },
    shadowOpacity: 0.05,
    shadowRadius: rs(1),
  },
  backButton: {
    padding: rs(8), // Standard touch target
    marginLeft: rs(-8), // Align with navigation header
  },
  headerTitle: {
    fontSize: rf(16), // Standard navigation header font size
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: rs(16), // Proper spacing from buttons
  },
  saveButton: {
    padding: rs(8), // Standard touch target
    marginRight: rs(-8), // Align with navigation header
  },
  headerRight: {
    width: rs(40), // Placeholder for alignment in loading state
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: rs(16),
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: rs(32),
  },
  loadingText: {
    fontSize: rf(16),
    marginTop: rs(16),
  },
  
  // Modern Section Styles
  section: {
    marginBottom: rs(20),
    padding: rs(20),
    borderRadius: rs(16),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  photoSection: {
    marginBottom: rs(20),
    padding: rs(20),
    borderRadius: rs(16),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: '700',
    marginBottom: rs(8),
  },
  sectionSubtitle: {
    fontSize: rf(14),
    marginBottom: rs(16),
    lineHeight: rf(20),
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: rs(16),
  },
  inputLabel: {
    fontSize: rf(14),
    fontWeight: '600',
    marginBottom: rs(8),
  },
  modernInput: {
    borderWidth: 1,
    borderRadius: rs(12),
    padding: rs(14),
    fontSize: rf(16),
    minHeight: rs(50),
  },
  multilineInput: {
    minHeight: rs(80),
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: rf(12),
    marginTop: rs(4),
  },
  
  // Type Selection Styles
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
  },
  typeCard: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderRadius: rs(25),
    borderWidth: 2,
    minWidth: rs(80),
    alignItems: 'center',
  },
  typeCardText: {
    fontSize: rf(14),
    fontWeight: '600',
  },
  
  // Amenities Styles
  amenitiesGrid: {
    gap: rs(8),
  },
  amenityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(16),
    borderRadius: rs(12),
    borderWidth: 2,
  },
  amenityCardText: {
    fontSize: rf(16),
    fontWeight: '500',
    marginLeft: rs(12),
  },
  
  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(16),
    borderRadius: rs(25),
    elevation: 3,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.2,
    shadowRadius: rs(4),
    marginTop: rs(20),
    marginBottom: rs(40),
  },
  saveButtonText: {
    fontSize: rf(16),
    fontWeight: '700',
    color: 'white',
    marginLeft: rs(8),
  },
});