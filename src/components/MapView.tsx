
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

      // Default location (can be customized)
      const defaultLocation = { lat: 17.3850, lng: 78.4867 }; // Hyderabad, India
      const location = initialLocation || defaultLocation;

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
      if (showMarker) {
        const marker = new google.maps.Marker({
          position: location,
          map: map,
          animation: google.maps.Animation.DROP,
          title: 'Your Location'
        });
        setMarkerInstance(marker);
      }
    };

    loadGoogleMapsScript();

    // Cleanup
    return () => {
      // Remove global callback
      if (window.initGoogleMap) {
        delete window.initGoogleMap;
      }
    };
  }, [satelliteView, showMarker, initialLocation]);

  // Update map type if satelliteView prop changes
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setMapTypeId(satelliteView ? 'satellite' : 'roadmap');
    }
  }, [satelliteView, mapInstance]);

  // Update marker position if initialLocation changes
  useEffect(() => {
    if (markerInstance && initialLocation) {
      markerInstance.setPosition(initialLocation);
      mapInstance?.panTo(initialLocation);
    }
  }, [initialLocation, markerInstance, mapInstance]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[300px]"
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
