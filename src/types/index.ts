// Core types for Mawqif Prayer Finder MVP

export interface Location {
  latitude: number;
  longitude: number;
}

// Image types for multiple image support
export interface PlaceImage {
  id: number;
  url: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface ImageData {
  id: number;
  uri?: string; // For local images (before upload)
  url?: string; // For uploaded images
  isPrimary?: boolean;
}

// Review and Comment System Types
export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string; // Database uses 'comment' column
  created_at: string;
  updated_at?: string;
  likes_count: number;
  dislikes_count: number;
  replies_count: number;
  is_owner: boolean; // True if this is the place owner
  user_liked?: boolean; // Current user's like status
  user_disliked?: boolean; // Current user's dislike status
  replies?: ReviewReply[];
  // Host response fields
  host_response?: string;
  host_response_date?: string;
}

export interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  comment: string; // Keep as comment for replies since that's what the database has
  created_at: string;
  updated_at?: string;
  likes_count: number;
  dislikes_count: number;
  is_owner: boolean; // True if this is the place owner
  user_liked?: boolean;
  user_disliked?: boolean;
  parent_reply_id?: string; // For nested replies
}

export type ReviewSortOption = 'newest' | 'oldest' | 'most_liked';

export interface Place {
  id: string;
  owner_id?: string; // Optional since we're not using auth yet
  title: string;
  address: string; // Add address field
  type: 'masjid' | 'musalla' | 'home' | 'office' | 'shop' | 'other';
  latitude: number;
  longitude: number;
  city: string;
  capacity?: number;
  amenities?: {
    wuzu: boolean;
    washroom: boolean;
    women_area: boolean;
  };
  photo?: string;
  photos?: string[]; // Multiple photos for carousel
  images?: PlaceImage[]; // New multiple images support
  avg_rating?: number;
  review_count?: number;
  created_at: string;
  distance?: number; // Calculated on client
  
  // New fields for enhanced features
  contact_phone?: string; // Phone number for calling
  whatsapp_number?: string; // WhatsApp number for messaging
  is_open?: boolean; // Open/closed status
  opening_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  
  // Status management fields for hosts
  status_message?: string; // Reason for closure (maintenance, etc.)
  status_updated_at?: string; // When status was last changed
  status_updated_by?: string; // Who changed the status
  
  // Statistics for host dashboard
  total_reviews?: number;
  total_bookmarks?: number;
}

export interface CreatePlaceInput {
  title: string;
  address: string; // Add address field
  type: string;
  latitude: number;
  longitude: number;
  city: string;
  owner_id?: string; // Optional for now (no auth)
  capacity?: number;
  amenities?: {
    wuzu: boolean;
    washroom: boolean;
    women_area: boolean;
  };
  photo?: string;
  photos?: string[]; // Multiple photos
  images?: PlaceImage[]; // New multiple images support
  contact_phone?: string;
  whatsapp_number?: string;
  is_open?: boolean;
  opening_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  PlaceDetail: { placeId: string };
  CacheManagement: undefined;
  Settings: undefined;
  Theme: undefined;
  Language: undefined;
  Login: undefined;
  AuthMode: undefined;
  Dashboard: undefined;
  Profile: undefined;
  MyReviews: undefined;
  Bookmarks: undefined;
  AddPlace: undefined;
  MyPlaces: undefined;
  EditPlace: { placeId: string };
  EditPlaceImages: { placeId: string };
  PhotoManagement: { placeId: string; placeName: string };
};

export type TabParamList = {
  HomeTab: undefined;
  MapTab: undefined;
  AddPlaceTab: undefined;
};

// Error types
export interface AppError {
  code: string;
  message: string;
  userMessage: string;
}
