
import { Location } from './types';

class LocationService {
  private userLocation: Location | null = null;
  private locationWatchId: number | null = null;
  private locationError: boolean = false;

  constructor() {
    // Start watching location immediately
    this.startLocationTracking();
  }

  private startLocationTracking() {
    // First try to get current position before setting up watch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.locationError = false;
        },
        (error) => {
          console.error('Error getting initial location:', error);
          this.locationError = true;
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,  // Increased timeout to 15 seconds
          maximumAge: 0
        }
      );
      
      // Then set up continuous tracking
      this.locationWatchId = navigator.geolocation.watchPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.locationError = false;
        },
        (error) => {
          console.error('Error tracking location:', error);
          // Don't set locationError to true if we already have a location
          if (!this.userLocation) {
            this.locationError = true;
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,  // Accept positions up to 5 seconds old
          timeout: 15000     // Wait up to 15 seconds for a position
        }
      );
    }
  }

  public stopLocationTracking() {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  public async getCurrentLocation(): Promise<Location | null> {
    // Return cached location if available
    if (this.userLocation) {
      return this.userLocation;
    }
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.userLocation = location;
          resolve(location);
        },
        () => {
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, 
          maximumAge: 5000
        }
      );
    });
  }

  public getLocation(): Location | null {
    return this.userLocation;
  }

  public hasLocationError(): boolean {
    return this.locationError;
  }
}

export const locationService = new LocationService();
