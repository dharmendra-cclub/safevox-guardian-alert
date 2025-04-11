
import { useRef, useState, useEffect } from 'react';
import { loadGoogleMapsScript, cleanupGoogleMapsScript } from '../utils/mapLoader';
import useLocation from './useLocation';
import { MapHookProps } from '../types';
import { useMap } from '../context/MapContext';

export default function useMapInitialization({
  satelliteView,
  showMarker,
  initialLocation
}: MapHookProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markerInstance, setMarkerInstance] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get location from context or initialLocation
  const { userLocation, locationError, isLoadingLocation } = useLocation(
    initialLocation,
    showMarker
  );
  
  // Get map loaded state from context
  const { mapLoaded, setMapLoaded } = useMap();

  // Initialize map when we have a location
  useEffect(() => {
    if (!userLocation) {
      // Wait for location before initializing map
      return;
    }
    
    setIsLoading(true);
    
    const initMap = () => {
      if (!mapRef.current) {
        console.error("Map container ref not available");
        setIsLoading(false);
        return;
      }

      try {
        // Use the available location, which is either initialLocation or userLocation from context
        const location = userLocation;
        
        if (!location) {
          console.log("No location available yet, waiting...");
          return;
        }
        
        console.log("Initializing map with location:", location);

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
          setMapLoaded(true);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    // Only load the script if we have a location
    if (userLocation) {
      console.log("Location available, attempting to load Google Maps script");
      loadGoogleMapsScript(initMap);
    } else {
      console.log("No location available yet, waiting...");
    }

    // Cleanup
    return () => {
      cleanupGoogleMapsScript();
    };
  }, [satelliteView, showMarker, initialLocation, userLocation, setMapLoaded]);

  // Update map type if satelliteView prop changes
  useEffect(() => {
    if (mapInstance) {
      console.log("Updating map type:", satelliteView ? 'satellite' : 'roadmap');
      mapInstance.setMapTypeId(satelliteView ? 'satellite' : 'roadmap');
    }
  }, [satelliteView, mapInstance]);

  // Update marker position if location changes
  useEffect(() => {
    const locationToUse = userLocation;
    
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
    isLoading: isLoading || isLoadingLocation
  };
}
