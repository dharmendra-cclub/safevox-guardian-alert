
import { useRef, useState, useEffect } from 'react';
import { loadGoogleMapsScript, cleanupGoogleMapsScript } from '../utils/mapLoader';
import useLocation from './useLocation';
import { DEFAULT_LOCATION } from '../utils/constants';
import { MapHookProps } from '../types';

export default function useMapInitialization({
  satelliteView,
  showMarker,
  initialLocation
}: MapHookProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markerInstance, setMarkerInstance] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get user location
  const { userLocation, locationError, setLocationError } = useLocation(
    initialLocation,
    showMarker
  );

  // Initialize map when we have a location
  useEffect(() => {
    setIsLoading(true);
    
    const initMap = () => {
      if (!mapRef.current) {
        console.error("Map container ref not available");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Initializing map with location:", initialLocation || userLocation || DEFAULT_LOCATION);
        // Use provided location, user location, or default location
        const location = initialLocation || userLocation || DEFAULT_LOCATION;

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
        
        // Set loading to false once the map is initialized
        map.addListener('tilesloaded', () => {
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setLocationError("Error initializing map. Please refresh the page.");
        setIsLoading(false);
      }
    };

    // Only load the script if we have a location or are using the default
    const locationAvailable = userLocation || initialLocation || DEFAULT_LOCATION;
    if (locationAvailable) {
      console.log("Location available, attempting to load Google Maps script");
      loadGoogleMapsScript(initMap);
    } else {
      console.log("No location available yet, waiting...");
    }

    // Cleanup
    return () => {
      cleanupGoogleMapsScript();
    };
  }, [satelliteView, showMarker, initialLocation, userLocation, setLocationError]);

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

  return {
    mapRef,
    mapInstance,
    markerInstance,
    locationError,
    isLoading
  };
}
