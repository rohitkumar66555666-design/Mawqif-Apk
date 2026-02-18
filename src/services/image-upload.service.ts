import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export class ImageUploadService {
  /**
   * Test Supabase Storage configuration for prayer place images
   */
  static async testStorageConfiguration(): Promise<{
    bucketExists: boolean;
    bucketPublic: boolean;
    canUpload: boolean;
    canRead: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let bucketExists = false;
    let bucketPublic = false;
    let canUpload = false;
    let canRead = false;

    try {
      console.log('🕌 Testing Supabase Storage for prayer place images...');

      // Test 1: Try to list files (this tests if bucket exists and is accessible)
      const { data: files, error: listError } = await supabase.storage
        .from('place-images')
        .list('', { limit: 1 });

      if (listError) {
        console.error('❌ List files error:', listError);
        if (listError.message.includes('not found') || listError.message.includes('does not exist')) {
          issues.push('❌ CRITICAL: Bucket "place-images" does not exist in Supabase');
          issues.push('🔧 FIX: Run CREATE_STORAGE_BUCKET_COMPLETE.sql in Supabase Dashboard');
        } else if (listError.message.includes('permission') || listError.message.includes('access')) {
          issues.push('❌ CRITICAL: No permission to access bucket');
          issues.push('🔧 FIX: Check RLS policies and bucket permissions');
        } else {
          issues.push(`❌ Cannot access bucket: ${listError.message}`);
        }
      } else {
        bucketExists = true;
        canRead = true;
        console.log('✅ Bucket exists and is accessible for prayer place images');
      }

      // Test 2: Check public URL format (tests if bucket is public)
      if (bucketExists) {
        const testUrl = supabase.storage
          .from('place-images')
          .getPublicUrl('test-prayer-place.jpg');

        console.log('🔗 Test public URL for prayer place:', testUrl.data.publicUrl);
        
        if (testUrl.data.publicUrl && testUrl.data.publicUrl.includes('/public/')) {
          bucketPublic = true;
          console.log('✅ Bucket is public - prayer place images will be visible to users');
        } else {
          bucketPublic = false;
          issues.push('❌ CRITICAL: Bucket is NOT public - users cannot see prayer place images');
          issues.push('🔧 FIX: UPDATE storage.buckets SET public = true WHERE id = \'place-images\';');
        }
      }

      // Test 3: Test upload capability (try a small test upload)
      if (bucketExists) {
        try {
          const testData = new Uint8Array([137, 80, 78, 71]); // PNG header
          const testFileName = `test-upload-${Date.now()}.png`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('place-images')
            .upload(testFileName, testData, {
              contentType: 'image/png',
              upsert: true
            });

          if (uploadError) {
            console.error('❌ Test upload failed:', uploadError);
            issues.push(`❌ Cannot upload to bucket: ${uploadError.message}`);
            if (uploadError.message.includes('permission') || uploadError.message.includes('policy')) {
              issues.push('🔧 FIX: Check RLS policies for authenticated uploads');
            }
          } else {
            canUpload = true;
            console.log('✅ Test upload successful - prayer place images can be uploaded');
            
            // Clean up test file
            await supabase.storage
              .from('place-images')
              .remove([testFileName]);
          }
        } catch (uploadTestError) {
          console.error('❌ Upload test error:', uploadTestError);
          issues.push('❌ Upload test failed - check authentication and policies');
        }
      }

      // Summary
      console.log('📊 Prayer Place Image Storage Summary:');
      console.log('  - Bucket exists:', bucketExists);
      console.log('  - Bucket public:', bucketPublic);
      console.log('  - Can upload:', canUpload);
      console.log('  - Can read:', canRead);
      console.log('  - Issues:', issues.length);

      if (issues.length === 0) {
        console.log('✅ 🕌 Prayer place image storage is properly configured!');
      } else {
        console.error('❌ 🕌 Prayer place image storage has configuration issues:');
        issues.forEach(issue => console.error(`  ${issue}`));
      }

      return {
        bucketExists,
        bucketPublic,
        canUpload,
        canRead,
        issues,
      };

    } catch (error) {
      console.error('❌ Error testing prayer place image storage:', error);
      issues.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      issues.push('🔧 Check Supabase project status and network connection');
      
      return {
        bucketExists: false,
        bucketPublic: false,
        canUpload: false,
        canRead: false,
        issues,
      };
    }
  }

  /**
   * Upload image to Supabase Storage and return public URL
   */
  static async uploadPlaceImage(imageUri: string, placeId?: string): Promise<string> {
    try {
      console.log('📤 Starting enhanced image upload for URI:', imageUri);
      
      // Validate input URI
      if (!imageUri || !imageUri.trim()) {
        throw new Error('Image URI is required');
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `place_${placeId || randomId}_${timestamp}.jpg`;
      
      console.log('📝 Generated filename:', fileName);
      
      // ENHANCED: Try multiple methods to get image data
      let base64: string;
      const storedImageData = (global as any).selectedImageData;
      
      if (storedImageData && storedImageData.base64) {
        console.log('✅ Method 1: Using base64 data from image picker');
        base64 = storedImageData.base64;
        console.log('📖 Base64 data length:', base64.length);
      } else {
        console.log('⚠️ Method 2: Trying to read file directly...');
        
        // Enhanced file reading with better error handling
        try {
          // Check if file exists first
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          if (!fileInfo.exists) {
            throw new Error('Image file does not exist at the specified path');
          }
          
          console.log('📁 File info:', fileInfo);
          
          // Try reading as base64
          base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
          });
          
          if (!base64 || base64.length === 0) {
            throw new Error('File read returned empty data');
          }
          
          console.log('✅ Successfully read image file from URI, length:', base64.length);
        } catch (readError) {
          console.error('❌ Error reading file:', readError);
          throw new Error('Failed to read image file. Selected image may not be accessible. Please try:\n• Selecting a different image\n• Using a recently taken photo\n• Restarting the app and trying again');
        }
      }
      
      if (!base64 || base64.length === 0) {
        throw new Error('Image file is empty or corrupted. Please select a different image.');
      }
      
      // Validate base64 data
      if (base64.length < 100) {
        throw new Error('Image data is too small. Please select a valid image file.');
      }
      
      console.log('📖 Final base64 data length:', base64.length);
      
      // Convert base64 to ArrayBuffer with better error handling
      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = decode(base64);
        console.log('✅ Base64 decoded to ArrayBuffer, size:', arrayBuffer.byteLength);
      } catch (decodeError) {
        console.error('❌ Error decoding base64:', decodeError);
        throw new Error('Image format is corrupted or not supported. Please use JPG or PNG format.');
      }
      
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Failed to process image data.');
      }
      
      // Validate file size (max 10MB)
      if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
        throw new Error('Image is too large (max 10MB). Please select a smaller image.');
      }
      
      console.log('🔄 Uploading to Supabase Storage...');
      
      // Upload to Supabase Storage with enhanced error handling
      const { data, error } = await supabase.storage
        .from('place-images')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
          duplex: 'half' // For better compatibility
        });
      
      if (error) {
        console.error('❌ Supabase upload error:', error);
        
        // Provide specific error messages
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          throw new Error('Storage bucket not configured. Please run the database setup script first.');
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          throw new Error('Upload permission denied. Please check storage policies.');
        } else if (error.message.includes('size') || error.message.includes('limit')) {
          throw new Error('Image is too large for upload. Please select a smaller image.');
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }
      
      if (!data || !data.path) {
        throw new Error('Upload succeeded but no file path returned from Supabase');
      }
      
      console.log('✅ Upload successful to path:', data.path);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('place-images')
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;
      console.log('🌐 Public URL generated:', publicUrl);
      
      // Clean up stored image data
      delete (global as any).selectedImageData;
      
      // Validate the public URL format
      if (!publicUrl || !publicUrl.includes('supabase.co')) {
        throw new Error('Invalid public URL format returned from Supabase');
      }
      
      // Test the URL is accessible
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.warn('⚠️ Public URL may not be accessible:', response.status);
        } else {
          console.log('✅ Public URL is accessible');
        }
      } catch (urlTestError) {
        console.warn('⚠️ Could not test public URL accessibility:', urlTestError);
      }
      
      console.log('✅ Image upload completed successfully');
      return publicUrl;
      
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      
      // Clean up stored image data on error
      delete (global as any).selectedImageData;
      
      throw error;
    }
  }
  
  /**
   * Upload multiple images to Supabase Storage for a place
   * Optimized for multiple image uploads with better error handling
   */
  static async uploadMultiplePlaceImages(images: Array<{uri: string, id: number}>): Promise<Array<{id: number, url: string, is_primary: boolean, uploaded_at: string}>> {
    try {
      console.log(`📤 Starting multiple image upload for ${images.length} images...`);
      
      const uploadedImages = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`📱 Uploading image ${i + 1}/${images.length}:`, image.uri);
        
        try {
          const publicImageUrl = await this.uploadPlaceImage(image.uri);
          
          // Validate that we got a proper Supabase URL
          if (publicImageUrl && publicImageUrl.includes('supabase.co') && publicImageUrl.includes('/public/')) {
            uploadedImages.push({
              id: image.id,
              url: publicImageUrl,
              is_primary: i === 0, // First image is primary
              uploaded_at: new Date().toISOString(),
            });
            console.log(`✅ Image ${i + 1} uploaded successfully:`, publicImageUrl);
          } else {
            console.error('❌ Invalid image URL returned:', publicImageUrl);
            throw new Error(`Invalid image URL format for image ${i + 1}`);
          }
        } catch (imageError) {
          console.error(`❌ Failed to upload image ${i + 1}:`, imageError);
          throw new Error(`Failed to upload image ${i + 1}: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
        }
      }
      
      console.log(`✅ All ${uploadedImages.length} images uploaded successfully`);
      return uploadedImages;
      
    } catch (error) {
      console.error('❌ Error uploading multiple images:', error);
      throw error;
    }
  }
  static async deletePlaceImage(imageUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      console.log('🗑️ Deleting image:', fileName);
      
      const { error } = await supabase.storage
        .from('place-images')
        .remove([fileName]);
      
      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }
      
      console.log('✅ Image deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
  }
  
  /**
   * Check if Supabase Storage bucket exists and is accessible
   */
  static async testStorageConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Supabase Storage connection...');
      
      const { data, error } = await supabase.storage
        .from('place-images')
        .list('', { limit: 1 });
      
      if (error) {
        console.error('❌ Storage test failed:', error);
        return false;
      }
      
      console.log('✅ Storage connection successful');
      return true;
      
    } catch (error) {
      console.error('❌ Storage test error:', error);
      return false;
    }
  }

  /**
   * Upload profile image to Supabase Storage and return public URL
   */
  static async uploadProfileImage(imageUri: string, userId?: string): Promise<string> {
    try {
      console.log('📤 Starting profile image upload for URI:', imageUri);
      
      // Validate input URI
      if (!imageUri || !imageUri.trim()) {
        throw new Error('Image URI is required');
      }
      
      // Generate unique filename for profile
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `profile_${userId || randomId}_${timestamp}.jpg`;
      
      console.log('📝 Generated profile filename:', fileName);
      
      // Get base64 data from stored image data (set by image picker)
      let base64: string;
      const storedImageData = (global as any).selectedImageData;
      
      if (storedImageData && storedImageData.base64) {
        console.log('✅ Using base64 data from image picker');
        base64 = storedImageData.base64;
      } else {
        console.log('⚠️ No stored base64 data, trying to read file directly...');
        
        try {
          // Check if file exists first
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          if (!fileInfo.exists) {
            throw new Error('Image file does not exist at the specified path');
          }
          
          // Try reading as base64
          base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
          });
          
          if (!base64 || base64.length === 0) {
            throw new Error('File read returned empty data');
          }
          
          console.log('✅ Successfully read profile image file from URI');
        } catch (readError) {
          console.error('❌ Error reading profile image file:', readError);
          throw new Error('Failed to read image file. Please try selecting a different image.');
        }
      }
      
      if (!base64 || base64.length === 0) {
        throw new Error('Image file is empty or corrupted. Please select a different image.');
      }
      
      // Convert base64 to ArrayBuffer
      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = decode(base64);
        console.log('✅ Profile image base64 decoded to ArrayBuffer, size:', arrayBuffer.byteLength);
      } catch (decodeError) {
        console.error('❌ Error decoding profile image base64:', decodeError);
        throw new Error('Image format is corrupted or not supported. Please use JPG or PNG format.');
      }
      
      // Validate file size (max 5MB for profile images)
      if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
        throw new Error('Profile image is too large (max 5MB). Please select a smaller image.');
      }
      
      console.log('🔄 Uploading profile image to Supabase Storage...');
      
      // Upload to Supabase Storage in profiles subfolder
      const { data, error } = await supabase.storage
        .from('place-images')
        .upload(`profiles/${fileName}`, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });
      
      if (error) {
        console.error('❌ Profile image Supabase upload error:', error);
        
        // Provide specific error messages
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          throw new Error('Storage bucket not configured. Please run the database setup script first.');
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          throw new Error('Upload permission denied. Please check storage policies.');
        } else {
          throw new Error(`Profile image upload failed: ${error.message}`);
        }
      }
      
      if (!data || !data.path) {
        throw new Error('Profile image upload succeeded but no file path returned');
      }
      
      console.log('✅ Profile image upload successful to path:', data.path);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('place-images')
        .getPublicUrl(`profiles/${fileName}`);
      
      const publicUrl = urlData.publicUrl;
      console.log('🌐 Profile image public URL generated:', publicUrl);
      
      // Clean up stored image data
      delete (global as any).selectedImageData;
      
      // Validate the public URL format
      if (!publicUrl || !publicUrl.includes('supabase.co')) {
        throw new Error('Invalid public URL format returned from Supabase');
      }
      
      console.log('✅ Profile image upload completed successfully');
      return publicUrl;
      
    } catch (error) {
      console.error('❌ Error uploading profile image:', error);
      
      // Clean up stored image data on error
      delete (global as any).selectedImageData;
      
      throw error;
    }
  }
}