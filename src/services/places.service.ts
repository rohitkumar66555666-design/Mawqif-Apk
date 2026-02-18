import { supabase } from './supabase';
import { Place, CreatePlaceInput, Location } from '../types';
import { LocationService } from './location.service';
import { CacheService } from './cache.service';

export class PlacesService {
  // Get nearby places within radius (in meters) - with PROACTIVE offline support
  static async getNearbyPlaces(
    userLocation: Location,
    radiusMeters: number = 2000
  ): Promise<Place[]> {
    try {
      console.log('🔍 Fetching nearby places with proactive caching...');
      
      // Try to fetch from online source first
      try {
        const { data, error } = await supabase
          .from('places')
          .select('*');

        if (!error && data) {
          console.log(`🌐 Online: Fetched ${data.length} places from Supabase`);
          
          // Calculate distances for ALL places (don't filter by radius here)
          const placesWithDistance = data
            .map((place) => {
              const distance = LocationService.calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                place.latitude,
                place.longitude
              );

              return {
                ...place,
                distance,
              } as Place;
            })
            .sort((a, b) => a.distance! - b.distance!);

          console.log(`📊 Calculated distances for ${placesWithDistance.length} places`);
          console.log(`📍 Sample distances:`, placesWithDistance.slice(0, 5).map(p => `${p.title}: ${Math.round(p.distance!)}m`));

          // Cache all places for comprehensive offline support
          await CacheService.cachePlaces(placesWithDistance);
          await CacheService.cacheUserLocation(userLocation);
          
          console.log(`✅ Cached ${placesWithDistance.length} places for offline use`);

          // Apply radius filter AFTER logging (let HomeScreen handle filtering)
          const filteredPlaces = placesWithDistance.filter((place) => place.distance! <= radiusMeters);
          console.log(`🔍 Filtered to ${filteredPlaces.length} places within ${radiusMeters/1000}km`);

          return filteredPlaces;
        }
      } catch (onlineError) {
        console.log('🌐 Online fetch failed, trying offline cache...');
      }

      // If online fetch fails, try offline cache with enhanced fallback
      console.log('📱 Offline: Loading places from cache...');
      const cachedPlaces = await CacheService.getPlacesWithOfflineFallback(userLocation);
      
      if (cachedPlaces && cachedPlaces.length > 0) {
        console.log(`📱 Offline: Found ${cachedPlaces.length} cached places`);
        
        // Filter cached places by radius
        const filteredPlaces = cachedPlaces
          .filter((place) => place.distance! <= radiusMeters)
          .sort((a, b) => a.distance! - b.distance!);

        console.log(`📱 Offline: ${filteredPlaces.length} places within ${radiusMeters/1000}km`);
        return filteredPlaces;
      }

      console.log('❌ No places available (online or offline)');
      return [];
    } catch (error) {
      console.error('❌ Error in getNearbyPlaces:', error);
      
      // Last resort: try cached places
      const cachedPlaces = await CacheService.getCachedPlaces();
      if (cachedPlaces) {
        // Calculate distances for cached places
        const placesWithDistance = cachedPlaces.map((place) => {
          const distance = LocationService.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            place.latitude,
            place.longitude
          );
          return { ...place, distance } as Place;
        }).sort((a, b) => a.distance! - b.distance!);
        
        return placesWithDistance;
      }
      return [];
    }
  }

  // Proactive cache initialization - call this immediately when user location is obtained
  static async initializeProactiveCache(userLocation: Location): Promise<Place[]> {
    try {
      console.log('🚀 Initializing proactive cache for immediate offline backup...');
      
      // Use the proactive caching method from CacheService
      const cachedPlaces = await CacheService.proactiveCacheNearbyPlaces(
        userLocation,
        async (location, radius) => {
          // Fetch places from Supabase for caching
          const { data, error } = await supabase
            .from('places')
            .select('*');

          if (error || !data) {
            throw new Error(`Supabase error: ${error?.message || 'No data'}`);
          }

          // Calculate distances and return places within radius
          const placesWithDistance = data
            .map((place) => {
              const distance = LocationService.calculateDistance(
                location.latitude,
                location.longitude,
                place.latitude,
                place.longitude
              );
              return { ...place, distance } as Place;
            })
            .filter((place) => place.distance! <= radius)
            .sort((a, b) => a.distance! - b.distance!);

          return placesWithDistance;
        }
      );

      console.log(`✅ Proactive cache initialized with ${cachedPlaces.length} places`);
      return cachedPlaces;
      
    } catch (error) {
      console.error('❌ Error initializing proactive cache:', error);
      return [];
    }
  }

  // Get single place by ID - with offline support
  static async getPlaceById(id: string): Promise<Place | null> {
    try {
      console.log(`🔍 Fetching place details for ID: ${id}`);
      
      // Try online first
      try {
        const { data, error } = await supabase
          .from('places')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          console.log('🌐 Online: Fetched place details from Supabase');
          
          // Cache the place details
          await CacheService.cachePlaceDetails(data as Place);
          
          return data as Place;
        }
      } catch (onlineError) {
        console.log('🌐 Online fetch failed, trying offline cache...');
      }

      // Try offline cache
      console.log('📱 Offline: Loading place details from cache...');
      const cachedPlace = await CacheService.getCachedPlaceDetails(id);
      
      if (cachedPlace) {
        console.log('📱 Offline: Found cached place details');
        return cachedPlace;
      }

      console.log('❌ Place not found (online or offline)');
      return null;
    } catch (error) {
      console.error('❌ Error in getPlaceById:', error);
      
      // Last resort: try cached place
      const cachedPlace = await CacheService.getCachedPlaceDetails(id);
      return cachedPlace;
    }
  }

  /**
   * Check and update host status based on places owned (DISABLED - using profiles table only)
   */
  static async checkAndUpdateHostStatus(userId: string): Promise<boolean> {
    try {
      console.log('🔍 Checking host status for user (profiles only):', userId);

      // Count user's active places
      const { data: places, error: placesError } = await supabase
        .from('places')
        .select('id')
        .eq('owner_id', userId)
        .eq('is_active', true);

      if (placesError) {
        console.error('❌ Error checking user places:', placesError);
        return false;
      }

      const placeCount = places?.length || 0;
      console.log(`📊 User has ${placeCount} active places`);

      // DISABLED: No longer using users table to avoid constraint violations
      // Host status is determined by having active places
      const shouldBeHost = placeCount > 0;
      
      console.log(`ℹ️ User host status determined by places: ${shouldBeHost}`);
      return shouldBeHost;
    } catch (error) {
      console.error('❌ Error in checkAndUpdateHostStatus:', error);
      return false;
    }
  }

  /**
   * Update user host status (DISABLED - using profiles table only)
   */
  static async updateUserHostStatus(userId: string, isHost: boolean = true): Promise<void> {
    try {
      console.log('👑 Host status update disabled (using profiles table only):', userId, 'to:', isHost);
      
      // DISABLED: No longer using users table to avoid constraint violations
      // Host status is determined dynamically by checking active places
      
      console.log('ℹ️ Host status is determined by active places count');
    } catch (error) {
      console.error('❌ Error in updateUserHostStatus:', error);
      throw error;
    }
  }

  // Create new place with proper owner tracking and auto-fill host contact info
  static async createPlace(placeData: CreatePlaceInput): Promise<Place> {
    console.log('🏪 PlacesService.createPlace called with data:', placeData);
    
    try {
      console.log('🔗 Connecting to Supabase...');
      
      // Get host contact information from profiles table instead of users table
      let hostContactInfo = { contact_phone: '', whatsapp_number: '' };
      if (placeData.owner_id) {
        try {
          console.log('📞 Fetching host contact info from profiles for auto-fill...');
          const { data: hostData, error: hostError } = await supabase
            .from('profiles')
            .select('phone_number')
            .eq('user_id', placeData.owner_id)
            .single();

          if (!hostError && hostData) {
            hostContactInfo = {
              contact_phone: hostData.phone_number || '',
              whatsapp_number: '', // Not stored in profiles yet
            };
            console.log('✅ Host contact info retrieved from profiles for auto-fill:', hostContactInfo);
          }
        } catch (contactError) {
          console.warn('⚠️ Could not fetch host contact info from profiles:', contactError);
        }
      }
      
      // Ensure owner_id is set for host tracking and merge contact info
      const placeWithOwner = {
        ...placeData,
        owner_id: placeData.owner_id, // This should be the authenticated user's ID
        is_active: true,
        created_at: new Date().toISOString(),
        // Auto-fill contact info from host profile if not provided
        contact_phone: placeData.contact_phone || hostContactInfo.contact_phone,
        whatsapp_number: placeData.whatsapp_number || hostContactInfo.whatsapp_number,
      };
      
      console.log('📋 Final place data with host contact info:', placeWithOwner);
      
      const { data, error } = await supabase
        .from('places')
        .insert([placeWithOwner])
        .select()
        .single();

      console.log('📥 Supabase response - data:', data);
      console.log('📥 Supabase response - error:', error);

      if (error) {
        console.error('❌ Supabase error details:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data returned from Supabase');
        throw new Error('No data returned from database');
      }

      console.log('✅ Place created successfully with host contact info:', data);
      
      // DISABLED: No longer updating users table to avoid constraint violations
      // Host status is determined dynamically by checking active places
      console.log('ℹ️ Host status update disabled - using profiles table only');
      
      return data as Place;
    } catch (error) {
      console.error('❌ Error in createPlace:', error);
      throw error;
    }
  }

  // Get cached places for offline mode with distance calculation
  static async getCachedPlaces(userLocation?: Location): Promise<Place[]> {
    try {
      const cachedPlaces = await CacheService.getCachedPlaces();
      if (!cachedPlaces || cachedPlaces.length === 0) {
        return [];
      }

      // If user location is provided, calculate distances
      if (userLocation) {
        const placesWithDistance = cachedPlaces.map((place) => {
          const distance = LocationService.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            place.latitude,
            place.longitude
          );
          return { ...place, distance } as Place;
        }).sort((a, b) => a.distance! - b.distance!);
        
        console.log(`📱 Calculated distances for ${placesWithDistance.length} cached places`);
        return placesWithDistance;
      }

      return cachedPlaces;
    } catch (error) {
      console.error('❌ Error getting cached places:', error);
      return [];
    }
  }

  // Cache places for offline mode
  static async cachePlaces(places: Place[]): Promise<void> {
    try {
      await CacheService.cachePlaces(places);
      console.log(`✅ Cached ${places.length} places for offline use`);
    } catch (error) {
      console.error('❌ Error caching places:', error);
    }
  }

  // Get offline address for a place
  static async getOfflineAddress(placeId: string): Promise<string | null> {
    try {
      return await CacheService.getOfflineAddress(placeId);
    } catch (error) {
      console.error('❌ Error getting offline address:', error);
      return null;
    }
  }

  // Check if app is in offline mode
  static async isOfflineMode(): Promise<boolean> {
    try {
      return await CacheService.isOfflineMode();
    } catch (error) {
      console.error('❌ Error checking offline mode:', error);
      return true; // Assume offline if check fails
    }
  }

  // Update existing place
  static async updatePlace(placeId: string, updateData: Partial<CreatePlaceInput>): Promise<Place> {
    console.log('📝 PlacesService.updatePlace called with ID:', placeId);
    console.log('📝 Update data:', updateData);
    
    try {
      const { data, error } = await supabase
        .from('places')
        .update(updateData)
        .eq('id', placeId)
        .select()
        .single();

      console.log('📥 Supabase update response - data:', data);
      console.log('📥 Supabase update response - error:', error);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw new Error(`Failed to update place: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data returned from update');
        throw new Error('No data returned from database update');
      }

      console.log('✅ Place updated successfully:', data);
      
      // Update cache with new data
      try {
        await CacheService.cachePlaceDetails(data as Place);
        console.log('✅ Updated place cached successfully');
      } catch (cacheError) {
        console.warn('⚠️ Failed to update cache:', cacheError);
      }

      return data as Place;
    } catch (error) {
      console.error('❌ Error in updatePlace:', error);
      throw error;
    }
  }

  // Delete place
  static async deletePlace(placeId: string): Promise<void> {
    console.log('🗑️ PlacesService.deletePlace called with ID:', placeId);
    
    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', placeId);

      console.log('📥 Supabase delete response - error:', error);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw new Error(`Failed to delete place: ${error.message}`);
      }

      console.log('✅ Place deleted successfully');
      
      // Remove from cache
      try {
        await CacheService.removeCachedPlace(placeId);
        console.log('✅ Place removed from cache');
      } catch (cacheError) {
        console.warn('⚠️ Failed to remove from cache:', cacheError);
      }

    } catch (error) {
      console.error('❌ Error in deletePlace:', error);
      throw error;
    }
  }

  // Get places owned by a specific user with detailed statistics
  static async getUserPlaces(userId: string): Promise<Place[]> {
    console.log('👤 PlacesService.getUserPlaces called for user:', userId);
    
    try {
      // Try online first - get places with statistics
      try {
        const { data, error } = await supabase
          .from('places')
          .select(`
            *,
            reviews:reviews(count),
            bookmarks:bookmarks(count)
          `)
          .eq('owner_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          console.log(`🌐 Online: Fetched ${data.length} user places from Supabase`);
          
          // Process the data to include statistics
          const placesWithStats = data.map(place => ({
            ...place,
            total_reviews: place.reviews?.[0]?.count || 0,
            total_bookmarks: place.bookmarks?.[0]?.count || 0,
          }));
          
          return placesWithStats as Place[];
        }
      } catch (onlineError) {
        console.log('🌐 Online fetch failed, trying offline cache...');
      }

      // Try offline cache
      console.log('📱 Offline: Loading user places from cache...');
      const cachedPlaces = await CacheService.getCachedPlaces();
      
      if (cachedPlaces) {
        const userPlaces = cachedPlaces.filter(place => place.owner_id === userId);
        console.log(`📱 Offline: Found ${userPlaces.length} cached user places`);
        return userPlaces;
      }

      console.log('❌ No user places found (online or offline)');
      return [];
    } catch (error) {
      console.error('❌ Error in getUserPlaces:', error);
      return [];
    }
  }

  // Get host statistics and analytics
  static async getHostStatistics(userId: string): Promise<{
    totalPlaces: number;
    totalReviews: number;
    totalBookmarks: number;
    averageRating: number;
    hostSince: string | null;
    isHost: boolean;
  }> {
    console.log('📊 Getting host statistics for user (profiles only):', userId);
    
    try {
      // DISABLED: No longer using users table to avoid constraint violations
      // Get host info from profiles table instead
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile data:', profileError);
        profileData = { created_at: new Date().toISOString() };
      }

      // Get detailed statistics from places
      const { data: statsData, error: statsError } = await supabase
        .from('places')
        .select(`
          id,
          total_reviews,
          total_bookmarks,
          avg_rating,
          created_at
        `)
        .eq('owner_id', userId)
        .eq('is_active', true);

      if (statsError) {
        console.error('❌ Error fetching place statistics:', statsError);
        throw statsError;
      }

      // Calculate totals
      const totalPlaces = statsData?.length || 0;
      const totalReviews = statsData?.reduce((sum, place) => sum + (place.total_reviews || 0), 0) || 0;
      const totalBookmarks = statsData?.reduce((sum, place) => sum + (place.total_bookmarks || 0), 0) || 0;
      const averageRating = statsData?.length > 0 
        ? statsData.reduce((sum, place) => sum + (place.avg_rating || 0), 0) / statsData.length 
        : 0;

      // Determine host since date from first place creation or profile creation
      let hostSince = null;
      if (totalPlaces > 0 && statsData && statsData.length > 0) {
        const firstPlaceDate = statsData
          .map(place => new Date(place.created_at))
          .sort((a, b) => a.getTime() - b.getTime())[0];
        hostSince = firstPlaceDate.toISOString();
      }

      const statistics = {
        totalPlaces,
        totalReviews,
        totalBookmarks,
        averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        hostSince,
        isHost: totalPlaces > 0, // Host status determined by having places
      };

      console.log('✅ Host statistics calculated (profiles only):', statistics);
      return statistics;

    } catch (error) {
      console.error('❌ Error in getHostStatistics:', error);
      return {
        totalPlaces: 0,
        totalReviews: 0,
        totalBookmarks: 0,
        averageRating: 0,
        hostSince: null,
        isHost: false,
      };
    }
  }

  // Get reviews for places owned by a specific user (host reviews)
  static async getHostReviews(userId: string): Promise<any[]> {
    console.log('📝 Getting reviews for host places:', userId);
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          places!inner(
            id,
            title,
            owner_id
          )
        `)
        .eq('places.owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching host reviews:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} reviews for host places`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getHostReviews:', error);
      return [];
    }
  }

  // Reply to a review (host response)
  static async replyToReview(reviewId: string, hostResponse: string): Promise<void> {
    console.log('💬 Adding host response to review:', reviewId);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          host_response: hostResponse,
          host_response_date: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) {
        console.error('❌ Error adding host response:', error);
        throw error;
      }

      console.log('✅ Host response added successfully');
    } catch (error) {
      console.error('❌ Error in replyToReview:', error);
      throw error;
    }
  }

  // Delete a review (host can delete reviews on their places)
  static async deleteReview(reviewId: string): Promise<void> {
    console.log('🗑️ Deleting review:', reviewId);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        console.error('❌ Error deleting review:', error);
        throw error;
      }

      console.log('✅ Review deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteReview:', error);
      throw error;
    }
  }

  // Toggle place status (open/closed) for hosts
  static async togglePlaceStatus(
    placeId: string, 
    isOpen: boolean, 
    statusMessage?: string, 
    userId?: string
  ): Promise<void> {
    console.log(`🔄 Toggling place status - ID: ${placeId}, Open: ${isOpen}`);
    
    try {
      const updateData: any = {
        is_open: isOpen,
        status_updated_at: new Date().toISOString(),
      };

      if (statusMessage) {
        updateData.status_message = statusMessage;
      }

      if (userId) {
        updateData.status_updated_by = userId;
      }

      const { error } = await supabase
        .from('places')
        .update(updateData)
        .eq('id', placeId);

      if (error) {
        console.error('❌ Error updating place status:', error);
        throw error;
      }

      console.log(`✅ Place status updated successfully - ${isOpen ? 'OPEN' : 'CLOSED'}`);
    } catch (error) {
      console.error('❌ Error in togglePlaceStatus:', error);
      throw error;
    }
  }

  // Get host places with status information
  static async getHostPlacesWithStatus(userId: string): Promise<Place[]> {
    console.log('🏪 Getting host places with status for user:', userId);
    
    try {
      // First, try to get places directly by user ID
      let { data, error } = await supabase
        .from('places')
        .select(`
          *,
          reviews:reviews(count),
          bookmarks:bookmarks(count)
        `)
        .eq('owner_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching host places with status:', error);
        throw error;
      }

      // If no places found, try to find places by phone number
      // This handles the case where user ID changed between sessions
      if (!data || data.length === 0) {
        console.log('🔍 No places found for user ID, trying phone number lookup...');
        
        // Get user's phone number from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('user_id', userId)
          .single();

        if (profileData?.phone_number) {
          console.log('📱 Found phone number:', profileData.phone_number, 'searching for places...');
          
          // Find places owned by any user with this phone number
          const { data: phoneBasedPlaces, error: phoneError } = await supabase
            .from('places')
            .select(`
              *,
              reviews:reviews(count),
              bookmarks:bookmarks(count),
              profiles!inner(phone_number)
            `)
            .eq('profiles.phone_number', profileData.phone_number)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (!phoneError && phoneBasedPlaces && phoneBasedPlaces.length > 0) {
            console.log(`📱 Found ${phoneBasedPlaces.length} places by phone number, updating owner_id...`);
            
            // Update the places to use the current user ID
            const placeIds = phoneBasedPlaces.map(p => p.id);
            await supabase
              .from('places')
              .update({ owner_id: userId, updated_at: new Date().toISOString() })
              .in('id', placeIds);
            
            data = phoneBasedPlaces;
            console.log('✅ Updated place ownership to current user ID');
          }
        }
      }

      if (!data || data.length === 0) {
        console.log('❌ No places found for user');
        return [];
      }

      // Process the data to include statistics and status
      const placesWithStatusAndStats = data.map(place => ({
        ...place,
        total_reviews: place.reviews?.[0]?.count || 0,
        total_bookmarks: place.bookmarks?.[0]?.count || 0,
        // Ensure status fields are included
        is_open: place.is_open ?? true, // Default to open if not set
        status_message: place.status_message || null,
        status_updated_at: place.status_updated_at || null,
        status_updated_by: place.status_updated_by || null,
      }));

      console.log(`✅ Fetched ${placesWithStatusAndStats.length} host places with status`);
      return placesWithStatusAndStats as Place[];
    } catch (error) {
      console.error('❌ Error in getHostPlacesWithStatus:', error);
      return [];
    }
  }

  // Sync host contact information to all their places
  static async syncHostContactToPlaces(userId: string, contactInfo: { phone_number?: string; whatsapp_number?: string }): Promise<void> {
    console.log('🔄 Syncing host contact info to all places for user:', userId);
    
    try {
      const updateData: any = {};
      
      if (contactInfo.phone_number !== undefined) {
        updateData.contact_phone = contactInfo.phone_number;
      }
      
      if (contactInfo.whatsapp_number !== undefined) {
        updateData.whatsapp_number = contactInfo.whatsapp_number;
      }

      if (Object.keys(updateData).length === 0) {
        console.log('ℹ️ No contact info to sync');
        return;
      }

      const { error } = await supabase
        .from('places')
        .update(updateData)
        .eq('owner_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error syncing contact info to places:', error);
        throw error;
      }

      console.log('✅ Host contact info synced to all places successfully');
    } catch (error) {
      console.error('❌ Error in syncHostContactToPlaces:', error);
      throw error;
    }
  }

  // Toggle visibility of all user's places (for login/logout)
  static async toggleUserPlacesVisibility(userId: string, isVisible: boolean): Promise<void> {
    console.log(`${isVisible ? '👁️' : '🙈'} ${isVisible ? 'Showing' : 'Hiding'} user places for: ${userId}`);
    
    try {
      // STEP 1: Update places directly by user ID
      let { data: updatedPlaces, error } = await supabase
        .from('places')
        .update({ 
          is_active: isVisible,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', userId)
        .select('id');

      if (error) {
        console.error('❌ Error toggling places visibility:', error);
        throw error;
      }

      const directUpdateCount = updatedPlaces?.length || 0;
      console.log(`📊 Updated ${directUpdateCount} places directly by user ID`);

      // STEP 2: If showing places (login) and no places found, restore ownership by phone number
      if (isVisible && directUpdateCount === 0) {
        console.log('🔍 No places found for user ID, checking for places by phone number...');
        
        // Get user's phone number from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('user_id', userId)
          .single();

        if (profileData?.phone_number) {
          console.log('📱 Found phone number:', profileData.phone_number);
          console.log('🔄 RESTORING OWNERSHIP: Same phone number = Same data');
          
          // Find all user_ids that have used this phone number
          const { data: usersWithPhone, error: usersError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('phone_number', profileData.phone_number);

          if (!usersError && usersWithPhone && usersWithPhone.length > 0) {
            const userIds = usersWithPhone.map(u => u.user_id);
            console.log('📱 Found user IDs with this phone:', userIds);
            
            // Restore ownership: Update places to current session user_id
            const { data: phoneBasedUpdate, error: phoneError } = await supabase
              .from('places')
              .update({ 
                owner_id: userId,  // Current session user_id
                is_active: isVisible,
                updated_at: new Date().toISOString()
              })
              .in('owner_id', userIds)
              .select('id, title');

            if (!phoneError && phoneBasedUpdate) {
              console.log(`✅ SAME PHONE NUMBER = SAME DATA: Restored ${phoneBasedUpdate.length} places`);
              phoneBasedUpdate.forEach(place => {
                console.log(`📍 Restored place: ${place.title} (${place.id})`);
              });
            } else if (phoneError) {
              console.error('❌ Error restoring places by phone number:', phoneError);
            }
          }
        }
      }

      console.log(`✅ Places visibility updated: ${isVisible ? 'VISIBLE' : 'HIDDEN'} for user ${userId}`);
      
    } catch (error) {
      console.error('❌ Error in toggleUserPlacesVisibility:', error);
      throw error;
    }
  }
}
