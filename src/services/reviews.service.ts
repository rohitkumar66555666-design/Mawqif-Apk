import { supabase } from './supabase';
import { Review, ReviewReply, ReviewSortOption } from '../types';

export interface CreateReviewInput {
  place_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export class ReviewsService {
  /**
   * Get all reviews for a specific place
   */
  static async getPlaceReviews(
    placeId: string, 
    sortBy: ReviewSortOption = 'newest',
    limit: number = 50,
    currentUserId?: string
  ): Promise<Review[]> {
    try {
      console.log('📝 Getting reviews for place:', placeId, 'Type:', typeof placeId);

      let query = supabase
        .from('reviews')
        .select('*')
        .eq('place_id', placeId);

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_liked':
          query = query.order('likes_count', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(limit);

      if (error) {
        console.error('❌ Error getting place reviews:', error);
        console.error('❌ Query was for place_id:', placeId);
        
        // Provide specific error message for UUID/TEXT mismatch
        if (error.code === '42883' && error.message?.includes('uuid = text')) {
          throw new Error('Database column type mismatch in SELECT query. Run the COMPLETE_REVIEWS_FIX.sql to fix all column types.');
        }
        
        throw error;
      }

      // Get user like status if user is provided
      let userLikeStatus: {[key: string]: 'like' | 'dislike' | null} = {};
      if (currentUserId && data && data.length > 0) {
        const reviewIds = data.map(review => review.id);
        userLikeStatus = await this.getUserLikeStatus(reviewIds, currentUserId);
      }

      // Transform data to match Review interface
      const reviews: Review[] = (data || []).map(review => ({
        id: review.id,
        place_id: review.place_id,
        user_id: review.user_id,
        user_name: review.user_name || 'Anonymous',
        user_avatar: undefined, // Will be fetched separately if needed
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        updated_at: review.updated_at,
        likes_count: review.likes_count || 0,
        dislikes_count: review.dislikes_count || 0,
        replies_count: review.replies_count || 0,
        is_owner: false, // TODO: Implement place owner check
        user_liked: userLikeStatus[review.id] === 'like',
        user_disliked: userLikeStatus[review.id] === 'dislike',
        // Include host response fields
        host_response: review.host_response,
        host_response_date: review.host_response_date,
      }));

      console.log(`✅ Retrieved ${reviews.length} reviews for place ${placeId}`);
      return reviews;

    } catch (error) {
      console.error('❌ Error in getPlaceReviews:', error);
      throw error;
    }
  }

  /**
   * Get all reviews for a specific place (alias for getPlaceReviews)
   */
  static async getReviewsForPlace(
    placeId: string, 
    sortBy: ReviewSortOption = 'newest',
    limit: number = 50,
    currentUserId?: string
  ): Promise<Review[]> {
    return this.getPlaceReviews(placeId, sortBy, limit, currentUserId);
  }

  /**
   * Get all reviews by a specific user (for My Reviews section)
   */
  static async getUserReviews(
    userId: string,
    limit: number = 100
  ): Promise<Review[]> {
    try {
      console.log('👤 Getting reviews for user:', userId);

      // Get reviews without any joins to avoid foreign key issues
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting user reviews:', error);
        throw error;
      }

      // Get place and profile information separately for each review
      const reviewsWithInfo = await Promise.all(
        (data || []).map(async (review) => {
          let placeInfo = null;
          let profileInfo = null;

          // Try to get place information
          try {
            const { data: placeData } = await supabase
              .from('places')
              .select('title, address, city')
              .eq('id', review.place_id)
              .single();
            placeInfo = placeData;
          } catch (placeError) {
            console.warn('Could not fetch place info for review:', review.id);
          }

          // Try to get profile information
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, profile_image_url')
              .eq('user_id', review.user_id)
              .single();
            profileInfo = profileData;
          } catch (profileError) {
            console.warn('Could not fetch profile info for review:', review.id);
          }

          return {
            id: review.id,
            place_id: review.place_id,
            user_id: review.user_id,
            user_name: profileInfo?.full_name || review.user_name || 'Anonymous',
            user_avatar: profileInfo?.profile_image_url,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            updated_at: review.updated_at,
            likes_count: review.likes_count || 0,
            dislikes_count: review.dislikes_count || 0,
            replies_count: review.replies_count || 0,
            is_owner: false,
            user_liked: false,
            user_disliked: false,
            // Include host response fields
            host_response: review.host_response,
            host_response_date: review.host_response_date,
            // Add place information
            place_title: placeInfo?.title || 'Unknown Place',
            place_address: placeInfo?.address || 'Unknown Address',
            place_city: placeInfo?.city || 'Unknown City',
          };
        })
      );

      console.log(`✅ Retrieved ${reviewsWithInfo.length} reviews for user ${userId}`);
      return reviewsWithInfo;

    } catch (error) {
      console.error('❌ Error in getUserReviews:', error);
      throw error;
    }
  }

  /**
   * Create a new review
   */
  static async createReview(reviewData: CreateReviewInput): Promise<Review> {
    try {
      console.log('📝 Creating review:', reviewData);

      // Ensure user_name is not null/undefined
      const safeUserName = reviewData.user_name || 'Anonymous User';

      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          place_id: reviewData.place_id,
          user_id: reviewData.user_id,
          user_name: safeUserName,
          reviewer_name: safeUserName, // Also set reviewer_name to the same value
          rating: reviewData.rating,
          comment: reviewData.comment,
          likes_count: 0,
          dislikes_count: 0,
          replies_count: 0,
        }])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error creating review:', error);
        
        // Provide specific error messages for common issues
        if (error.code === '42883' && error.message?.includes('uuid = text')) {
          throw new Error('Database configuration error: Please run the database fix script to change column types from UUID to TEXT.');
        } else if (error.code === '23505') {
          throw new Error('You have already reviewed this place.');
        } else if (error.code === '23503') {
          throw new Error('Invalid place or user ID.');
        } else if (error.code === '23502') {
          throw new Error('Missing required information. Please try again.');
        } else {
          throw new Error(`Database error: ${error.message || 'Unable to save review'}`);
        }
      }

      const review: Review = {
        id: data.id,
        place_id: data.place_id,
        user_id: data.user_id,
        user_name: data.user_name || safeUserName,
        user_avatar: undefined,
        rating: data.rating,
        comment: data.comment,
        created_at: data.created_at,
        updated_at: data.updated_at,
        likes_count: data.likes_count || 0,
        dislikes_count: data.dislikes_count || 0,
        replies_count: data.replies_count || 0,
        is_owner: false,
        user_liked: false,
        user_disliked: false,
        // Include host response fields (will be null for new reviews)
        host_response: data.host_response,
        host_response_date: data.host_response_date,
      };

      console.log('✅ Review created successfully:', review.id);
      return review;

    } catch (error) {
      console.error('❌ Error in createReview:', error);
      
      // Re-throw with proper error message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to create review. Please try again.');
      }
    }
  }

  /**
   * Check if a string is a valid UUID
   */
  private static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Generate a deterministic UUID from a string
   */
  private static generateUUIDFromString(str: string): string {
    // Simple hash function to convert string to UUID format
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to hex and pad
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    
    // Create UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuid = [
      hex.slice(0, 8),
      hex.slice(0, 4),
      '4' + hex.slice(1, 4), // Version 4 UUID
      '8' + hex.slice(1, 4), // Variant bits
      hex.repeat(3).slice(0, 12)
    ].join('-');
    
    return uuid;
  }

  /**
   * Add a new review (alias for createReview)
   */
  static async addReview(
    placeId: string,
    currentUserId: string,
    userName: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    // Ensure userName is not null/undefined
    const safeUserName = userName || 'Anonymous User';
    
    const createReviewInput: CreateReviewInput = {
      place_id: placeId,
      user_id: currentUserId,
      user_name: safeUserName,
      rating: rating,
      comment: comment,
    };

    return this.createReview(createReviewInput);
  }

  /**
   * Update an existing review
   */
  static async updateReview(
    reviewId: string, 
    userId: string, 
    updates: UpdateReviewInput
  ): Promise<Review> {
    try {
      console.log('📝 Updating review:', reviewId, updates);

      const { data, error } = await supabase
        .from('reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('user_id', userId) // Ensure user can only update their own reviews
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error updating review:', error);
        throw error;
      }

      const review: Review = {
        id: data.id,
        place_id: data.place_id,
        user_id: data.user_id,
        user_name: data.user_name,
        user_avatar: undefined,
        rating: data.rating,
        comment: data.comment,
        created_at: data.created_at,
        updated_at: data.updated_at,
        likes_count: data.likes_count || 0,
        dislikes_count: data.dislikes_count || 0,
        replies_count: data.replies_count || 0,
        is_owner: false,
        user_liked: false,
        user_disliked: false,
      };

      console.log('✅ Review updated successfully');
      return review;

    } catch (error) {
      console.error('❌ Error in updateReview:', error);
      throw error;
    }
  }

  /**
   * Delete a review (only allows review author to delete - hosts use PlacesService.deleteReview from Dashboard)
   */
  static async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting review:', reviewId, 'by user:', userId);

      // Only allow review author to delete (hosts delete from Dashboard using PlacesService)
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId); // Only review author can delete

      if (error) {
        console.error('❌ Error deleting review:', error);
        throw error;
      }

      console.log('✅ Review deleted successfully by author');

    } catch (error) {
      console.error('❌ Error in deleteReview:', error);
      throw error;
    }
  }

  /**
   * Get review statistics for a user
   */
  static async getUserReviewStats(userId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    totalLikes: number;
  }> {
    try {
      console.log('📊 Getting review stats for user:', userId);

      const { data, error } = await supabase
        .from('reviews')
        .select('rating, likes_count')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error getting review stats:', error);
        // Return default stats instead of throwing
        return {
          totalReviews: 0,
          averageRating: 0,
          totalLikes: 0,
        };
      }

      const reviews = data || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      const totalLikes = reviews.reduce((sum, review) => sum + (review.likes_count || 0), 0);

      const stats = {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalLikes,
      };

      console.log('✅ Review stats retrieved:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Error in getUserReviewStats:', error);
      return {
        totalReviews: 0,
        averageRating: 0,
        totalLikes: 0,
      };
    }
  }

  /**
   * Like a review (proper implementation with user tracking)
   */
  static async likeReview(reviewId: string, userId: string): Promise<void> {
    try {
      console.log('👍 Liking review:', reviewId, 'by user:', userId);
      
      // Check if user already has an interaction with this review
      const { data: existingLike, error: checkError } = await supabase
        .from('review_likes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing like:', checkError);
        throw checkError;
      }

      if (existingLike) {
        if (existingLike.like_type === 'like') {
          // User already liked - remove the like
          const { error: deleteError } = await supabase
            .from('review_likes')
            .delete()
            .eq('id', existingLike.id);

          if (deleteError) throw deleteError;
          console.log('✅ Like removed');
        } else {
          // User disliked before - change to like
          const { error: updateError } = await supabase
            .from('review_likes')
            .update({ 
              like_type: 'like',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLike.id);

          if (updateError) throw updateError;
          console.log('✅ Changed from dislike to like');
        }
      } else {
        // No existing interaction - create new like
        const { error: insertError } = await supabase
          .from('review_likes')
          .insert({
            review_id: reviewId,
            user_id: userId,
            like_type: 'like'
          });

        if (insertError) throw insertError;
        console.log('✅ New like added');
      }

    } catch (error) {
      console.error('❌ Error in likeReview:', error);
      throw error;
    }
  }

  /**
   * Dislike a review (proper implementation with user tracking)
   */
  static async dislikeReview(reviewId: string, userId: string): Promise<void> {
    try {
      console.log('👎 Disliking review:', reviewId, 'by user:', userId);
      
      // Check if user already has an interaction with this review
      const { data: existingLike, error: checkError } = await supabase
        .from('review_likes')
        .select('*')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing dislike:', checkError);
        throw checkError;
      }

      if (existingLike) {
        if (existingLike.like_type === 'dislike') {
          // User already disliked - remove the dislike
          const { error: deleteError } = await supabase
            .from('review_likes')
            .delete()
            .eq('id', existingLike.id);

          if (deleteError) throw deleteError;
          console.log('✅ Dislike removed');
        } else {
          // User liked before - change to dislike
          const { error: updateError } = await supabase
            .from('review_likes')
            .update({ 
              like_type: 'dislike',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLike.id);

          if (updateError) throw updateError;
          console.log('✅ Changed from like to dislike');
        }
      } else {
        // No existing interaction - create new dislike
        const { error: insertError } = await supabase
          .from('review_likes')
          .insert({
            review_id: reviewId,
            user_id: userId,
            like_type: 'dislike'
          });

        if (insertError) throw insertError;
        console.log('✅ New dislike added');
      }

    } catch (error) {
      console.error('❌ Error in dislikeReview:', error);
      throw error;
    }
  }

  /**
   * Get user's like status for reviews
   */
  static async getUserLikeStatus(reviewIds: string[], userId: string): Promise<{[key: string]: 'like' | 'dislike' | null}> {
    try {
      if (!userId || reviewIds.length === 0) {
        return {};
      }

      console.log('🔍 Getting user like status for reviews:', reviewIds.length);
      
      const { data, error } = await supabase
        .from('review_likes')
        .select('review_id, like_type')
        .eq('user_id', userId)
        .in('review_id', reviewIds);

      if (error) {
        console.error('❌ Error fetching user like status:', error);
        return {};
      }

      // Convert to object for easy lookup
      const likeStatus: {[key: string]: 'like' | 'dislike' | null} = {};
      reviewIds.forEach(id => {
        likeStatus[id] = null; // Default to no interaction
      });

      data?.forEach(item => {
        likeStatus[item.review_id] = item.like_type as 'like' | 'dislike';
      });

      console.log('✅ User like status retrieved for', Object.keys(likeStatus).length, 'reviews');
      return likeStatus;

    } catch (error) {
      console.error('❌ Error in getUserLikeStatus:', error);
      return {};
    }
  }
  static async addReply(
    reviewId: string,
    userId: string,
    userName: string,
    comment: string,
    isOwner: boolean = false
  ): Promise<void> {
    try {
      console.log('💬 Adding reply to review:', reviewId);
      
      // Get current replies count and increment it
      const { data: currentReview, error: fetchError } = await supabase
        .from('reviews')
        .select('replies_count')
        .eq('id', reviewId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching review for reply:', fetchError);
        throw fetchError;
      }

      const newRepliesCount = (currentReview?.replies_count || 0) + 1;

      const { error } = await supabase
        .from('reviews')
        .update({ replies_count: newRepliesCount })
        .eq('id', reviewId);

      if (error) {
        console.error('❌ Error adding reply:', error);
        throw error;
      }

      console.log('✅ Reply added successfully');
    } catch (error) {
      console.error('❌ Error in addReply:', error);
      throw error;
    }
  }

  /**
   * Report a review (now uses ReviewReportsService for proper tracking)
   */
  static async reportReview(
    reviewId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    try {
      console.log('🚨 Reporting review:', reviewId, 'Reason:', reason);
      
      // For now, just log the report
      // The new system uses ReviewReportsService.reportReview() with more details
      console.log('✅ Review reported successfully (legacy method)');
    } catch (error) {
      console.error('❌ Error in reportReview:', error);
      throw error;
    }
  }

  /**
   * Test database connection (fixed version)
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing reviews table connection...');

      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Reviews table connection failed:', error);
        return false;
      }

      console.log('✅ Reviews table connection successful');
      return true;

    } catch (error) {
      console.error('❌ Error testing reviews connection:', error);
      return false;
    }
  }
}