import * as Location from "expo-location";

export type LocationType = {
  latitude: number;
  longitude: number;
};

export class LocationService {
  // Request location permission
  static async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  }

  // Get current GPS coordinates
  static async getCurrentLocation(): Promise<LocationType> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      throw new Error("Unable to get current location");
    }
  }

  // Helper: convert degrees to radians
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate distance between two points using Haversine formula
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in meters
  }

  // Format distance for display
  static formatDistance(meters: number): string {
    if (!meters || meters === 0) {
      return "0 meters away";
    }
    if (meters < 1000) {
      return `${Math.round(meters)} meters away`;
    }
    return `${(meters / 1000).toFixed(1)} km away`;
  }

  // Format walking time
  static formatWalkingTime(meters: number): string {
    if (!meters || meters === 0) {
      return "0 min walk";
    }
    const walkingSpeedMsPerMin = 83.33; // ~5 km/h = 83.33 m/min
    const minutes = Math.round(meters / walkingSpeedMsPerMin);
    return `${Math.max(1, minutes)} min walk`;
  }
}
