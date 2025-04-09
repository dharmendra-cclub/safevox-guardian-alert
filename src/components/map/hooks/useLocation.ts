
import { useEffect } from 'react';
import { useMap } from '../context/MapContext';
import { LocationState } from '../types';

/**
 * Hook to get and watch user's location through the Map context
 */
export default function useLocation(
  initialLocation?: LocationState,
  shouldWatch: boolean = false
) {
  const { userLocation, locationError, isLoadingLocation, setMapLoaded } = useMap();
  
  // Use initial location if provided, otherwise use the shared context location
  const effectiveLocation = initialLocation || userLocation;
  
  // Set map as loaded when location is available
  useEffect(() => {
    if (effectiveLocation) {
      setMapLoaded(true);
    }
  }, [effectiveLocation, setMapLoaded]);

  return { 
    userLocation: effectiveLocation, 
    locationError, 
    setLocationError: () => {}, // No-op as errors are managed by context
    isLoadingLocation
  };
}
