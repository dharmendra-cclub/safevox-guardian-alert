
declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setMapTypeId(mapTypeId: string): void;
    setCenter(latLng: LatLng | LatLngLiteral): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(latLng: LatLng | LatLngLiteral): void;
  }

  namespace marker {
    class AdvancedMarkerElement {
      constructor(opts?: AdvancedMarkerElementOptions);
      position: LatLng | LatLngLiteral | null;
      map: Map | null;
      title: string | null;
      content: HTMLElement | null;
    }

    interface AdvancedMarkerElementOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      content?: HTMLElement;
    }
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    styles?: any[];
    gestureHandling?: string;
  }

  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    animation?: Animation;
    title?: string;
    icon?: any;
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

  enum SymbolPath {
    BACKWARD_CLOSED_ARROW,
    BACKWARD_OPEN_ARROW,
    CIRCLE,
    FORWARD_CLOSED_ARROW,
    FORWARD_OPEN_ARROW
  }
}
