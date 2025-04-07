
import React, { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  satelliteView?: boolean;
  showMarker?: boolean;
  initialLocation?: { lat: number; lng: number };
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

  // Get user's location if not provided
  useEffect(() => {
    if (!initialLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default fallback location
          setUserLocation({ lat: 17.3850, lng: 78.4867 });
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
        },
        (error) => {
          console.error("Error watching location:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [showMarker, initialLocation]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if the script is already loaded
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

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
      };

      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

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
    />
  );
};

// Add the global type for the callback
declare global {
  interface Window {
    initGoogleMap: () => void;
    google: any;
  }
}

export default MapView;
