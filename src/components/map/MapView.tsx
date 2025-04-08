
import React from 'react';
import useMapInitialization from './hooks/useMapInitialization';
import LocationErrorMessage from './LocationErrorMessage';
import { MapViewProps } from './types';

const MapView: React.FC<MapViewProps> = ({
  satelliteView = false,
  showMarker = false,
  initialLocation
}) => {
  const {
    mapRef,
    locationError
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
      {locationError && <LocationErrorMessage error={locationError} />}
    </div>
  );
};

export default MapView;
