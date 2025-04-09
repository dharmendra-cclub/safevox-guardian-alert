
import { useState, useEffect } from 'react';
import { GEOLOCATION_OPTIONS, WATCH_POSITION_OPTIONS } from '../utils/constants';
import { LocationState } from '../types';

/**
 * Hook to get and watch user's location
 */
export default function useLocation(
  initialLocation?: LocationState,
  shouldWatch: boolean = false
) {
  const [userLocation, setUserLocation] = useState<LocationState | null>(initialLocation || null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user's location if not provided
  useEffect(() => {
    if (initialLocation) {
      setUserLocation(initialLocation);
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      setLocationError("Geolocation is not supported by this browser.");
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
        setLocationError("Could not get your location. Please check your permissions.");
      },
      GEOLOCATION_OPTIONS
    );
  }, [initialLocation]);

  // Set up real-time location watching for more accurate position updates
  useEffect(() => {
    let watchId: number | null = null;

    if (shouldWatch && !initialLocation) {
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
        },
        WATCH_POSITION_OPTIONS
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [shouldWatch, initialLocation, userLocation]);

  return { userLocation, locationError, setLocationError };
}
