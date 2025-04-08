
import { SCRIPT_ID, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LOADED_KEY } from './constants';

// Create a global flag to track if the script has been loaded
if (typeof window !== 'undefined' && !window.hasOwnProperty('googleMapsLoaded')) {
  Object.defineProperty(window, 'googleMapsLoaded', { value: false, writable: true });
}

/**
 * Loads the Google Maps script if not already loaded
 * @param initMapCallback The callback to run when the map is ready to initialize
 */
export const loadGoogleMapsScript = (initMapCallback: () => void) => {
  // If Google Maps API is already loaded, initialize the map directly
  if (window.google && window.google.maps) {
    console.log("Google Maps API already loaded, initializing map");
    initMapCallback();
    return;
  }

  // If script is already loading, wait for it to complete
  if (window[GOOGLE_MAPS_LOADED_KEY]) {
    console.log("Google Maps script is loading, waiting...");
    const checkInterval = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkInterval);
        console.log("Google Maps API loaded after waiting, initializing map");
        initMapCallback();
      }
    }, 200);
    return;
  }

  // Clean up any existing script to prevent duplicates
  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    console.log("Removing existing Google Maps script");
    existingScript.remove();
  }

  console.log("Loading Google Maps API script");
  // Mark as loading
  window[GOOGLE_MAPS_LOADED_KEY] = true;
  
  // Create and append the script
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMap`;
  script.async = true;
  script.defer = true;

  // Define the callback globally
  window.initGoogleMap = () => {
    console.log("initGoogleMap callback executing");
    initMapCallback();
    window[GOOGLE_MAPS_LOADED_KEY] = false;
  };

  // Handle errors
  script.onerror = () => {
    console.error('Failed to load Google Maps API');
    window[GOOGLE_MAPS_LOADED_KEY] = false;
  };

  document.head.appendChild(script);
};

/**
 * Cleans up the Google Maps initialization
 */
export const cleanupGoogleMapsScript = () => {
  if (window.initGoogleMap) {
    console.log("Cleaning up Google Maps initialization");
    // @ts-ignore
    delete window.initGoogleMap;
  }
};
