
import React, { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  satelliteView?: boolean;
  showMarker?: boolean;
  initialLocation?: { lat: number; lng: number };
}

// Create a global flag to track if the script has been loaded
if (typeof window !== 'undefined' && !window.hasOwnProperty('googleMapsLoaded')) {
  Object.defineProperty(window, 'googleMapsLoaded', { value: false, writable: true });
}

const MapView: React.FC<MapViewProps> = ({
  satelliteView = false,
  showMarker = false,
  initialLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markerInstance, setMarkerInstance] = useState<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const scriptId = "google-maps-script";
  const googleMapsLoadedKey = "googleMapsLoaded";
  const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York as fallback

  // Get user's location if not provided
  useEffect(() => {
    if (!initialLocation) {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        setLocationError("Geolocation is not supported. Using default location.");
        setUserLocation(defaultLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Could not get your location. Using default.");
          // Default fallback location
          setUserLocation(defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,  // 30 seconds
          maximumAge: 10000 // 10 seconds cache
        }
      );
    } else {
      setUserLocation(initialLocation);
    }
  }, [initialLocation]);

  // Set up real-time location watching for more accurate position updates
  useEffect(() => {
    let watchId: number | null = null;

    if (showMarker && !initialLocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          setLocationError(null);
        },
        (error) => {
          console.error("Error watching location:", error);
          if (!userLocation) {
            setUserLocation(defaultLocation);
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,   // 5 seconds
          timeout: 30000      // 30 seconds
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [showMarker, initialLocation, userLocation]);

  // Improved Google Maps script loading
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        console.log("Google Maps API already loaded, initializing map");
        initMap();
        return;
      }

      if (window[googleMapsLoadedKey]) {
        console.log("Google Maps script is loading, waiting...");
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            console.log("Google Maps API loaded after waiting, initializing map");
            initMap();
          }
        }, 200);
        return;
      }

      // Clean up any existing script to prevent duplicates
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        console.log("Removing existing Google Maps script");
        existingScript.remove();
      }

      console.log("Loading Google Maps API script");
      // Mark as loading
      window[googleMapsLoadedKey] = true;
      
      // Create and append the script
      const apiKey = 'AIzaSyBEwcosHlnDAm1DbD7pfDRkoihXD4SfdUg';
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;

      // Define the callback globally
      window.initGoogleMap = () => {
        console.log("initGoogleMap callback executing");
        initMap();
        window[googleMapsLoadedKey] = false;
      };

      // Handle errors
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        window[googleMapsLoadedKey] = false;
        setLocationError("Failed to load map. Please check your internet connection.");
      };

      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) {
        console.error("Map container ref not available");
        return;
      }

      try {
        console.log("Initializing map with location:", initialLocation || userLocation || defaultLocation);
        // Use provided location, user location, or default location
        const location = initialLocation || userLocation || defaultLocation;

        // Check if map container has dimensions
        const mapContainer = mapRef.current;
        if (mapContainer.clientHeight === 0 || mapContainer.clientWidth === 0) {
          console.error("Map container has zero width or height:", 
            mapContainer.clientWidth, mapContainer.clientHeight);
        }

        const mapOptions: google.maps.MapOptions = {
          center: location,
          zoom: 15,
          mapTypeId: satelliteView ? 'satellite' : 'roadmap',
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        };

        const map = new google.maps.Map(mapRef.current, mapOptions);
        setMapInstance(map);
        console.log("Map instance created successfully");

        // Add marker if needed
        if (showMarker && location) {
          const marker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP,
            title: 'Your Location'
          });
          setMarkerInstance(marker);
          console.log("Marker added to map");
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setLocationError("Error initializing map. Please refresh the page.");
      }
    };

    // Only load the script if we have a location or are using the default
    const locationAvailable = userLocation || initialLocation || defaultLocation;
    if (locationAvailable) {
      console.log("Location available, attempting to load Google Maps script");
      loadGoogleMapsScript();
    } else {
      console.log("No location available yet, waiting...");
    }

    // Cleanup
    return () => {
      if (window.initGoogleMap) {
        console.log("Cleaning up Google Maps initialization");
        // @ts-ignore
        delete window.initGoogleMap;
      }
    };
  }, [satelliteView, showMarker, initialLocation, userLocation, defaultLocation]);

  // Update map type if satelliteView prop changes
  useEffect(() => {
    if (mapInstance) {
      console.log("Updating map type:", satelliteView ? 'satellite' : 'roadmap');
      mapInstance.setMapTypeId(satelliteView ? 'satellite' : 'roadmap');
    }
  }, [satelliteView, mapInstance]);

  // Update marker position if location changes
  useEffect(() => {
    const locationToUse = initialLocation || userLocation;
    
    if (markerInstance && locationToUse) {
      console.log("Updating marker position:", locationToUse);
      markerInstance.setPosition(locationToUse);
      
      if (mapInstance) {
        mapInstance.panTo(locationToUse);
      }
    }
  }, [initialLocation, userLocation, markerInstance, mapInstance]);

  return (
    <div className="h-full w-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full absolute inset-0"
        style={{ background: '#e5e5e5', minHeight: '300px' }}
      />
      {locationError && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-red-100 text-red-800 px-4 py-2 rounded z-10">
          {locationError}
        </div>
      )}
    </div>
  );
};

// Add the global type for the callback
declare global {
  interface Window {
    initGoogleMap: () => void;
    google: any;
    googleMapsLoaded: boolean;
    [key: string]: any; // Allow dynamic property access
  }
}

export default MapView;
