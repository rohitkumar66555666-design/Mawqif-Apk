import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place } from '../types';

// Cache service for offline functionality
export class CacheService {
  // Cache keys for different data types
  private static readonly CACHE_KEYS = {
    PLACES: 'cached_places',
    USER_LOCATION: 'cached_user_location',
    PLACE_DETAILS: 'cached_place_details_',
    DIRECTIONS: 'cached_directions_',
    IMAGES: 'cached_images_',
    LAST_UPDATE: 'cache_last_update',
    CACHE_VERSION: 'cache_version',
  };

  private static readonly CACHE_VERSION = '1.0';
  private static readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Initialize cache system
  static async initializeCache(): Promise<void> {
    try {
      console.log('🔄 Initializing cache system...');
      
      // Check cache version and clear if outdated
      const cachedVersion = await AsyncStorage.getItem(this.CACHE_KEYS.CACHE_VERSION);
      if (cachedVersion !== this.CACHE_VERSION) {
        console.log('🔄 Cache version outdated, clearing cache...');
        await this.clearAllCache();
        await AsyncStorage.setItem(this.CACHE_KEYS.CACHE_VERSION, this.CACHE_VERSION);
      }

      console.log('✅ Cache system initialized');
    } catch (error) {
      console.error('❌ Error initializing cache:', error);
    }
  }

  // Cache places data for offline access
  static async cachePlaces(places: Place[]): Promise<void> {
    try {
      console.log(`💾 Caching ${places.length} places...`);
      
      const cacheData = {
        places,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
      };

      await AsyncStorage.setItem(
        this.CACHE_KEYS.PLACES,
        JSON.stringify(cacheData)
      );

      // Cache individual place details for faster access
      for (const place of places) {
        await this.cachePlaceDetails(place);
      }

      await AsyncStorage.setItem(
        this.CACHE_KEYS.LAST_UPDATE,
        Date.now().toString()
      );

      console.log('✅ Places cached successfully');
    } catch (error) {
      console.error('❌ Error caching places:', error);
    }
  }

  // Get cached places (offline access)
  static async getCachedPlaces(): Promise<Place[] | null> {
    try {
      console.log('📱 Loading places from cache...');
      
      const cachedData = await AsyncStorage.getItem(this.CACHE_KEYS.PLACES);
      if (!cachedData) {
        console.log('📱 No cached places found');
        return null;
      }

      const parsed = JSON.parse(cachedData);
      
      // Check if cache is still valid
      const cacheAge = Date.now() - parsed.timestamp;
      if (cacheAge > this.MAX_CACHE_AGE) {
        console.log('📱 Cache expired, removing old data');
        await AsyncStorage.removeItem(this.CACHE_KEYS.PLACES);
        return null;
      }

      console.log(`✅ Loaded ${parsed.places.length} places from cache`);
      return parsed.places;
    } catch (error) {
      console.error('❌ Error loading cached places:', error);
      return null;
    }
  }

  // Cache individual place details
  static async cachePlaceDetails(place: Place): Promise<void> {
    try {
      const cacheKey = this.CACHE_KEYS.PLACE_DETAILS + place.id;
      const cacheData = {
        place,
        timestamp: Date.now(),
        fullAddress: await this.generateFullAddress(place),
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Error caching place details:', error);
    }
  }

  // Get cached place details
  static async getCachedPlaceDetails(placeId: string): Promise<Place | null> {
    try {
      const cacheKey = this.CACHE_KEYS.PLACE_DETAILS + placeId;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) return null;

      const parsed = JSON.parse(cachedData);
      
      // Check cache validity
      const cacheAge = Date.now() - parsed.timestamp;
      if (cacheAge > this.MAX_CACHE_AGE) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return parsed.place;
    } catch (error) {
      console.error('❌ Error loading cached place details:', error);
      return null;
    }
  }

  // Cache user's current location
  static async cacheUserLocation(location: { latitude: number; longitude: number }): Promise<void> {
    try {
      const cacheData = {
        location,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        this.CACHE_KEYS.USER_LOCATION,
        JSON.stringify(cacheData)
      );

      console.log('📍 User location cached');
    } catch (error) {
      console.error('❌ Error caching user location:', error);
    }
  }

  // Get cached user location
  static async getCachedUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const cachedData = await AsyncStorage.getItem(this.CACHE_KEYS.USER_LOCATION);
      if (!cachedData) return null;

      const parsed = JSON.parse(cachedData);
      
      // Location cache is valid for 1 hour
      const cacheAge = Date.now() - parsed.timestamp;
      if (cacheAge > 60 * 60 * 1000) {
        await AsyncStorage.removeItem(this.CACHE_KEYS.USER_LOCATION);
        return null;
      }

      return parsed.location;
    } catch (error) {
      console.error('❌ Error loading cached user location:', error);
      return null;
    }
  }

  // Cache directions data
  static async cacheDirections(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    directions: any[]
  ): Promise<void> {
    try {
      const cacheKey = this.CACHE_KEYS.DIRECTIONS + `${fromLat}_${fromLng}_${toLat}_${toLng}`;
      const cacheData = {
        directions,
        timestamp: Date.now(),
        from: { latitude: fromLat, longitude: fromLng },
        to: { latitude: toLat, longitude: toLng },
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('🧭 Directions cached');
    } catch (error) {
      console.error('❌ Error caching directions:', error);
    }
  }

  // Get cached directions
  static async getCachedDirections(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ): Promise<any[] | null> {
    try {
      const cacheKey = this.CACHE_KEYS.DIRECTIONS + `${fromLat}_${fromLng}_${toLat}_${toLng}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) return null;

      const parsed = JSON.parse(cachedData);
      
      // Directions cache is valid for 24 hours
      const cacheAge = Date.now() - parsed.timestamp;
      if (cacheAge > 24 * 60 * 60 * 1000) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return parsed.directions;
    } catch (error) {
      console.error('❌ Error loading cached directions:', error);
      return null;
    }
  }

  // Generate full address for offline use
  private static async generateFullAddress(place: Place): Promise<string> {
    try {
      // Create a comprehensive address string
      const addressParts = [
        place.title,
        place.city,
        `Lat: ${place.latitude.toFixed(6)}`,
        `Lng: ${place.longitude.toFixed(6)}`,
      ].filter(Boolean);

      return addressParts.join(', ');
    } catch (error) {
      console.error('❌ Error generating full address:', error);
      return place.title || 'Unknown Location';
    }
  }

  // Get full address for offline use
  static async getOfflineAddress(placeId: string): Promise<string | null> {
    try {
      const cacheKey = this.CACHE_KEYS.PLACE_DETAILS + placeId;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) return null;

      const parsed = JSON.parse(cachedData);
      return parsed.fullAddress || null;
    } catch (error) {
      console.error('❌ Error getting offline address:', error);
      return null;
    }
  }

  // Check if app is in offline mode
  static async isOfflineMode(): Promise<boolean> {
    try {
      // Simple network check with AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return !response.ok;
    } catch (error) {
      return true; // Assume offline if fetch fails
    }
  }

  // Get cache statistics
  static async getCacheStats(): Promise<{
    placesCount: number;
    lastUpdate: string;
    cacheSize: string;
  }> {
    try {
      const cachedPlaces = await this.getCachedPlaces();
      const lastUpdate = await AsyncStorage.getItem(this.CACHE_KEYS.LAST_UPDATE);
      
      return {
        placesCount: cachedPlaces?.length || 0,
        lastUpdate: lastUpdate 
          ? new Date(parseInt(lastUpdate)).toLocaleDateString()
          : 'Never',
        cacheSize: 'Calculating...', // You can implement size calculation
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return {
        placesCount: 0,
        lastUpdate: 'Error',
        cacheSize: 'Unknown',
      };
    }
  }

  // Clear specific cache
  static async clearPlacesCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEYS.PLACES);
      console.log('🗑️ Places cache cleared');
    } catch (error) {
      console.error('❌ Error clearing places cache:', error);
    }
  }

  // Clear all cache (manual clear by user)
  static async clearAllCache(): Promise<void> {
    try {
      console.log('🗑️ Clearing all cache...');
      
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('cached_') || 
        key.includes('cache_')
      );

      await AsyncStorage.multiRemove(cacheKeys);
      console.log('✅ All cache cleared');
    } catch (error) {
      console.error('❌ Error clearing all cache:', error);
    }
  }

  // Preload essential data for offline use
  static async preloadOfflineData(places: Place[]): Promise<void> {
    try {
      console.log('🔄 Preloading offline data...');
      
      // Cache places
      await this.cachePlaces(places);
      
      // Cache current location if available
      // This would be called from your location service
      
      console.log('✅ Offline data preloaded');
    } catch (error) {
      console.error('❌ Error preloading offline data:', error);
    }
  }

  // Proactive caching - immediately fetch and cache data when user gets location
  static async proactiveCacheNearbyPlaces(
    userLocation: { latitude: number; longitude: number },
    fetchPlacesFunction: (location: any, radius: number) => Promise<Place[]>
  ): Promise<Place[]> {
    try {
      console.log('🚀 Proactive caching: Immediately fetching places for offline backup...');
      
      // Cache user location first
      await this.cacheUserLocation(userLocation);
      
      // Fetch places in multiple radius zones for comprehensive coverage
      const radiusZones = [5000, 15000, 50000]; // 5km, 15km, 50km
      let allCachedPlaces: Place[] = [];
      
      for (const radius of radiusZones) {
        try {
          console.log(`📍 Fetching places within ${radius/1000}km...`);
          const places = await fetchPlacesFunction(userLocation, radius);
          
          if (places && places.length > 0) {
            // Cache these places
            await this.cachePlaces(places);
            
            // Cache individual place details for faster offline access
            for (const place of places) {
              await this.cachePlaceDetails(place);
            }
            
            allCachedPlaces = places; // Use the largest successful fetch
            console.log(`✅ Cached ${places.length} places from ${radius/1000}km radius`);
            
            // If we got a good amount of places, we can break early
            if (places.length >= 20) {
              console.log(`🎯 Got sufficient places (${places.length}), stopping proactive cache`);
              break;
            }
          }
        } catch (radiusError) {
          console.log(`⚠️ Failed to fetch places for ${radius/1000}km radius:`, radiusError);
          continue; // Try next radius
        }
      }
      
      console.log(`✅ Proactive caching complete: ${allCachedPlaces.length} places cached`);
      return allCachedPlaces;
      
    } catch (error) {
      console.error('❌ Error in proactive caching:', error);
      
      // Try to return any existing cached places as fallback
      const existingCache = await this.getCachedPlaces();
      return existingCache || [];
    }
  }

  // Enhanced cache loading with better offline fallback
  static async getPlacesWithOfflineFallback(
    userLocation: { latitude: number; longitude: number } | null
  ): Promise<Place[]> {
    try {
      // First try to get cached places
      const cachedPlaces = await this.getCachedPlaces();
      
      if (cachedPlaces && cachedPlaces.length > 0) {
        console.log(`📱 Found ${cachedPlaces.length} cached places for offline use`);
        
        // If we have user location, calculate distances for cached places
        if (userLocation) {
          const placesWithDistance = cachedPlaces.map(place => {
            const distance = this.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              place.latitude,
              place.longitude
            );
            console.log(`📏 Distance to ${place.title}: ${distance}m`);
            return {
              ...place,
              distance
            };
          }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          console.log(`✅ Calculated distances for ${placesWithDistance.length} places`);
          return placesWithDistance;
        }
        
        return cachedPlaces;
      }
      
      console.log('📱 No cached places found');
      return [];
      
    } catch (error) {
      console.error('❌ Error getting places with offline fallback:', error);
      return [];
    }
  }

  // Calculate distance between two points (helper method)
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Remove a specific place from cache
  static async removeCachedPlace(placeId: string): Promise<void> {
    try {
      // Remove individual place details
      const detailsCacheKey = this.CACHE_KEYS.PLACE_DETAILS + placeId;
      await AsyncStorage.removeItem(detailsCacheKey);
      
      // Update the main places cache by removing the place
      const cachedPlaces = await this.getCachedPlaces();
      if (cachedPlaces) {
        const updatedPlaces = cachedPlaces.filter(place => place.id !== placeId);
        await this.cachePlaces(updatedPlaces);
        console.log(`🗑️ Removed place ${placeId} from cache`);
      }
    } catch (error) {
      console.error('❌ Error removing cached place:', error);
    }
  }
}