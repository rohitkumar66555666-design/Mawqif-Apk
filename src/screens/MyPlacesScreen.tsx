import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserInfo } from '../lib/authHelper';
import { PlacesService } from '../services/places.service';
import { Place } from '../types';
import { rf, rs } from '../utils/responsive';

interface MyPlacesProps {
  navigation: any;
}

const MyPlacesScreen: React.FC<MyPlacesProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, getUserDisplayName } = useUserInfo();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyPlaces();
    } else {
      setPlaces([]);
    }
  }, [isAuthenticated, user]);

  const loadMyPlaces = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      console.log('👤 Loading places for user:', user.uid);
      const userPlaces = await PlacesService.getUserPlaces(user.uid);
      setPlaces(userPlaces);
      console.log(`✅ Loaded ${userPlaces.length} user places`);
    } catch (error) {
      console.error('Error loading host places:', error);
      Alert.alert(t('error') || 'Error', t('failedToLoadPlaces') || 'Failed to load your places');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyPlaces();
    setRefreshing(false);
  };

  const handleEdit = (place: Place) => {
    navigation.navigate('EditPlace', { placeId: place.id });
  };

  const handleEditImages = (place: Place) => {
    navigation.navigate('PhotoManagement', {
      placeId: place.id,
      placeName: place.title || 'Untitled Place'
    });
  };

  const handleViewDetails = (place: Place) => {
    navigation.navigate('PlaceDetail', { placeId: place.id });
  };

  const handleDelete = (place: Place) => {
    Alert.alert(
      t('deletePlace') || 'Delete Place',
      t('deleteConfirmation') || `Are you sure you want to delete "${place.title}"? This action cannot be undone.`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await PlacesService.deletePlace(place.id);
              Alert.alert(
                t('success'),
                t('placeDeletedSuccessfully') || 'Place deleted successfully',
                [{ text: t('ok'), onPress: () => loadMyPlaces() }]
              );
            } catch (error) {
              console.error('Error deleting place:', error);
              Alert.alert(t('error'), t('failedToDeletePlace') || 'Failed to delete place');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Place }) => (
    <View style={[styles.modernCard, { backgroundColor: colors.sectionBackground }]}>
      {/* Image and Quick Actions */}
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: item.photo || undefined }}
          style={styles.cardImage}
        />
        <View style={styles.cardOverlay}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
            onPress={() => handleViewDetails(item)}
          >
            <MaterialIcons name="visibility" size={rf(16)} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title || t('noTitle') || 'No title'}
          </Text>
          <View style={[styles.typeChip, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.typeChipText, { color: colors.primary }]}>
              {t(item.type)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={rf(14)} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.city || '-'}
            </Text>
          </View>
          {item.capacity && (
            <View style={styles.detailRow}>
              <MaterialIcons name="people" size={rf(14)} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {item.capacity} people
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.modernActionsRow}>
          <TouchableOpacity
            style={[styles.modernActionBtn, styles.editBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleEdit(item)}
          >
            <MaterialIcons name="edit" size={rf(16)} color="white" />
            <Text style={[styles.modernActionText, { color: 'white' }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modernActionBtn, styles.imageBtn, { backgroundColor: '#4ECDC4' }]}
            onPress={() => handleEditImages(item)}
          >
            <MaterialIcons name="photo-camera" size={rf(16)} color="white" />
            <Text style={[styles.modernActionText, { color: 'white' }]}>Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modernActionBtn, styles.deleteBtn, { backgroundColor: colors.error }]}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={rf(16)} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={rf(24)} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: 'white' }]}>
            {t('myPlaces') || 'My Places'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.center}>
          <MaterialIcons name="login" size={rf(48)} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {t('loginToManagePlaces') || 'Login to manage your places'}
          </Text>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              const { useAuthStore } = require('../lib/authStore');
              const { setReturnRoute } = useAuthStore.getState();
              setReturnRoute('MyPlaces');
              navigation.navigate('Login');
            }}
          >
            <Text style={[styles.loginBtnText, { color: 'white' }]}>
              {t('login') || 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={rf(24)} color="white" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: 'white' }]}>
          {t('myPlaces') || 'My Places'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPlace')}
        >
          <MaterialIcons name="add" size={rf(24)} color="white" />
        </TouchableOpacity>
      </View>

      {/* Places List */}
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <MaterialIcons name="location-off" size={rf(48)} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {t('noHostedPlaces') || 'No places added yet'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              {t('addFirstPlace') || 'Add your first prayer space to help the community'}
            </Text>
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddPlace')}
            >
              <MaterialIcons name="add-location" size={rf(20)} color="white" />
              <Text style={[styles.createBtnText, { color: 'white' }]}>
                {t('addPlace') || 'Add Place'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={places.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Stats Footer */}
      {places.length > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.sectionBackground, borderTopColor: colors.border }]}>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {t('totalPlaces') || 'Total Places'}: {places.length}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  headerTitle: {
    fontSize: rf(16), // Reduced from rf(18)
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: rs(6), // Reduced from rs(8)
  },
  headerRight: {
    width: rs(40), // Placeholder for alignment
  },
  listContainer: {
    padding: rs(16),
  },
  emptyContainer: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: rs(32)
  },
  emptyText: {
    fontSize: rf(16),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: rs(16),
    marginBottom: rs(8),
  },
  emptySubtext: {
    fontSize: rf(14),
    textAlign: 'center',
    marginBottom: rs(24),
    lineHeight: rf(20),
  },
  // Modern Card Styles
  modernCard: {
    borderRadius: rs(16),
    marginBottom: rs(16),
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.1,
    shadowRadius: rs(8),
  },
  cardImageContainer: {
    position: 'relative',
    height: rs(120),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  cardOverlay: {
    position: 'absolute',
    top: rs(8),
    right: rs(8),
  },
  quickActionButton: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: rs(16),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rs(12),
  },
  cardTitle: {
    fontSize: rf(16),
    fontWeight: '700',
    flex: 1,
    marginRight: rs(8),
  },
  typeChip: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
  },
  typeChipText: {
    fontSize: rf(11),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardDetails: {
    marginBottom: rs(16),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(4),
  },
  detailText: {
    fontSize: rf(13),
    marginLeft: rs(6),
    flex: 1,
  },
  modernActionsRow: {
    flexDirection: 'row',
    gap: rs(8),
  },
  modernActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
    borderRadius: rs(8),
    flex: 1,
    elevation: 1,
    shadowOffset: { width: 0, height: rs(1) },
    shadowOpacity: 0.1,
    shadowRadius: rs(2),
  },
  editBtn: {
    flex: 1.2,
  },
  imageBtn: {
    flex: 1,
  },
  deleteBtn: {
    flex: 0.6,
  },
  modernActionText: {
    fontSize: rf(12),
    fontWeight: '600',
    marginLeft: rs(4),
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(12),
    paddingHorizontal: rs(20),
    borderRadius: rs(25),
    elevation: 3,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.2,
    shadowRadius: rs(4),
  },
  createBtnText: {
    fontSize: rf(14),
    fontWeight: '600',
    marginLeft: rs(8),
  },
  loginBtn: {
    paddingVertical: rs(12),
    paddingHorizontal: rs(24),
    borderRadius: rs(25),
    elevation: 3,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.2,
    shadowRadius: rs(4),
  },
  loginBtnText: {
    fontSize: rf(14),
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderTopWidth: 1,
  },
  statsText: {
    fontSize: rf(12),
    textAlign: 'center',
  },
});

export default MyPlacesScreen;
