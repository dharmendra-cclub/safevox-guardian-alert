
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

  // Get user's location if not provided
  useEffect(() => {
    if (!initialLocation) {
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
          setUserLocation({ lat: 17.3850, lng: 78.4867 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,  // Increased timeout to 10 seconds
          maximumAge: 5000 // Allowing cached position up to 5 seconds
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
            setUserLocation({ lat: 17.3850, lng: 78.4867 });
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,   // Allow position to be 3 seconds old
          timeout: 15000      // Increased timeout to 15 seconds
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [showMarker, initialLocation, userLocation]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // If the script is already loaded or loading
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // If another component is already loading the script
      if (window.googleMapsLoaded) {
        // Wait for the script to be fully loaded
        const checkGoogleMapsLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMapsLoaded);
            initMap();
          }
        }, 100);
        return;
      }

      // Mark the script as loading
      window.googleMapsLoaded = true;
      
      // Remove any existing Google Maps scripts to prevent duplicates
      document.querySelectorAll('script[src*="maps.googleapis.com/maps/api/js"]').forEach(script => {
        script.remove();
      });

      // Create and append the script
      const apiKey = 'AIzaSyBEwcosHlnDAm1DbD7pfDRkoihXD4SfdUg';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;

      // Define the callback globally
      window.initGoogleMap = initMap;

      // Handle errors
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        window.googleMapsLoaded = false;
      };

      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

      try {
        // Use provided location, user location, or default location
        const location = initialLocation || userLocation || { lat: 17.3850, lng: 78.4867 };

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

        // Add marker if needed
        if (showMarker && location) {
          const marker = new google.maps.Marker({
            position: location,
            map: map,
            animation: google.maps.Animation.DROP,
            title: 'Your Location'
          });
          setMarkerInstance(marker);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    if (userLocation || initialLocation) {
      loadGoogleMapsScript();
    }

    // Cleanup
    return () => {
      // Remove global callback
      if (window.initGoogleMap) {
        delete window.initGoogleMap;
      }
    };
  }, [satelliteView, showMarker, initialLocation, userLocation]);

  // Update map type if satelliteView prop changes
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setMapTypeId(satelliteView ? 'satellite' : 'roadmap');
    }
  }, [satelliteView, mapInstance]);

  // Update marker position if location changes
  useEffect(() => {
    const locationToUse = initialLocation || userLocation;
    
    if (markerInstance && locationToUse) {
      markerInstance.setPosition(locationToUse);
      mapInstance?.panTo(locationToUse);
    }
  }, [initialLocation, userLocation, markerInstance, mapInstance]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ background: '#e5e5e5' }}
    >
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
  }
}

export default MapView;
