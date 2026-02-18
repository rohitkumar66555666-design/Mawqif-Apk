import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
  FlatList,
  Modal,
  StatusBar,
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

interface ImageCarouselProps {
  images: ImageData[];
  height?: number;
  onImagePress?: (index: number) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  height = 300, // Increased default height for bigger images
  onImagePress,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <View style={[styles.noImagesContainer, { 
        backgroundColor: colors.surface, 
        height: height // Use raw height value without rs() scaling
      }]}>
        <MaterialIcons name="image" size={rf(48)} color={colors.textSecondary} />
        <Text style={[styles.noImagesText, { color: colors.textSecondary }]}>
          {t('noImages') || 'No images available'}
        </Text>
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setCurrentIndex(index);
  };

  const handleImagePress = () => {
    if (onImagePress) {
      onImagePress(currentIndex);
    } else {
      // Default behavior: open fullscreen
      setFullscreenIndex(currentIndex);
      setFullscreenVisible(true);
    }
  };

  const handleFullscreenScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setFullscreenIndex(index);
  };

  const renderImageItem = ({ item, index }: { item: ImageData; index: number }) => (
    <TouchableOpacity
      style={[styles.imageContainer, { width: screenWidth }]}
      onPress={handleImagePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.url }}
        style={[styles.image, { height: height }]} // Use raw height value without rs() scaling
        resizeMode="cover" // This ensures good aspect ratio
      />
      
      {/* Primary badge */}
      {item.isPrimary && (
        <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
          <MaterialIcons name="star" size={rf(12)} color="white" />
          <Text style={styles.primaryText}>
            {t('primary') || 'Primary'}
          </Text>
        </View>
      )}
      
      {/* Image counter */}
      <View style={[styles.imageCounter, { backgroundColor: colors.overlay }]}>
        <Text style={styles.imageCounterText}>
          {index + 1} / {images.length}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFullscreenImage = ({ item, index }: { item: ImageData; index: number }) => (
    <View style={[styles.fullscreenImageContainer, { width: screenWidth }]}>
      <Image
        source={{ uri: item.url }}
        style={styles.fullscreenImage}
        resizeMode="contain"
      />
    </View>
  );

  const renderDots = () => {
    if (images.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex 
                  ? colors.primary 
                  : 'rgba(255, 255, 255, 0.5)',
              }
            ]}
            onPress={() => {
              // Scroll to specific image when dot is pressed
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ 
                  index, 
                  animated: true 
                });
              }
            }}
          />
        ))}
      </View>
    );
  };

  const renderFullscreenDots = () => {
    if (images.length <= 1) return null;

    return (
      <View style={styles.fullscreenDotsContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.fullscreenDot,
              {
                backgroundColor: index === fullscreenIndex 
                  ? 'white' 
                  : 'rgba(255, 255, 255, 0.5)',
              }
            ]}
          />
        ))}
      </View>
    );
  };

  const flatListRef = React.useRef<FlatList>(null);
  const fullscreenFlatListRef = React.useRef<FlatList>(null);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => `${item.id || index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
      />
      
      {renderDots()}

      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <StatusBar hidden />
        <View style={styles.fullscreenContainer}>
          {/* Header */}
          <View style={styles.fullscreenHeader}>
            <Text style={styles.fullscreenTitle}>
              {fullscreenIndex + 1} / {images.length}
            </Text>
            <TouchableOpacity 
              onPress={() => setFullscreenVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={rf(28)} color="white" />
            </TouchableOpacity>
          </View>

          {/* Images */}
          <FlatList
            ref={fullscreenFlatListRef}
            data={images}
            renderItem={renderFullscreenImage}
            keyExtractor={(item, index) => `fullscreen-${item.id || index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleFullscreenScroll}
            initialScrollIndex={currentIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />

          {/* Dots */}
          {renderFullscreenDots()}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%', // Ensure full width
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
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  primaryBadge: {
    position: 'absolute',
    top: rs(12),
    left: rs(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
  },
  primaryText: {
    color: 'white',
    fontSize: rf(11),
    fontWeight: '600',
    marginLeft: rs(4),
  },
  imageCounter: {
    position: 'absolute',
    top: rs(12),
    right: rs(12),
    paddingHorizontal: rs(10),
    paddingVertical: rs(6),
    borderRadius: rs(15),
  },
  imageCounterText: {
    color: 'white',
    fontSize: rf(12),
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: rs(20),
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
  // Fullscreen Modal Styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingVertical: rs(15),
    paddingTop: rs(50), // Account for status bar
  },
  fullscreenTitle: {
    color: 'white',
    fontSize: rf(18),
    fontWeight: '600',
  },
  closeButton: {
    padding: rs(8),
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: screenWidth,
    height: screenHeight - rs(150), // Account for header and dots
  },
  fullscreenDotsContainer: {
    position: 'absolute',
    bottom: rs(40),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenDot: {
    width: rs(10),
    height: rs(10),
    borderRadius: rs(5),
    marginHorizontal: rs(6),
  },
});