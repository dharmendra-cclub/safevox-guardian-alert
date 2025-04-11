
import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../utils/googleMapsLoader';
import { DARK_MODE_STYLES } from '../constants/mapStyles';
import { useMap } from '../context/MapContext';

// Default map center (San Francisco)
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
const DEFAULT_ZOOM = 14;

interface MapViewInitProps {
  satelliteView?: boolean;
  showMarker?: boolean;
  initialLocation?: { lat: number; lng: number };
}

const useMapInitialization = ({
  satelliteView = false, 
  showMarker = true,
  initialLocation
}: MapViewInitProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { 
    setMap, 
    map, 
    setUserLocation, 
    userLocation, 
    setIsLoadingLocation 
  } = useMap();
  
  useEffect(() => {
    let userMarker: google.maps.marker.AdvancedMarkerElement | null = null;
    
    const initMap = async () => {
      if (!mapRef.current) return;
      
      try {
        setIsLoading(true);
        
        // Load Google Maps API
        await loadGoogleMapsApi();
        
        // Double check that Google Maps is definitely loaded
        if (!window.google || !window.google.maps || !window.google.maps.Map) {
          console.error('Google Maps API not properly loaded');
          throw new Error('Google Maps API not properly loaded');
        }
        
        console.log('Initializing map with Google Maps API');
        
        // Initial map setup
        const mapOptions: google.maps.MapOptions = {
          center: initialLocation || DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeId: satelliteView ? 'satellite' : 'roadmap',
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative', // 'cooperative' enables scrolling without Ctrl
          zoomControl: true,
          styles: DARK_MODE_STYLES
        };
        
        const googleMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(googleMap);
        
        // Create marker for user's location if needed
        if (showMarker && window.google.maps.marker) {
          const position = initialLocation || userLocation || DEFAULT_CENTER;
          
          // Create a simple dot element for the marker
          const dot = document.createElement('div');
          dot.className = 'map-marker-dot';
          dot.style.width = '20px';
          dot.style.height = '20px';
          dot.style.borderRadius = '50%';
          dot.style.backgroundColor = '#4285F4';
          dot.style.border = '2px solid white';
          
          // Use the new AdvancedMarkerElement instead of Marker
          if (window.google.maps.marker.AdvancedMarkerElement) {
            userMarker = new window.google.maps.marker.AdvancedMarkerElement({
              position,
              map: googleMap,
              content: dot,
              title: 'Your location'
            });
          } else {
            // Fallback to regular marker if Advanced Marker is not available
            const standardMarker = new window.google.maps.Marker({
              position,
              map: googleMap,
              title: 'Your location'
            });
            userMarker = null;
            console.warn('Advanced Marker not available, using standard marker');
          }
        }
        
        // If initial location is provided, use it
        if (initialLocation) {
          if (googleMap) {
            googleMap.setCenter(initialLocation);
            if (userMarker) {
              userMarker.position = initialLocation;
            }
          }
        } 
        // Otherwise try to get user's current position
        else if (!userLocation) {
          handleGetLocation(googleMap, userMarker);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setLocationError('Failed to load map. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const handleGetLocation = (
      googleMap: google.maps.Map | null,
      marker: google.maps.marker.AdvancedMarkerElement | null
    ) => {
      setIsLoadingLocation(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            setUserLocation(newLocation);
            
            if (googleMap) {
              googleMap.setCenter(newLocation);
              if (marker) {
                marker.position = newLocation;
              }
            }
            
            setIsLoadingLocation(false);
            setLocationError(null);
          },
          (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = 'Unable to get your location.';
            
            if (error.code === 1) {
              errorMessage = 'Location access denied. Please enable location services.';
            } else if (error.code === 2) {
              errorMessage = 'Location unavailable. Please try again later.';
            } else if (error.code === 3) {
              errorMessage = 'Location request timed out. Please try again.';
            }
            
            setLocationError(errorMessage);
            setIsLoadingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser.');
        setIsLoadingLocation(false);
      }
    };
    
    initMap();
    
    // Cleanup
    return () => {
      if (map) {
        setMap(null);
      }
    };
  }, [initialLocation, satelliteView, showMarker, setMap, map, userLocation, setUserLocation, setIsLoadingLocation]);
  
  return { mapRef, isLoading, locationError };
};

export default useMapInitialization;
