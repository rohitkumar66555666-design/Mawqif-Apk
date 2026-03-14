import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase credentials from app.json extra configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || ;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ||; 

// Debug logging
console.log('🔧 Supabase Configuration:');
console.log('🔗 URL:', supabaseUrl);
console.log('🔑 Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
console.log('📱 Expo Config Available:', !!Constants.expoConfig);
console.log('🎛️ Extra Config:', Constants.expoConfig?.extra);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection on initialization
console.log('🏗️ Supabase client created successfully');

// Database types
export interface Database {
  public: {
    Tables: {
      places: {
        Row: {
          id: string;
          title: string;
          type: string;
          latitude: number;
          longitude: number;
          city: string;
          capacity: number | null;
          amenities: {
            wuzu: boolean;
            washroom: boolean;
            women_area: boolean;
          };
          photo: string | null;
          created_at: string;
        };
        Insert: {
          title: string;
          type: string;
          latitude: number;
          longitude: number;
          city: string;
          capacity?: number;
          amenities: {
            wuzu: boolean;
            washroom: boolean;
            women_area: boolean;
          };
          photo?: string;
        };
        Update: {
          title?: string;
          type?: string;
          latitude?: number;
          longitude?: number;
          city?: string;
          capacity?: number;
          amenities?: {
            wuzu: boolean;
            washroom: boolean;
            women_area: boolean;
          };
          photo?: string;
        };
      };
    };
  };
}
