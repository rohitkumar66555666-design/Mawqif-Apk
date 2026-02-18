import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Place } from '../types';
import { PlacesService } from '../services/places.service';
import { ImageUploadService } from '../services/image-upload.service';
import { SimpleImagePicker } from '../components/MultipleImagePicker';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { rf, rs } from '../utils/responsive';

interface PhotoManagementScreenProps {
  navigation: any;
  route: {
    params: {
      placeId: string;
      placeName: string;
    };
  };
}

export const PhotoManagementScreen: React.FC<PhotoManagementScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { placeId, placeName } = route.params;

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPlacePhotos();
  }, [placeId]);

  useEffect(() => {
    // Check if there are changes
    if (place) {
      const originalImages = getOriginalImages();
      const imagesChanged = JSON.stringify(selectedImages) !== JSON.stringify(originalImages);
      setHasChanges(imagesChanged);
    }
  }, [selectedImages, primaryImageIndex, place]);

  const getOriginalImages = (): string[] => {
    if (!place) return [];
    
    const images: string[] = [];
    if (place.images && place.images.length > 0) {
      images.push(...place.images.map(img => img.url));
    } else if (place.photo || place.primary_photo) {
      images.push(place.photo || place.primary_photo);
    }
    return images;
  };

  const loadPlacePhotos = async () => {
    try {
      setLoading(true);
      console.log('📸 Loading photos for place:', placeId);
      
      const placeDetails = await PlacesService.getPlaceById(placeId);
      
      if (!placeDetails) {
        Alert.alert('Error', 'Place not found');
        navigation.goBack();
        return;
      }

      setPlace(placeDetails);
      
      // Load existing images
      const existingImages = getOriginalImages();
      setSelectedImages(existingImages);
      setPrimaryImageIndex(0);
      
      console.log('✅ Photos loaded:', existingImages.length);
    } catch (error) {
      console.error('Error loading place photos:', error);
      Alert.alert('Error', 'Failed to load place photos');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!place || !hasChanges) return;

    try {
      setSaving(true);
      console.log('💾 Saving photo changes...');

      const uploadedImages: string[] = [];
      
      // Upload new images and keep existing ones
      for (let i = 0; i < selectedImages.length; i++) {
        const imageUri = selectedImages[i];
        
        // Skip if it's already a URL (existing image)
        if (imageUri.startsWith('http')) {
          uploadedImages.push(imageUri);
          continue;
        }
        
        // Upload new image
        console.log(`📤 Uploading image ${i + 1}/${selectedImages.length}...`);
        const imageUrl = await ImageUploadService.uploadPlaceImage(imageUri);
        uploadedImages.push(imageUrl);
      }
      
      // Prepare update data
      const updateData: any = {};
      
      if (uploadedImages.length > 0) {
        // Set primary photo and images array
        updateData.photo = uploadedImages[primaryImageIndex] || uploadedImages[0];
        updateData.images = uploadedImages.map((url, index) => ({
          url,
          isPrimary: index === primaryImageIndex,
        }));
      } else {
        // No images - clear photo data
        updateData.photo = null;
        updateData.images = [];
      }

      // Update the place
      await PlacesService.updatePlace(placeId, updateData);
      
      console.log('✅ Photos updated successfully');
      
      Alert.alert(
        'Success',
        'Photos updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error updating photos:', error);
      Alert.alert('Error', 'Failed to update photos. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Discard Changes?',
      'You have unsaved changes. Are you sure you want to discard them?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleDiscardChanges}>
            <MaterialIcons name="arrow-back" size={rf(24)} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: 'white' }]}>Photos</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleDiscardChanges}>
          <MaterialIcons name="arrow-back" size={rf(24)} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: 'white' }]}>Photos</Text>
          <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
            {placeName}
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            !hasChanges && { opacity: 0.5 }
          ]} 
          onPress={handleSaveChanges}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="save" size={rf(24)} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Photo Management Section */}
          <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Manage Photos
              </Text>
              <Text style={[styles.photoCount, { color: colors.textSecondary }]}>
                {selectedImages.length}/5 photos
              </Text>
            </View>
            
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Add up to 5 photos. The first photo will be the main photo displayed in search results.
            </Text>
            
            <SimpleImagePicker
              selectedImages={selectedImages}
              onImagesChange={setSelectedImages}
              primaryImageIndex={primaryImageIndex}
              onPrimaryImageChange={setPrimaryImageIndex}
              maxImages={5}
            />
          </View>

          {/* Current Photos Info */}
          {selectedImages.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Photo Details
              </Text>
              
              <View style={styles.photoInfo}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="photo" size={rf(20)} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    Total Photos: {selectedImages.length}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <MaterialIcons name="star" size={rf(20)} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    Primary Photo: #{primaryImageIndex + 1}
                  </Text>
                </View>
                
                {hasChanges && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="edit" size={rf(20)} color={colors.warning} />
                    <Text style={[styles.infoText, { color: colors.warning }]}>
                      You have unsaved changes
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={[styles.section, { backgroundColor: colors.sectionBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              How to Manage Photos
            </Text>
            
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <MaterialIcons name="add-circle" size={rf(20)} color={colors.primary} />
                <Text style={[styles.instructionText, { color: colors.text }]}>
                  Tap "Add Photos" to select multiple images at once
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <MaterialIcons name="star-border" size={rf(20)} color={colors.primary} />
                <Text style={[styles.instructionText, { color: colors.text }]}>
                  Tap "Set as Primary" to choose the main photo
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <MaterialIcons name="close" size={rf(20)} color={colors.primary} />
                <Text style={[styles.instructionText, { color: colors.text }]}>
                  Tap "×" on any photo to remove it
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <MaterialIcons name="save" size={rf(20)} color={colors.primary} />
                <Text style={[styles.instructionText, { color: colors.text }]}>
                  Tap "Save" to apply changes to your place
                </Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          {hasChanges && (
            <TouchableOpacity
              style={[
                styles.saveButtonLarge,
                { backgroundColor: colors.primary },
                saving && { backgroundColor: colors.textSecondary },
              ]}
              onPress={handleSaveChanges}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialIcons name="save" size={rf(20)} color="white" />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          )}
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
    paddingVertical: rs(8), // Reduced from rs(12)
    elevation: 2, // Reduced from 4
    shadowOffset: { width: 0, height: rs(1) }, // Reduced shadow
    shadowOpacity: 0.1, // Reduced shadow opacity
    shadowRadius: rs(2), // Reduced shadow radius
  },
  backButton: {
    padding: rs(6), // Reduced from rs(8)
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rf(16), // Reduced from rf(18)
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: rf(11), // Reduced from rf(12)
    marginTop: rs(2),
  },
  saveButton: {
    padding: rs(6), // Reduced from rs(8)
  },
  headerRight: {
    width: rs(40),
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
  
  // Section Styles
  section: {
    marginBottom: rs(20),
    padding: rs(20),
    borderRadius: rs(16),
    elevation: 2,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(8),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: '700',
  },
  photoCount: {
    fontSize: rf(14),
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: rf(14),
    marginBottom: rs(16),
    lineHeight: rf(20),
  },
  
  // Photo Info Styles
  photoInfo: {
    gap: rs(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  infoText: {
    fontSize: rf(16),
    fontWeight: '500',
  },
  
  // Instructions Styles
  instructionsList: {
    gap: rs(16),
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: rs(12),
  },
  instructionText: {
    fontSize: rf(14),
    lineHeight: rf(20),
    flex: 1,
  },
  
  // Save Button
  saveButtonLarge: {
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
    gap: rs(8),
  },
  saveButtonText: {
    fontSize: rf(16),
    fontWeight: '700',
    color: 'white',
  },
});