import { CacheService } from './cache.service';

// Offline-aware directions service
export class OfflineDirectionsService {
  private static readonly GOOGLE_DIRECTIONS_API = 'https://maps.googleapis.com/maps/api/directions/json';
  private static readonly API_KEY = 'AIzaSyCpli_YKmt4shsEsHhqBocM4Fq_pTxj-sM';

  // Get directions with offline fallback
  static async getDirections(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<any[]> {
    try {
      console.log('🧭 Getting directions...');
      
      // Try to get cached directions first
      const cachedDirections = await CacheService.getCachedDirections(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );

      if (cachedDirections) {
        console.log('📱 Using cached directions');
        return cachedDirections;
      }

      // Try online directions
      try {
        console.log('🌐 Fetching directions from Google API...');
        
        const url = `${this.GOOGLE_DIRECTIONS_API}?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${this.API_KEY}`;
        
        // Add timeout using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.status === 'OK' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const points = route.overview_polyline.points;
          
          // Decode polyline points
          const decodedPoints = this.decodePolyline(points);
          
          // Cache the directions
          await CacheService.cacheDirections(
            origin.latitude,
            origin.longitude,
            destination.latitude,
            destination.longitude,
            decodedPoints
          );

          console.log('✅ Online directions fetched and cached');
          return decodedPoints;
        }
      } catch (onlineError) {
        console.log('🌐 Online directions failed, using offline fallback...');
      }

      // Offline fallback: create straight line directions
      console.log('📱 Creating offline straight-line directions...');
      const offlineDirections = this.createOfflineDirections(origin, destination);
      
      return offlineDirections;
    } catch (error) {
      console.error('❌ Error getting directions:', error);
      
      // Ultimate fallback: straight line
      return this.createOfflineDirections(origin, destination);
    }
  }

  // Create simple offline directions (straight line with waypoints)
  private static createOfflineDirections(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): any[] {
    console.log('📱 Creating offline straight-line route...');
    
    // Create waypoints for a more realistic route
    const waypoints = [];
    const steps = 10; // Number of intermediate points
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = origin.latitude + (destination.latitude - origin.latitude) * ratio;
      const lng = origin.longitude + (destination.longitude - origin.longitude) * ratio;
      
      waypoints.push({
        latitude: lat,
        longitude: lng,
      });
    }

    return waypoints;
  }

  // Decode Google polyline (same as before)
  private static decodePolyline(encoded: string): any[] {
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return poly;
  }

  // Get offline navigation instructions
  static getOfflineNavigationInstructions(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    destinationName: string
  ): string[] {
    const distance = this.calculateDistance(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );

    const bearing = this.calculateBearing(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );

    const direction = this.getDirectionFromBearing(bearing);

    return [
      `📍 Starting from your current location`,
      `🧭 Head ${direction} towards ${destinationName}`,
      `📏 Distance: ${distance.toFixed(2)} km`,
      `📍 Destination: ${destinationName}`,
      `⚠️ Offline mode: Using straight-line navigation`,
      `💡 Connect to internet for detailed turn-by-turn directions`,
    ];
  }

  // Calculate distance between two points
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

  // Calculate bearing between two points
  private static calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLon = this.toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(this.toRadians(lat2));
    const x =
      Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
      Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x);
    bearing = this.toDegrees(bearing);
    return (bearing + 360) % 360;
  }

  // Get direction from bearing
  private static getDirectionFromBearing(bearing: number): string {
    const directions = [
      'North', 'Northeast', 'East', 'Southeast',
      'South', 'Southwest', 'West', 'Northwest'
    ];
    
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
}