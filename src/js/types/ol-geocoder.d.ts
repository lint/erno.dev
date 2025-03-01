declare module 'ol-geocoder' {
    import { Control } from 'ol/control';
    import { Feature } from 'ol';
    import { Coordinate } from 'ol/coordinate';

    export interface GeocoderOptions {
        provider?: 'osm' | 'mapquest' | 'photon' | 'pelias' | 'bing' | 'opencage' | any;
        key?: string;
        lang?: string;
        placeholder?: string;
        targetType?: 'glass-button' | 'text-input';
        limit?: number;
        keepOpen?: boolean;
    }

    export interface AddressChosenEvent {
        feature: Feature;
        coordinate: Coordinate;
        address: Record<string, any>;
    }

    export default class Geocoder extends Control {
        constructor(type: 'nominatim', options?: GeocoderOptions);
        on(event: 'addresschosen', callback: (evt: AddressChosenEvent) => void): void;
        setProvider(provider: string): void;
        setProviderKey(key: string): void;
    }
}
