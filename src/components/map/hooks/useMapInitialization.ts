
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
    let userMarker: google.maps.Marker | null = null;
    
    const initMap = async () => {
      if (!mapRef.current) return;
      
      try {
        setIsLoading(true);
        
        // Load Google Maps API
        await loadGoogleMapsApi();
        
        // Initial map setup
        const mapOptions: google.maps.MapOptions = {
          center: initialLocation || DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeId: satelliteView ? 'satellite' : 'roadmap',
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative', // Changed to 'cooperative' to enable scrolling without Ctrl
          zoomControl: true,
          styles: DARK_MODE_STYLES
        };
        
        const googleMap = new google.maps.Map(mapRef.current, mapOptions);
        setMap(googleMap);
        
        // Create marker for user's location if not provided initially
        if (showMarker) {
          const position = initialLocation || userLocation || DEFAULT_CENTER;
          
          userMarker = new google.maps.Marker({
            position,
            map: googleMap,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFF',
              strokeWeight: 2
            },
            animation: google.maps.Animation.DROP
          });
        }
        
        // If initial location is provided, use it
        if (initialLocation) {
          if (googleMap) {
            googleMap.setCenter(initialLocation);
            if (userMarker) {
              userMarker.setPosition(initialLocation);
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
    
    const handleGetLocation = (googleMap: google.maps.Map | null, marker: google.maps.Marker | null) => {
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
                marker.setPosition(newLocation);
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
