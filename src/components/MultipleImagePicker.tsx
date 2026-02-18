import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { rf, rs } from '../utils/responsive';

interface MultipleImagePickerProps {
  selectedImages: string[];
  onImagesChange: (images: string[]) => void;
  primaryImageIndex: number;
  onPrimaryImageChange: (index: number) => void;
  maxImages?: number;
  required?: boolean;
}

export const SimpleImagePicker: React.FC<MultipleImagePickerProps> = ({
  selectedImages,
  onImagesChange,
  primaryImageIndex,
  onPrimaryImageChange,
  maxImages = 5,
  required = true,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const pickMultipleImages = async () => {
    try {
      setLoading(true);
      console.log('📷 Starting multiple image selection...');

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permissionRequired') || 'Permission Required',
          t('cameraPermissionMessage') || 'We need camera roll permissions to add photos.'
        );
        return;
      }

      // Launch image picker with multiple selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true, // Enable multiple selection
        selectionLimit: maxImages, // Limit to max images
        aspect: [16, 9],
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log(`📱 Selected ${result.assets.length} images`);
        
        // Convert selected images to string array (URIs)
        const newImageUris: string[] = result.assets.map(asset => asset.uri);

        // Replace all images with new selection
        onImagesChange(newImageUris);
        
        // Set first image as primary
        onPrimaryImageChange(0);
        
        console.log(`✅ ${newImageUris.length} images selected. First image is primary.`);
      }
    } catch (error) {
      console.error('❌ Error picking multiple images:', error);
      Alert.alert(
        t('error') || 'Error',
        t('imagePickerError') || 'Failed to pick images. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (imageIndex: number) => {
    const updatedImages = selectedImages.filter((_, index) => index !== imageIndex);
    
    // If we removed the primary image, make the first remaining image primary
    if (updatedImages.length > 0 && primaryImageIndex === imageIndex) {
      onPrimaryImageChange(0);
    } else if (primaryImageIndex > imageIndex) {
      // Adjust primary index if it was after the removed image
      onPrimaryImageChange(primaryImageIndex - 1);
    }
    
    onImagesChange(updatedImages);
    console.log(`🗑️ Image removed. Remaining images: ${updatedImages.length}`);
  };

  const setPrimaryImage = (imageIndex: number) => {
    onPrimaryImageChange(imageIndex);
    console.log(`⭐ Primary image set to index: ${imageIndex}`);
  };

  const renderImageItem = (imageUri: string, index: number) => (
    <View key={index} style={[styles.imageItem, { borderColor: colors.border }]}>
      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      
      {/* Primary badge */}
      {index === primaryImageIndex && (
        <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="star" size={rf(12)} color="white" />
          <Text style={styles.primaryText}>
            {t('primary') || 'Primary'}
          </Text>
        </View>
      )}
      
      {/* Image controls */}
      <View style={styles.imageControls}>
        {index !== primaryImageIndex && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.surface }]}
            onPress={() => setPrimaryImage(index)}
          >
            <MaterialIcons name="star-border" size={rf(16)} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.controlButton, styles.removeButton, { backgroundColor: colors.error }]}
          onPress={() => removeImage(index)}
        >
          <MaterialIcons name="close" size={rf(16)} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Image number */}
      <View style={[styles.imageNumber, { backgroundColor: colors.surface }]}>
        <Text style={[styles.imageNumberText, { color: colors.text }]}>
          {index + 1}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('placeImages') || 'Place Images'} {required && '*'}
        </Text>
        <Text style={[styles.imageCount, { color: colors.textSecondary }]}>
          {selectedImages.length}/{maxImages}
        </Text>
      </View>
      
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('multipleImagesHint') || 'Select up to 5 images at once. The first image will be the main photo.'}
      </Text>

      {/* Main selection button */}
      <TouchableOpacity
        style={[styles.selectButton, { 
          backgroundColor: colors.primary,
          opacity: loading ? 0.7 : 1
        }]}
        onPress={pickMultipleImages}
        disabled={loading}
      >
        <MaterialIcons 
          name={loading ? "hourglass-empty" : "add-photo-alternate"} 
          size={rf(24)} 
          color="white" 
        />
        <Text style={[styles.selectButtonText, { color: 'white' }]}>
          {loading 
            ? (t('loading') || 'Loading...') 
            : selectedImages.length > 0 
            ? (t('replaceImages') || 'Replace Images')
            : (t('selectImages') || 'Select Images')
          }
        </Text>
      </TouchableOpacity>

      {/* Selected images preview */}
      {selectedImages.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContent}
        >
          {selectedImages.map((imageUri, index) => renderImageItem(imageUri, index))}
        </ScrollView>
      )}

      {/* Tips */}
      <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
        <MaterialIcons name="lightbulb-outline" size={rf(16)} color={colors.primary} />
        <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
          {t('imagesTips') || 'Tips: Tap star to set primary image. First image shows in search results.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: rs(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(8),
  },
  label: {
    fontSize: rf(16),
    fontWeight: '600',
  },
  imageCount: {
    fontSize: rf(14),
    fontWeight: '500',
  },
  hint: {
    fontSize: rf(12),
    marginBottom: rs(12),
    lineHeight: rf(16),
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(16),
    paddingHorizontal: rs(20),
    borderRadius: rs(12),
    marginBottom: rs(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(4),
  },
  selectButtonText: {
    fontSize: rf(16),
    fontWeight: '600',
    marginLeft: rs(8),
  },
  imagesContainer: {
    marginBottom: rs(12),
  },
  imagesContent: {
    paddingRight: rs(16),
  },
  imageItem: {
    width: rs(120),
    height: rs(120),
    marginRight: rs(12),
    borderRadius: rs(8),
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    top: rs(4),
    left: rs(4),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(6),
    paddingVertical: rs(2),
    borderRadius: rs(10),
  },
  primaryText: {
    color: 'white',
    fontSize: rf(10),
    fontWeight: '600',
    marginLeft: rs(2),
  },
  imageControls: {
    position: 'absolute',
    top: rs(4),
    right: rs(4),
    flexDirection: 'column',
  },
  controlButton: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rs(4),
  },
  removeButton: {
    // backgroundColor set dynamically
  },
  imageNumber: {
    position: 'absolute',
    bottom: rs(4),
    right: rs(4),
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNumberText: {
    fontSize: rf(10),
    fontWeight: '600',
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(12),
    borderRadius: rs(8),
  },
  tipsText: {
    fontSize: rf(12),
    marginLeft: rs(8),
    flex: 1,
    lineHeight: rf(16),
  },
});

// Original MultipleImagePicker for AddPlaceScreen (uses ImageData[])
interface OriginalImageData {
  id: number;
  uri: string;
  isPrimary: boolean;
}

interface OriginalMultipleImagePickerProps {
  images: OriginalImageData[];
  onImagesChange: (images: OriginalImageData[]) => void;
  maxImages?: number;
  required?: boolean;
}

export const MultipleImagePicker: React.FC<OriginalMultipleImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  required = true,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const pickMultipleImages = async () => {
    try {
      setLoading(true);
      console.log('📷 Starting multiple image selection...');

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permissionRequired') || 'Permission Required',
          t('cameraPermissionMessage') || 'We need camera roll permissions to add photos.'
        );
        return;
      }

      // Launch image picker with multiple selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        aspect: [16, 9],
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log(`📱 Selected ${result.assets.length} images`);
        
        // Convert selected images to ImageData format
        const newImages: OriginalImageData[] = result.assets.map((asset, index) => ({
          id: Date.now() + index,
          uri: asset.uri,
          isPrimary: index === 0,
        }));

        // Replace all images with new selection
        onImagesChange(newImages);
        
        console.log(`✅ ${newImages.length} images selected. First image is primary.`);
      }
    } catch (error) {
      console.error('❌ Error picking multiple images:', error);
      Alert.alert(
        t('error') || 'Error',
        t('imagePickerError') || 'Failed to pick images. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (imageId: number) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // If we removed the primary image, make the first remaining image primary
    if (updatedImages.length > 0) {
      const hadPrimary = images.find(img => img.id === imageId)?.isPrimary;
      if (hadPrimary) {
        updatedImages[0].isPrimary = true;
      }
    }
    
    onImagesChange(updatedImages);
    console.log(`🗑️ Image removed. Remaining images: ${updatedImages.length}`);
  };

  const setPrimaryImage = (imageId: number) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    
    onImagesChange(updatedImages);
    console.log(`⭐ Primary image set to ID: ${imageId}`);
  };

  const renderImageItem = (image: OriginalImageData, index: number) => (
    <View key={image.id} style={[styles.imageItem, { borderColor: colors.border }]}>
      <Image source={{ uri: image.uri }} style={styles.imagePreview} />
      
      {/* Primary badge */}
      {image.isPrimary && (
        <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="star" size={rf(12)} color="white" />
          <Text style={styles.primaryText}>
            {t('primary') || 'Primary'}
          </Text>
        </View>
      )}
      
      {/* Image controls */}
      <View style={styles.imageControls}>
        {!image.isPrimary && (
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.surface }]}
            onPress={() => setPrimaryImage(image.id)}
          >
            <MaterialIcons name="star-border" size={rf(16)} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.controlButton, styles.removeButton, { backgroundColor: colors.error }]}
          onPress={() => removeImage(image.id)}
        >
          <MaterialIcons name="close" size={rf(16)} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Image number */}
      <View style={[styles.imageNumber, { backgroundColor: colors.surface }]}>
        <Text style={[styles.imageNumberText, { color: colors.text }]}>
          {index + 1}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t('placeImages') || 'Place Images'} {required && '*'}
        </Text>
        <Text style={[styles.imageCount, { color: colors.textSecondary }]}>
          {images.length}/{maxImages}
        </Text>
      </View>
      
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('multipleImagesHint') || 'Select up to 5 images at once. The first image will be the main photo.'}
      </Text>

      {/* Main selection button */}
      <TouchableOpacity
        style={[styles.selectButton, { 
          backgroundColor: colors.primary,
          opacity: loading ? 0.7 : 1
        }]}
        onPress={pickMultipleImages}
        disabled={loading}
      >
        <MaterialIcons 
          name={loading ? "hourglass-empty" : "add-photo-alternate"} 
          size={rf(24)} 
          color="white" 
        />
        <Text style={[styles.selectButtonText, { color: 'white' }]}>
          {loading 
            ? (t('loading') || 'Loading...') 
            : images.length > 0 
            ? (t('replaceImages') || 'Replace Images')
            : (t('selectImages') || 'Select Images')
          }
        </Text>
      </TouchableOpacity>

      {/* Selected images preview */}
      {images.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
          contentContainerStyle={styles.imagesContent}
        >
          {images.map((image, index) => renderImageItem(image, index))}
        </ScrollView>
      )}

      {/* Tips */}
      <View style={[styles.tipsContainer, { backgroundColor: colors.surface }]}>
        <MaterialIcons name="lightbulb-outline" size={rf(16)} color={colors.primary} />
        <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
          {t('imagesTips') || 'Tips: Tap star to set primary image. First image shows in search results.'}
        </Text>
      </View>
    </View>
  );
};