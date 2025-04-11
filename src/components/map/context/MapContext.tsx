
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GEOLOCATION_OPTIONS } from '../utils/constants';
import { LocationState } from '../types';

interface MapContextType {
  userLocation: LocationState | null;
  locationError: string | null;
  isLoadingLocation: boolean;
  mapLoaded: boolean;
  setMapLoaded: (loaded: boolean) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get user's location once when the app starts
  useEffect(() => {
    console.log('MapProvider: Getting user location');
    let isMounted = true;
    
    // Clear any previous errors
    setLocationError(null);
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
      return;
    }

    // Try to get cached position first if available
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted) return;
        
        console.log('MapProvider: Got user location successfully');
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
        setIsLoadingLocation(false);
      },
      (error) => {
        if (!isMounted) return;
        
        console.error("Error getting location:", error);
        
        // Provide more helpful error messages based on error code
        if (error.code === 1) {
          setLocationError("Location access denied. Please enable location permissions in your browser settings.");
        } else if (error.code === 2) {
          setLocationError("Your location is currently unavailable. Please try again later.");
        } else if (error.code === 3) {
          setLocationError("Location request timed out. Please check your connection and try again.");
        } else {
          setLocationError("Could not get your location. Please check your permissions.");
        }
        
        setIsLoadingLocation(false);
      },
      GEOLOCATION_OPTIONS
    );

    // Set up continuous location watching
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!isMounted) return;
        
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
        setIsLoadingLocation(false);
      },
      (error) => {
        // Don't overwrite error messages for watch position errors
        // Only update if we don't already have a location
        if (!isMounted || userLocation) return;
        
        console.error("Error watching location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,   // Accept positions up to 10 seconds old
        timeout: 60000       // Wait up to 60 seconds for a position
      }
    );

    return () => {
      isMounted = false;
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <MapContext.Provider value={{ 
      userLocation, 
      locationError, 
      isLoadingLocation,
      mapLoaded,
      setMapLoaded
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
