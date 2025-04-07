
declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setMapTypeId(mapTypeId: string): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(latLng: LatLng | LatLngLiteral): void;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
  }

  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    animation?: Animation;
    title?: string;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  enum Animation {
    DROP,
    BOUNCE
  }

  namespace event {
    function addListener(instance: any, eventName: string, handler: Function): MapsEventListener;
    function removeListener(listener: MapsEventListener): void;
  }

  interface MapsEventListener {
    remove(): void;
  }
}
