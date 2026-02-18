// Image debugging utility for troubleshooting image loading issues

export class ImageDebugger {
  /**
   * Test if an image URL is accessible
   */
  static async testImageUrl(url: string): Promise<{
    accessible: boolean;
    error?: string;
    statusCode?: number;
  }> {
    try {
      console.log('🔍 Testing image URL:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 Image URL test result:', {
        status: response.status,
        ok: response.ok,
        headers: response.headers,
      });
      
      return {
        accessible: response.ok,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('❌ Image URL test failed:', error);
      return {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate image URL format
   */
  static validateImageUrl(url: string | null | undefined): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    if (!url) {
      issues.push('URL is null or undefined');
      return { valid: false, issues };
    }
    
    if (typeof url !== 'string') {
      issues.push('URL is not a string');
      return { valid: false, issues };
    }
    
    if (url.trim() === '') {
      issues.push('URL is empty');
      return { valid: false, issues };
    }
    
    // Check if URL starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      issues.push('URL does not start with http:// or https://');
    }
    
    // Check if URL contains Supabase domain
    if (!url.includes('supabase.co')) {
      issues.push('URL does not appear to be from Supabase storage');
    }
    
    // Check for common issues
    if (url.includes(' ')) {
      issues.push('URL contains spaces');
    }
    
    if (url.includes('undefined') || url.includes('null')) {
      issues.push('URL contains "undefined" or "null" string');
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Log detailed image information for debugging
   */
  static logImageInfo(placeName: string, imageUrl: string | null | undefined) {
    console.log('🖼️ ========== IMAGE DEBUG INFO ==========');
    console.log('📍 Place:', placeName);
    console.log('🔗 URL:', imageUrl);
    console.log('📏 URL Length:', imageUrl?.length || 0);
    console.log('🔤 URL Type:', typeof imageUrl);
    
    const validation = this.validateImageUrl(imageUrl);
    console.log('✅ Valid:', validation.valid);
    
    if (!validation.valid) {
      console.log('❌ Issues:', validation.issues);
    }
    
    console.log('🖼️ =====================================');
  }

  /**
   * Test all place images in a list
   */
  static async testAllPlaceImages(places: Array<{ id: string; title: string; photo?: string }>) {
    console.log('🔍 Testing all place images...');
    
    const results = [];
    
    for (const place of places) {
      if (place.photo) {
        const validation = this.validateImageUrl(place.photo);
        const accessibility = await this.testImageUrl(place.photo);
        
        results.push({
          placeId: place.id,
          placeName: place.title,
          url: place.photo,
          valid: validation.valid,
          accessible: accessibility.accessible,
          issues: validation.issues,
          error: accessibility.error,
        });
      } else {
        results.push({
          placeId: place.id,
          placeName: place.title,
          url: null,
          valid: false,
          accessible: false,
          issues: ['No photo URL'],
        });
      }
    }
    
    console.log('📊 Image test results:', results);
    
    const failedImages = results.filter(r => !r.accessible);
    if (failedImages.length > 0) {
      console.warn(`⚠️ ${failedImages.length} images failed to load:`);
      failedImages.forEach(img => {
        console.warn(`  - ${img.placeName}: ${img.issues.join(', ')}`);
      });
    }
    
    return results;
  }

  /**
   * Get device-specific image loading recommendations
   */
  static getDeviceRecommendations() {
    const recommendations = [
      '1. Check internet connection',
      '2. Verify Supabase storage bucket is public',
      '3. Check if device has HTTPS certificate issues',
      '4. Try clearing app cache',
      '5. Check if device blocks external image loading',
      '6. Verify image URLs are complete and valid',
      '7. Check device date/time settings (affects SSL)',
    ];
    
    console.log('💡 Image Loading Troubleshooting:');
    recommendations.forEach(rec => console.log(`  ${rec}`));
    
    return recommendations;
  }
}
