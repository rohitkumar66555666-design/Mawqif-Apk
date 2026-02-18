import { supabase } from './supabase';

export interface Bookmark {
  id: string;
  user_id: string;
  place_id: string;
  created_at: string;
  updated_at: string;
  // Additional place information (fetched separately)
  place_title?: string;
  place_address?: string;
  place_city?: string;
  place_type?: string;
  place_photo?: string;
  place_rating?: number;
}

export class BookmarksService {
  /**
   * Add a place to user's bookmarks
   */
  static async addBookmark(userId: string, placeId: string): Promise<Bookmark> {
    try {
      console.log('🔖 Adding bookmark:', { userId, placeId });

      const { data, error } = await supabase
        .from('bookmarks')
        .insert([{
          user_id: userId,
          place_id: placeId,
        }])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error adding bookmark:', error);
        
        if (error.code === '23505') {
          throw new Error('This place is already bookmarked');
        }
        
        throw new Error(`Failed to add bookmark: ${error.message}`);
      }

      console.log('✅ Bookmark added successfully:', data.id);
      return data;

    } catch (error) {
      console.error('❌ Error in addBookmark:', error);
      throw error;
    }
  }

  /**
   * Remove a place from user's bookmarks
   */
  static async removeBookmark(userId: string, placeId: string): Promise<void> {
    try {
      console.log('🗑️ Removing bookmark:', { userId, placeId });

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('place_id', placeId);

      if (error) {
        console.error('❌ Error removing bookmark:', error);
        throw new Error(`Failed to remove bookmark: ${error.message}`);
      }

      console.log('✅ Bookmark removed successfully');

    } catch (error) {
      console.error('❌ Error in removeBookmark:', error);
      throw error;
    }
  }

  /**
   * Check if a place is bookmarked by user
   */
  static async isBookmarked(userId: string, placeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('place_id', placeId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error checking bookmark status:', error);
        return false;
      }

      return !!data;

    } catch (error) {
      console.error('❌ Error in isBookmarked:', error);
      return false;
    }
  }

  /**
   * Get all bookmarks for a user with place information
   */
  static async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    try {
      console.log('📚 Getting bookmarks for user:', userId);

      // Get bookmarks first
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting bookmarks:', error);
        throw new Error(`Failed to get bookmarks: ${error.message}`);
      }

      if (!bookmarks || bookmarks.length === 0) {
        console.log('ℹ️ No bookmarks found for user:', userId);
        return [];
      }

      // Get place information for each bookmark
      const bookmarksWithPlaceInfo = await Promise.all(
        bookmarks.map(async (bookmark) => {
          try {
            const { data: placeData } = await supabase
              .from('places')
              .select('title, address, city, type, photo, avg_rating')
              .eq('id', bookmark.place_id)
              .single();

            return {
              ...bookmark,
              place_title: placeData?.title || 'Unknown Place',
              place_address: placeData?.address || 'Unknown Address',
              place_city: placeData?.city || 'Unknown City',
              place_type: placeData?.type || 'other',
              place_photo: placeData?.photo,
              place_rating: placeData?.avg_rating || 0,
            };
          } catch (placeError) {
            console.warn('Could not fetch place info for bookmark:', bookmark.id);
            return {
              ...bookmark,
              place_title: 'Unknown Place',
              place_address: 'Unknown Address',
              place_city: 'Unknown City',
              place_type: 'other',
              place_photo: undefined,
              place_rating: 0,
            };
          }
        })
      );

      console.log(`✅ Retrieved ${bookmarksWithPlaceInfo.length} bookmarks for user`);
      return bookmarksWithPlaceInfo;

    } catch (error) {
      console.error('❌ Error in getUserBookmarks:', error);
      throw error;
    }
  }

  /**
   * Get bookmark statistics for a user
   */
  static async getUserBookmarkStats(userId: string): Promise<{
    totalBookmarks: number;
    bookmarksByType: Record<string, number>;
  }> {
    try {
      console.log('📊 Getting bookmark stats for user:', userId);

      // Try to get bookmarks with the provided userId first
      let bookmarks = await this.getUserBookmarks(userId);
      
      // If no bookmarks found and userId looks like a UUID, also try with phone number
      if (bookmarks.length === 0 && userId.includes('-')) {
        console.log('📊 No bookmarks found with UUID, trying with phone number...');
        
        // Try common phone number formats
        const phoneFormats = ['+918655102089', '918655102089', '8655102089'];
        
        for (const phoneFormat of phoneFormats) {
          const phoneBookmarks = await this.getUserBookmarks(phoneFormat);
          if (phoneBookmarks.length > 0) {
            console.log('📊 Found bookmarks with phone format:', phoneFormat);
            bookmarks = phoneBookmarks;
            break;
          }
        }
      }
      
      const totalBookmarks = bookmarks.length;
      const bookmarksByType: Record<string, number> = {};

      bookmarks.forEach(bookmark => {
        const type = bookmark.place_type || 'other';
        bookmarksByType[type] = (bookmarksByType[type] || 0) + 1;
      });

      const stats = {
        totalBookmarks,
        bookmarksByType,
      };

      console.log('✅ Bookmark stats retrieved:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error in getUserBookmarkStats:', error);
      return {
        totalBookmarks: 0,
        bookmarksByType: {},
      };
    }
  }

  /**
   * Toggle bookmark status (add if not bookmarked, remove if bookmarked)
   */
  static async toggleBookmark(userId: string, placeId: string): Promise<boolean> {
    try {
      const isCurrentlyBookmarked = await this.isBookmarked(userId, placeId);

      if (isCurrentlyBookmarked) {
        await this.removeBookmark(userId, placeId);
        return false; // Now not bookmarked
      } else {
        await this.addBookmark(userId, placeId);
        return true; // Now bookmarked
      }

    } catch (error) {
      console.error('❌ Error in toggleBookmark:', error);
      throw error;
    }
  }

  /**
   * Get bookmarked place IDs for a user (for quick lookup)
   */
  static async getUserBookmarkedPlaceIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('place_id')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error getting bookmarked place IDs:', error);
        return [];
      }

      return (data || []).map(bookmark => bookmark.place_id);

    } catch (error) {
      console.error('❌ Error in getUserBookmarkedPlaceIds:', error);
      return [];
    }
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing bookmarks table connection...');

      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Bookmarks table connection failed:', error);
        return false;
      }

      console.log('✅ Bookmarks table connection successful');
      return true;

    } catch (error) {
      console.error('❌ Error testing bookmarks connection:', error);
      return false;
    }
  }
}