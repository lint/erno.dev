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
    layerConfigs: BaseLayerOptions[];
    mapCallback: (map: Map) => void;
    featureBinSource?: VectorSource;
};

export interface BaseLayerOptions {
    visible: boolean;
    opacity: number;
    id: string;
    layerType: string;
};

export interface TileLayerOptions extends BaseLayerOptions {
    tileSourceUrl: string;
};

export interface BinLayerOptions extends BaseLayerOptions {
    hexStyle: string;
    binStyle: string;
    binType: string;
    binSize: number;
    aggFuncName: string;
    isVectorImage: boolean;
    numColorSteps: number;
    colorScaleName: string;
    intervalMin: number;
    intervalMax: number;
};

export function BinMapView({ features, options, layerConfigs, mapCallback, featureBinSource }: BinMapViewProps) {

    console.log("BinMapView called ...");

    const mapContainerRef = useRef(null);
    const mapRef = useRef<Map>();
    const vectorSourceRef = useRef(new Vector());
    const minRadius = 1;
    const maxValueRef = useRef(100);
    const layerDictRef = useRef({} as any);

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

    // get the max value for a given bin id
    function getMaxValue(binLayerId: string) {

        // TODO: actually implement

        return maxValueRef.current;
    }

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number, binLayerConfig: BinLayerOptions) {

        let value = f.get('value');
        let normal = Math.min(1, value/getMaxValue(binLayerConfig.id));
        
        let scale = chroma.scale(binLayerConfig.colorScaleName);
        let steppedColors = scale.colors(binLayerConfig.numColorSteps);

        switch (binLayerConfig.binStyle) {

        // different sized hexagons
        case 'point': {
            let radius = Math.max(minRadius, Math.round(binLayerConfig.binSize/res + 0.5) * normal);
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
            let index = Math.floor(normal * (binLayerConfig.numColorSteps - 1));
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

    // creates a new bin object
    function createBins(binLayerConfig : BinLayerOptions) {
        let bins : BinBase;
        switch (binLayerConfig.binType) {
        case "grid": {
            bins = new GridBin({
                source: vectorSourceRef.current,
                size: Number(binLayerConfig.binSize),
                listenChange: false,
            } as any);
            break;
        }
        case "feature": {
            bins = new FeatureBin({
                source: vectorSourceRef.current,
                binSource: featureBinSource,
                listenChange: false,
            } as any);
            break;
        }
        case "hex":
        default: {
            bins = new HexBin({
                source: vectorSourceRef.current,
                size: Number(binLayerConfig.binSize),
                layout: binLayerConfig.hexStyle as any,
                listenChange: false,
            } as any);
        }}

        findValueBounds(bins.getFeatures());

        return bins;
    }

    // create and return a new bin layer
    function createBinLayer(binLayerConfig : BinLayerOptions) {

        console.log("creating new bin layer", binLayerConfig.binType);
        
        let vClass = binLayerConfig.isVectorImage ? VectorImageLayer : VectorLayer;
        const binLayer = new vClass({ 
            source: createBins(binLayerConfig), 
            opacity: binLayerConfig.opacity / 100,
            style: (f: FeatureLike, res: number) => styleForBin(f, res, binLayerConfig),
        });
        
        return binLayer;
    }

    // create and return a new tile layer
    function createTileLayer(url: string) {
        const tileLayer = new TileLayer({
            source: new OSM({url: url}), 
            // preload: Infinity 
            preload: 1
        });
        return tileLayer;
    }

    // get the layer associated witht the given layer config
    function layerForConfig(layerConfig: BaseLayerOptions, resetLayer: boolean) {

        if (!layerConfig) return;

        let layer = layerDictRef.current[layerConfig.id];
        if (layer && resetLayer) {
            mapRef.current?.removeLayer(layer);
            layer = undefined;
        }

        // make new layer if it does not exist
        if (!layer) {

            // create bin layer
            if (layerConfig.layerType === "bin") {
                layer = createBinLayer(layerConfig as BinLayerOptions);
            
            // create tile layer
            } else if (layerConfig.layerType === "tile") {
                layer = createTileLayer((layerConfig as TileLayerOptions).tileSourceUrl);
            }

            // continue if could not create layer
            if (!layer) return;

            layerDictRef.current[layerConfig.id] = layer;
            mapRef.current?.addLayer(layer);
        }

        return layer;
    }

    function refreshLayers(updateBinSources: boolean, resetLayers: boolean) {

        console.log("BinMapView refreshLayers");
        console.log("configs:", layerConfigs);

        // set manually
        // minValue = Number(options.intervalMin);
        // maxValueRef.current = Number(options.intervalMax);

        // set bin layer background color
        // if (options.binLayerBackgroundEnabled) {
        //     let scale = getColorScale();
        //     binLayerRef.current?.setBackground(scale(0).alpha(binLayerRef.current.getOpacity()).darken().name());
        // } else {
        //     binLayerRef.current?.setBackground();
        // }

        layerConfigs.forEach((layerConfig, i) => {
            let layer = layerForConfig(layerConfig, resetLayers);

            // update common layer properties
            layer.setZIndex(i);
            layer.setOpacity(Number(layerConfig.opacity)/100);
            layer.setVisible(layerConfig.visible);

            // update tile layer properties
            if (layerConfig.layerType === "tile") {
                let tileLayerConfig = layerConfig as TileLayerOptions;
                
                let osmSource = layer.getSource() as OSM;
                osmSource.setUrl(tileLayerConfig.tileSourceUrl);
            
            // update bin layer properties
            } else if (layerConfig.layerType === "bin") {
                let binLayerConfig = layerConfig as BinLayerOptions;

                // recalculate bins if specified
                if (updateBinSources) {
                    layer.setSource(createBins(binLayerConfig));
                }

                // recreate the syling function so options are refreshed
                layer.setStyle((f: FeatureLike, res: number) => styleForBin(f, res, binLayerConfig));

                // update hexbin style (point or flat)
                if (binLayerConfig.binType === "hex") {
                    // let hexBin = binSource.current as HexBin;
                    let hexBin = layer.getSource() as HexBin;

                    // recalculate bins if layout style changed
                    if (hexBin.getLayout() as any !== binLayerConfig.hexStyle) {
                        hexBin.setLayout(binLayerConfig.hexStyle as any, false);
                        findValueBounds(hexBin.getFeatures());
                    }
                }
            }
        });

        // TODO: delete layers from mapRef that no longer exist in layerConfigs
    }

    // called when component has mounted
    useEffect(() => {
        console.log("BinMapView useEffect ...");
        if (!mapContainerRef.current) return;

        // initialize the map object
        const map = new Map({
            view: new View({
                center: fromLonLat([-80, 40.440]),
                zoom: 9,
            }),
            layers: [],
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

        refreshLayers(false, false);

    }, [options]);

    useEffect(() => {
        console.log("BinMapView useEffect calcBins");

        vectorSourceRef.current = new Vector({features: features});
        refreshLayers(true, false);

    }, [features]);

    // useEffect(() => {
    //     console.log("BinMapView useEffect calcBins");

    //     refreshLayers(true);

    // }, [options.binType, options.binSize])

    // useEffect(() => {

    //     if (binSource.current) {
    //         findValueBounds(binSource.current.getFeatures());
    //     }

    // }, [options.aggFuncName]);

    // useEffect(() => {

    //     if (!mapRef.current || !binSource.current) return;

    //     if (binLayerRef.current) {
    //         mapRef.current.removeLayer(binLayerRef.current);
    //     }

    //     binLayerRef.current = createBinLayer(binSource.current, Number(options.binLayerOpacity) / 100, options.binLayerIsVectorImage);
    //     mapRef.current.addLayer(binLayerRef.current);

    // }, [options.binLayerIsVectorImage]);
    

    return (
        <div ref={mapContainerRef} className="map"/>
    );
   
}

