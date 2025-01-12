import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import "ol-ext/dist/ol-ext.css";
import './map.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM';
import {Select} from 'ol/interaction';
import Feature, { FeatureLike } from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import HexBin from 'ol-ext/source/HexBin';
import GridBin from 'ol-ext/source/GridBin';
import FeatureBin from 'ol-ext/source/FeatureBin';
import { Vector } from 'ol/source';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape.js';
import { SelectEvent } from 'ol/interaction/Select';
import VectorSource from 'ol/source/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';
import Layer from 'ol/layer/Layer';
import { fromLonLat, Projection } from 'ol/proj';
import chroma from 'chroma-js';
import GeoJSON from 'ol/format/GeoJSON';
import BinBase from 'ol-ext/source/BinBase';
import { data } from '../../data/us_addresses';
import Geometry from 'ol/geom/Geometry';

export interface BinMapViewOptions {
    tileLayerVisible: boolean;
    binLayerVisible: boolean;
    binLayerIsVectorImage: boolean;
    binLayerBackgroundEnabled: boolean;
    hexStyle: string;
    binStyle: string;
    binType: string;
    binSize: number;
    aggFuncName: string;
    tileSourceUrl: string;
    numColorSteps: number;
    colorScaleName: string;
    intervalMin: number;
    intervalMax: number;
    binLayerOpacity: number;
    tileLayerOpacity: number;
};

export interface BinMapViewProps {
    options: BinMapViewOptions;
    features: Feature<Geometry>[];
    layerConfigs: any;
    mapCallback: (map: Map) => void;
    featureBinSource?: VectorSource;
};

export function BinMapView({ features, options, layerConfigs, mapCallback, featureBinSource }: BinMapViewProps) {

    console.log("BinMapView called ...");

    const mapContainerRef = useRef(null);
    const mapRef = useRef<Map>();
    const vectorSourceRef = useRef(new Vector());
    const binSourceName = useRef("hex");
    const binSource = useRef<BinBase>();
    const minRadius = 1;
    const maxValueRef = useRef(100);

    // TODO: replace these with a better system
    const binLayerRef = useRef<Layer>();
    const tileLayerRef = useRef<Layer>();

    // console.log("options", options)

    // const [layers, setLayers] = useState<Layer[]>([]);

    // handle selection of a feature
    function handleFeatureSelect(event: SelectEvent) {
        if (event.selected.length){
            let f = event.selected[0];
            console.log("BinMap selected value: ", f.get("value"));
        } else {
            // did not select a feature
            console.log("BinMap did not select feature");
        }
    }

    // find the minimum and maximum values in a given feature set
    function findValueBounds(features: FeatureLike[]) {
        if (!features || features.length == 0) return;

        console.log("BinMapView findValueBounds ...");

        // reset current values
        maxValueRef.current = Number.MIN_SAFE_INTEGER;

        // get current aggregation function
        let mode = options.aggFuncName;

        // calculate the value for every feature
        for (let f of features) {
            let fs = f.get('features');
            let fMax = Number.MIN_SAFE_INTEGER;
            let sum = 0;
            let value = 0;
           
            // do not need to iterate over data points for length
            if (mode !== 'len') {
                for (let ff of fs) {
                    let n = ff.get('number');
                    sum += n;
                    if (n>fMax) fMax = n;
                }
            }

            // set the value based on the current mode
            switch (mode) {
            case 'len':
                value = fs.length;
                break;
            case 'avg':
                value = sum / fs.length;
                break; 
            case 'sum':
                value = sum;
                break;
            case 'max':
            default:
                value = fMax;
            }

            (f as Feature).set('value', value, true);
            if (value>maxValueRef.current) maxValueRef.current = value;
        }

        // set new min/max by clipping ends (TODO: why?)
        maxValueRef.current = Math.min(Math.round(maxValueRef.current - maxValueRef.current/4), 30000);
    }

    // returns the chroma js color scale for the currently selected input
    function getColorScale() {
        let scale = chroma.scale(options.colorScaleName);
        return scale
    }

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number) {

        let value = f.get('value');
        let normal = Math.min(1, value/maxValueRef.current);
        
        let scale = getColorScale();
        let steppedColors = scale.colors(options.numColorSteps);

        switch (options.binStyle) {

        // different sized hexagons
        case 'point': {
            let radius = Math.max(minRadius, Math.round(options.binSize/res + 0.5) * normal);
            return [ 
                new Style({
                    image: new RegularShape({
                        points: 6,
                        radius: radius,
                        fill: new Fill({ color: [0,0,255] }),
                        rotateWithView: true
                    }),
                    geometry: new Point(f.get('center'))
                })
                // , new Style({ fill: new Fill({color: [0,0,255,.1] }) })
            ];
        }

        // sharp transition between colors
        case 'color': {
            let index = Math.floor(normal * (options.numColorSteps - 1));
            let color = steppedColors[index];
            return [ new Style({ fill: new Fill({ color: color }) }) ];
        }

        // smooth transition between colors
        case 'gradient':
        default: {
            let scaledColor = scale(normal);
            let color = scaledColor ? scaledColor : [0, 0, 255, normal] as any;
            return [ new Style({ fill: new Fill({ color: color }) }) ];
        }}
    }

    // reload fast visuals
    function refresh() {

        // set bin layer background color
        if (options.binLayerBackgroundEnabled) {
            let scale = getColorScale();
            binLayerRef.current?.setBackground(scale(0).alpha(binLayerRef.current.getOpacity()).darken().name());
        } else {
            binLayerRef.current?.setBackground();
        }

        // set opacity
        binLayerRef.current?.setOpacity(Number(options.binLayerOpacity)/100);
        tileLayerRef.current?.setOpacity(Number(options.tileLayerOpacity)/100);

        // set enabled
        tileLayerRef.current?.setVisible(options.tileLayerVisible);
        binLayerRef.current?.setVisible(options.binLayerVisible);

        // update tile layer url
        let osmSource = tileLayerRef.current?.getSource() as OSM;
        osmSource.setUrl(options.tileSourceUrl);

        // set manually
        // minValue = Number(options.intervalMin);
        // maxValueRef.current = Number(options.intervalMax);

        // if (binsRef.current) binsRef.current.changed();
        binSource.current?.changed();

        // update hexbin style (point or flat)
        if (binSourceName.current === 'hex' && binSource.current) {
            let hexBin = binSource.current as HexBin;

            if (hexBin.getLayout() as any !== options.hexStyle) {
                hexBin.setLayout(options.hexStyle as any, false);
                findValueBounds(hexBin.getFeatures());
                // mapRef.current?.changed();
                // console.log("setting layout:", options.hexStyle);
            }
            
        }

        // recreate the syling function so options are refreshed
        if (binLayerRef.current) {
            let binLayer = binLayerRef.current as any;
            binLayer.setStyle(styleForBin);
        }
    }

    // calculate bins depending on current settings
    function calcBins(forceCalc: boolean) {

        console.log("BinMapView calcBins");

        if (binSourceName.current === options.binType && binSource.current && !forceCalc) return;

        vectorSourceRef.current = new Vector({features: features});

        // TODO: ensure previous bin sources do not continue to exist and update on source changes
        console.log("creating new bin type:", options.binType);

        let bins : BinBase;

        switch (options.binType) {
            case "grid": {
                binSourceName.current = "grid";
                bins = new GridBin({
                    source: vectorSourceRef.current,
                    size: Number(options.binSize),
                    listenChange: false,
                } as any);
                break;
            }
            case "feature": {
                binSourceName.current = "feature";
                bins = new FeatureBin({
                    source: vectorSourceRef.current,
                    binSource: featureBinSource,
                    listenChange: false,
                } as any);
                break;
            }
            case "hex":
            default: {
                binSourceName.current = "hex";
                bins = new HexBin({
                    source: vectorSourceRef.current,
                    size: Number(options.binSize),
                    layout: options.hexStyle as any,
                    listenChange: false,
                } as any);
            }
        }

        binSource.current = bins;
        findValueBounds(bins.getFeatures());

        // update binSource in the layer
        binLayerRef.current?.setSource(bins);

        // mapRef.current.changed();

    }

    // create and return a new bin layer
    function createBinLayer(source: Vector, opacity: number, isVectorImageLayer: boolean) {
        
        let vClass = isVectorImageLayer ? VectorImageLayer : VectorLayer;
        const binLayer = new vClass({ 
            source: source, 
            opacity: opacity,
            style: styleForBin,
        });
        
        return binLayer;
    }

    // called when component has mounted
    useEffect(() => {
        console.log("BinMapView useEffect ...");
        if (!mapContainerRef.current) return;

        // initialize the tile layer
        const tileLayer = new TileLayer({
            source: new OSM({url: options.tileSourceUrl}), 
            // preload: Infinity 
            preload: 1
        });
        tileLayerRef.current = tileLayer;

        // get the current bin source
        calcBins(false);

        // initialize the map object
        const map = new Map({
            view: new View({
                center: fromLonLat([-80, 40.440]),
                zoom: 9,
            }),
            layers: [tileLayer],
            target: mapContainerRef.current
        });
        mapRef.current = map;
        mapCallback(map);

        var select  = new Select();
        map.addInteraction(select);
        select.on('select', handleFeatureSelect);

        return () => map.setTarget('');
    }, []);

    useEffect(() => {
        console.log("BinMapView options changed");

        refresh();

    }, [options])

    useEffect(() => {
        console.log("BinMapView useEffect calcBins");

        calcBins(true);
        refresh();

    }, [features, options.binType, options.binSize])

    useEffect(() => {

        if (binSource.current) {
            findValueBounds(binSource.current.getFeatures());
        }

    }, [options.aggFuncName]);

    useEffect(() => {

        if (!mapRef.current || !binSource.current) return;

        if (binLayerRef.current) {
            mapRef.current.removeLayer(binLayerRef.current);
        }

        binLayerRef.current = createBinLayer(binSource.current, Number(options.binLayerOpacity) / 100, options.binLayerIsVectorImage);
        mapRef.current.addLayer(binLayerRef.current);

    }, [options.binLayerIsVectorImage]);

    // handle layer updates
    // useEffect(() => {
    //     console.log("BinMapView setLayers useEffect")
    //     if (!mapRef.current) return;

    //     // sort layers based on z level
    //     layers.sort((a: Layer, b: Layer) => {
    //         let az = a.getZIndex();
    //         let bz = b.getZIndex();
    //         let av = az ? az : -1;
    //         let bv = bz ? bz : -1;
    //         return av - bv;
    //     });

    //     // update the layers on the map
    //     mapRef.current.setLayers(layers);

    // }, [layers]);
    

    return (
        <div ref={mapContainerRef} className="map"/>
    );
   
}

