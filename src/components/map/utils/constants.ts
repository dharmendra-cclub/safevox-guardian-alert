
// Google Maps script ID
export const SCRIPT_ID = "google-maps-script";

// Google Maps API key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBEwcosHlnDAm1DbD7pfDRkoihXD4SfdUg';

// Global flag key name
export const GOOGLE_MAPS_LOADED_KEY = "googleMapsLoaded";

// Geolocation options with increased timeouts for better reliability
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,       // 15 seconds
  maximumAge: 10000     // 10 seconds cache
};

// Watch position options
export const WATCH_POSITION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 10000,    // 10 seconds
  timeout: 15000        // 15 seconds
};
