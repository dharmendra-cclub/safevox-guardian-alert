
import React from 'react';
import useMapInitialization from './hooks/useMapInitialization';
import LocationErrorMessage from './LocationErrorMessage';
import { MapViewProps } from './types';
import { Loader } from 'lucide-react';
import { useMap } from './context/MapContext';

const MapView: React.FC<MapViewProps> = ({
  satelliteView = false,
  showMarker = false,
  initialLocation
}) => {
  const {
    mapRef,
    locationError,
    isLoading
  } = useMapInitialization({
    satelliteView,
    showMarker,
    initialLocation
  });
  
  const { isLoadingLocation } = useMap();

  return (
    <div className="absolute inset-0">
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />
      
      {(isLoading || isLoadingLocation) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-safevox-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isLoadingLocation ? 'Getting your location...' : 'Loading map...'}
            </p>
          </div>
        </div>
      )}
      
      {locationError && <LocationErrorMessage error={locationError} />}
    </div>
  );
};

export default MapView;
