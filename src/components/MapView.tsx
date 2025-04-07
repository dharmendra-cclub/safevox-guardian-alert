
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MapViewProps {
  satelliteView?: boolean;
  initialLocation?: { lat: number; lng: number };
  showMarker?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  satelliteView = true,
  initialLocation,
  showMarker = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  // Initialize map
  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      // Load Google Maps API script if not loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBEwcosHlnDAm1DbD7pfDRkoihXD4SfdUg&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      // Define global callback for script
      window.initMap = () => {
        initializeMap();
      };

      return () => {
        document.head.removeChild(script);
        delete window.initMap;
      };
    } else {
      initializeMap();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map when user location changes
  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setCenter(userLocation);
      
      if (showMarker) {
        if (markerRef.current) {
          markerRef.current.setPosition(userLocation);
        } else {
          markerRef.current = new google.maps.Marker({
            position: userLocation,
            map: mapInstanceRef.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#559C62",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
          });
        }
      }
    }
  }, [userLocation, showMarker]);

  // Initialize map instance
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setUserLocation(userPos);
          
          const mapOptions: google.maps.MapOptions = {
            center: userPos,
            zoom: 16,
            mapTypeId: satelliteView ? 'satellite' : 'roadmap',
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
          };
          
          mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location. Please check your device settings.');
          
          // Use default location if user location is not available
          const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi
          setUserLocation(defaultLocation);
          
          const mapOptions: google.maps.MapOptions = {
            center: defaultLocation,
            zoom: 10,
            mapTypeId: satelliteView ? 'satellite' : 'roadmap',
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
          };
          
          mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
      
      // Use default location if geolocation is not supported
      const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi
      setUserLocation(defaultLocation);
      
      const mapOptions: google.maps.MapOptions = {
        center: defaultLocation,
        zoom: 10,
        mapTypeId: satelliteView ? 'satellite' : 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
      };
      
      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
    }
  };

  // Define typings for the global window object
  declare global {
    interface Window {
      initMap: () => void;
      google: any;
    }
  }

  return <div ref={mapRef} className="map-container" />;
};

export default MapView;
