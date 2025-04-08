
// Default location (New York) as fallback
export const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.0060 };

// Google Maps script ID
export const SCRIPT_ID = "google-maps-script";

// Google Maps API key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBEwcosHlnDAm1DbD7pfDRkoihXD4SfdUg';

// Global flag key name
export const GOOGLE_MAPS_LOADED_KEY = "googleMapsLoaded";

// Geolocation options
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 30000,      // 30 seconds
  maximumAge: 10000    // 10 seconds cache
};

// Watch position options
export const WATCH_POSITION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 5000,    // 5 seconds
  timeout: 30000       // 30 seconds
};
