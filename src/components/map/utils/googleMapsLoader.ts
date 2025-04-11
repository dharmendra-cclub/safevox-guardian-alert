
import { SCRIPT_ID, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LOADED_KEY } from './constants';

/**
 * Loads the Google Maps API if not already loaded
 * @returns A promise that resolves when Google Maps is loaded
 */
export const loadGoogleMapsApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If Google Maps API is already loaded, resolve immediately
    if (window.google && window.google.maps) {
      console.log("Google Maps API already loaded");
      resolve();
      return;
    }

    // If script is already loading, wait for it to complete
    if (window[GOOGLE_MAPS_LOADED_KEY]) {
      console.log("Google Maps script is loading, waiting...");
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          console.log("Google Maps API loaded after waiting");
          resolve();
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Define the callback for when the script loads
    script.onload = () => {
      console.log("Google Maps API script loaded");
      window[GOOGLE_MAPS_LOADED_KEY] = false;
      resolve();
    };

    // Handle errors
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      window[GOOGLE_MAPS_LOADED_KEY] = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};
