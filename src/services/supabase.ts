import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase credentials from app.json extra configuration
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://sqsawueagugzcgpbwsyi.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxc2F3dWVhZ3VnemNncGJ3c3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTM2NTEsImV4cCI6MjA3ODU4OTY1MX0.vv64OV3IwRc7rggyL6hKBYp9zjtXPV0I5nscR4xImXo';

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
