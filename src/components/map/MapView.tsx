
import React from 'react';
import useMapInitialization from './hooks/useMapInitialization';
import LocationErrorMessage from './LocationErrorMessage';
import { MapViewProps } from './types';
import { Loader } from 'lucide-react';

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

  return (
    <div className="h-full w-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full absolute inset-0"
        style={{ background: '#e5e5e5', minHeight: '300px' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-safevox-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      
      {locationError && <LocationErrorMessage error={locationError} />}
    </div>
  );
};

export default MapView;
