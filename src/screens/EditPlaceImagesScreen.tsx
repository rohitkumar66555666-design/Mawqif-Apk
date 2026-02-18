import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ImageUploadService } from '../services/image-upload.service';
import { rf, rs } from '../utils/responsive';

interface Props {
  navigation: any;
  route: any;
}

const EditPlaceImagesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { placeId } = route.params || {};
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permissionRequired') || 'Permission required', t('galleryPermissionRequired') || 'Gallery permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: true });
    if (result.canceled) return;
    if (result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri || null);
      (global as any).selectedImageData = { base64: result.assets[0].base64, uri: result.assets[0].uri };
    }
  };

  const handleUpload = async () => {
    if (!photo) {
      Alert.alert(t('error') || 'Error', t('photoRequired') || 'Photo required');
      return;
    }
    setUploading(true);
    try {
      const publicUrl = await ImageUploadService.uploadPlaceImage(photo, placeId);
      Alert.alert(t('success') || 'Success', t('imageUploaded') || 'Image uploaded', [{ text: t('ok') || 'OK', onPress: () => navigation.goBack() }]);
      console.log('Uploaded URL:', publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(t('error') || 'Error', (error instanceof Error) ? error.message : t('failedToUploadImage'));
    } finally {
      setUploading(false);
      delete (global as any).selectedImageData;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>{t('editImages') || 'Edit Images'}</Text>

      <TouchableOpacity style={[styles.photoBox, { borderColor: colors.border }]} onPress={pickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.preview} />
        ) : (
          <Text style={{ color: colors.textSecondary }}>{t('tapToSelect') || 'Tap to select an image'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.primary }]} onPress={handleUpload} disabled={uploading}>
        <Text style={{ color: 'white' }}>{uploading ? (t('uploading') || 'Uploading...') : (t('upload') || 'Upload')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: rs(16) },
  title: { fontSize: rf(18), fontWeight: '700', marginBottom: rs(12) },
  photoBox: { height: rs(220), borderWidth: 1, borderRadius: rs(8), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadBtn: { marginTop: rs(12), paddingVertical: rs(12), alignItems: 'center', borderRadius: rs(8) },
});

export default EditPlaceImagesScreen;
