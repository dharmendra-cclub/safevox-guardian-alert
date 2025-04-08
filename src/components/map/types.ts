
export interface MapViewProps {
  satelliteView?: boolean;
  showMarker?: boolean;
  initialLocation?: { lat: number; lng: number };
}

export interface MapHookProps {
  satelliteView: boolean;
  showMarker: boolean;
  initialLocation?: { lat: number; lng: number };
}

export interface LocationState {
  lat: number;
  lng: number;
}

// Add the global type for the callback
declare global {
  interface Window {
    initGoogleMap: () => void;
    google: any;
    googleMapsLoaded: boolean;
    [key: string]: any; // Allow dynamic property access
  }
}
