import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

interface PlaceMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  imageUri?: string;
  onPress?: () => void;
}

export const PlaceMarker: React.FC<PlaceMarkerProps> = ({
  coordinate,
  imageUri,
  onPress,
}) => {
  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      centerOffset={{ x: 0, y: 0 }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.markerImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <MaterialIcons 
            name="place" 
            size={18} 
            color="#1FA365" 
          />
        </View>
      )}
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1FA365',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  fallbackContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1FA365',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});