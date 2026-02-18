import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { rf, rs } from '../utils/responsive';

interface ImageData {
  id: number;
  url: string;
  isPrimary?: boolean;
}

interface ImageGalleryProps {
  images: ImageData[];
  style?: any;
  showThumbnails?: boolean;
  height?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  style,
  showThumbnails = true,
  height = 200,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  if (!images || images.length === 0) {
    return (
      <View style={[styles.noImagesContainer, { 
        backgroundColor: colors.surface, 
        height: rs(height) 
      }, style]}>
        <MaterialIcons name="image" size={rf(48)} color={colors.textSecondary} />
        <Text style={[styles.noImagesText, { color: colors.textSecondary }]}>
          {t('noImages') || 'No images available'}
        </Text>
      </View>
    );
  }

  const openFullscreen = (index: number) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const closeFullscreen = () => {
    setModalVisible(false);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => 
        prev > 0 ? prev - 1 : images.length - 1
      );
    } else {
      setSelectedImageIndex(prev => 
        prev < images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const renderMainImage = () => {
    const mainImage = images[selectedImageIndex] || images[0];
    
    return (
      <TouchableOpacity
        style={[styles.mainImageContainer, { height: rs(height) }]}
        onPress={() => openFullscreen(selectedImageIndex)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: mainImage.url }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        
        {/* Image counter */}
        {images.length > 1 && (
          <View style={[styles.imageCounter, { backgroundColor: colors.overlay }]}>
            <Text style={styles.imageCounterText}>
              {selectedImageIndex + 1} / {images.length}
            </Text>
          </View>
        )}
        
        {/* Primary badge */}
        {mainImage.isPrimary && (
          <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="star" size={rf(12)} color="white" />
          </View>
        )}
        
        {/* Fullscreen icon */}
        <View style={[styles.fullscreenIcon, { backgroundColor: colors.overlay }]}>
          <MaterialIcons name="fullscreen" size={rf(20)} color="white" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderThumbnails = () => {
    if (!showThumbnails || images.length <= 1) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailsContainer}
        contentContainerStyle={styles.thumbnailsContent}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={image.id || index}
            style={[
              styles.thumbnail,
              {
                borderColor: index === selectedImageIndex ? colors.primary : colors.border,
                borderWidth: index === selectedImageIndex ? 2 : 1,
              }
            ]}
            onPress={() => setSelectedImageIndex(index)}
          >
            <Image
              source={{ uri: image.url }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
            {image.isPrimary && (
              <View style={[styles.thumbnailPrimaryBadge, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="star" size={rf(8)} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderFullscreenModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeFullscreen}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={[styles.modalHeader, { backgroundColor: colors.overlay }]}>
          <Text style={styles.modalTitle}>
            {selectedImageIndex + 1} / {images.length}
          </Text>
          <TouchableOpacity onPress={closeFullscreen}>
            <MaterialIcons name="close" size={rf(24)} color="white" />
          </TouchableOpacity>
        </View>

        {/* Image */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setSelectedImageIndex(index);
          }}
          contentOffset={{ x: selectedImageIndex * screenWidth, y: 0 }}
        >
          {images.map((image, index) => (
            <View key={image.id || index} style={styles.fullscreenImageContainer}>
              <Image
                source={{ uri: image.url }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft, { backgroundColor: colors.overlay }]}
              onPress={() => navigateImage('prev')}
            >
              <MaterialIcons name="chevron-left" size={rf(32)} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight, { backgroundColor: colors.overlay }]}
              onPress={() => navigateImage('next')}
            >
              <MaterialIcons name="chevron-right" size={rf(32)} color="white" />
            </TouchableOpacity>
          </>
        )}

        {/* Dots indicator */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === selectedImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  }
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, style]}>
      {renderMainImage()}
      {renderThumbnails()}
      {renderFullscreenModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container styles
  },
  noImagesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: rs(8),
  },
  noImagesText: {
    fontSize: rf(14),
    marginTop: rs(8),
  },
  mainImageContainer: {
    borderRadius: rs(8),
    overflow: 'hidden',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    top: rs(8),
    right: rs(8),
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
  },
  imageCounterText: {
    color: 'white',
    fontSize: rf(12),
    fontWeight: '600',
  },
  primaryBadge: {
    position: 'absolute',
    top: rs(8),
    left: rs(8),
    width: rs(24),
    height: rs(24),
    borderRadius: rs(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenIcon: {
    position: 'absolute',
    bottom: rs(8),
    right: rs(8),
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailsContainer: {
    marginTop: rs(8),
  },
  thumbnailsContent: {
    paddingRight: rs(16),
  },
  thumbnail: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(6),
    marginRight: rs(8),
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPrimaryBadge: {
    position: 'absolute',
    top: rs(2),
    right: rs(2),
    width: rs(16),
    height: rs(16),
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    paddingTop: rs(50), // Account for status bar
  },
  modalTitle: {
    color: 'white',
    fontSize: rf(16),
    fontWeight: '600',
  },
  fullscreenImageContainer: {
    width: screenWidth,
    height: screenHeight - rs(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: rs(48),
    height: rs(48),
    borderRadius: rs(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rs(-24),
  },
  navButtonLeft: {
    left: rs(16),
  },
  navButtonRight: {
    right: rs(16),
  },
  dotsContainer: {
    position: 'absolute',
    bottom: rs(30),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    marginHorizontal: rs(4),
  },
});