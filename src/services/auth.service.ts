// ============================================
// AUTHENTICATION SERVICE
// Handles all authentication related operations
// ============================================

import { supabase } from './supabase';

// Interface for user data structure
export interface User {
  id: string;
  phone_number: string;
  name?: string;
  email?: string;
  is_verified: boolean;
  created_at: string;
}

// Interface for OTP verification data
export interface OTPVerification {
  phone_number: string;
  otp_code: string;
  expires_at: string;
}

class AuthService {
  
  // ============================================
  // SEND OTP TO PHONE NUMBER
  // Generates 4-digit OTP and stores in database
  // ============================================
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📱 Sending OTP to:', phoneNumber);
      
      // Generate 4-digit OTP
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Set expiry time (5 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      
      // Store OTP in database
      const { error } = await supabase
        .from('otp_verifications')
        .insert({
          phone_number: phoneNumber,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
          is_used: false
        });
      
      if (error) {
        console.error('❌ Error storing OTP:', error);
        return { success: false, message: 'Failed to send OTP' };
      }
      
      // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
      // For now, we'll log the OTP for testing
      console.log('🔐 Generated OTP:', otpCode);
      console.log('⏰ Expires at:', expiresAt);
      
      return { 
        success: true, 
        message: `OTP sent to ${phoneNumber}. Code: ${otpCode}` // Remove this in production
      };
      
    } catch (error) {
      console.error('❌ Error in sendOTP:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }
  
  // ============================================
  // VERIFY OTP AND LOGIN USER (PROFILES TABLE ONLY)
  // Checks OTP validity - no longer creates users table records
  // ============================================
  async verifyOTP(phoneNumber: string, otpCode: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      console.log('🔐 Verifying OTP for:', phoneNumber);
      
      // Find valid OTP
      const { data: otpData, error: otpError } = await supabase
        .from('otp_verifications')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('otp_code', otpCode)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (otpError || !otpData || otpData.length === 0) {
        console.error('❌ Invalid or expired OTP');
        return { success: false, message: 'Invalid or expired OTP' };
      }
      
      // Mark OTP as used
      await supabase
        .from('otp_verifications')
        .update({ is_used: true })
        .eq('id', otpData[0].id);
      
      // DISABLED: No longer using users table to avoid constraint violations
      // Authentication is handled by the profiles table in user-profile.service.ts
      console.log('✅ OTP verified successfully - user management handled by profiles table');
      
      // Return a minimal user object for compatibility
      const userData = {
        id: `dev-${phoneNumber.replace(/\D/g, '')}`, // Generate consistent ID
        phone_number: phoneNumber,
        is_verified: true,
        created_at: new Date().toISOString()
      };
      
      return { 
        success: true, 
        user: userData as User, 
        message: 'Login successful' 
      };
      
    } catch (error) {
      console.error('❌ Error in verifyOTP:', error);
      return { success: false, message: 'Verification failed' };
    }
  }
  
  // ============================================
  // UPDATE USER PROFILE (DISABLED - USING PROFILES TABLE)
  // Updates are handled by user-profile.service.ts
  // ============================================
  async updateProfile(userId: string, name: string, email?: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      console.log('👤 Profile updates disabled - using profiles table only');
      
      // DISABLED: No longer using users table to avoid constraint violations
      // Profile updates are handled by UserProfileService
      
      return { 
        success: true, 
        message: 'Profile updates handled by profiles table' 
      };
      
    } catch (error) {
      console.error('❌ Error in updateProfile:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  }
  
  // ============================================
  // GET USER BY ID (DISABLED - USING PROFILES TABLE)
  // User data retrieval handled by user-profile.service.ts
  // ============================================
  async getUser(userId: string): Promise<User | null> {
    try {
      console.log('👤 User retrieval disabled - using profiles table only');
      
      // DISABLED: No longer using users table to avoid constraint violations
      // User data is retrieved from profiles table by UserProfileService
      
      return null;
    } catch (error) {
      console.error('❌ Error in getUser:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();