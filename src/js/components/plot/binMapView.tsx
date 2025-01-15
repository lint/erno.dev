import chroma from 'chroma-js';
import { Map, View } from 'ol';
import "ol-ext/dist/ol-ext.css";
import BinBase from 'ol-ext/source/BinBase';
import FeatureBin from 'ol-ext/source/FeatureBin';
import GridBin from 'ol-ext/source/GridBin';
import HexBin from 'ol-ext/source/HexBin';
import Feature, { FeatureLike } from 'ol/Feature.js';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point.js';
import { Select } from 'ol/interaction';
import { SelectEvent } from 'ol/interaction/Select';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector.js';
import VectorImageLayer from 'ol/layer/VectorImage';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import { Vector } from 'ol/source';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import RegularShape from 'ol/style/RegularShape.js';
import Style from 'ol/style/Style';
import React, { useEffect, useRef } from 'react';
import { BaseLayerOptions, BinLayerOptions, TileLayerOptions } from './binMapLayerOptions';
import './map.css';

export interface BinMapViewProps {
    features: Feature<Geometry>[];
    layerConfigs: BaseLayerOptions[];
    mapCallback: (map: Map) => void;
    featureBinSource?: VectorSource;
};

export interface BinValues {
    min: number;
    max: number;
    sum: number;
    avg: number;
    len: number;
    mode: number;
    median: number;
};

export function BinMapView({ features, layerConfigs, mapCallback, featureBinSource }: BinMapViewProps) {

    console.log("BinMapView called ...");

    const mapRef = useRef<Map>();
    const mapContainerRef = useRef(null);
    const vectorSourceRef = useRef(new Vector()); // stores input features (data points) as vector source
    const minRadius = 1; // minimum radius used for 'point' hex style
    const layersRef = useRef({} as any); // maps id => layer object
    const prevLayerConfigs = useRef(layerConfigs); // stores previous version of layerConfigs for later comparision
    const optionsTriggeringReload = ['isVectorImage', 'binSize', 'binType', 'hexStyle', 'aggFuncName'];
    const binMaxesRef = useRef({} as any);

    // handle selection of a feature
    function handleFeatureSelect(event: SelectEvent) {
        if (event.selected.length){
            let f = event.selected[0];
            console.log("BinMap selected value: ", f.get("values"));
        } else {
            // did not select a feature
            console.log("BinMap did not select feature");
        }
    }

    // find the minimum and maximum values in a given feature set
    function findValueBounds(features: FeatureLike[], binLayerConfig: BinLayerOptions) {
        if (!features || features.length == 0) return;

        console.log("BinMapView findValueBounds ...");

        let values: number[] = [];

        // calculate the value for every feature
        for (let f of features) {
            let fs = f.get('features');
            let numbers = fs.map((ff: FeatureLike) => ff.get('number'));
            let value = -1;
            // let values: BinValues = {
            //     min: fs.length > 0 ? Number.MAX_SAFE_INTEGER : -1,
            //     max: fs.length > 0 ? Number.MIN_SAFE_INTEGER : -1,
            //     sum: 0,
            //     avg: 0,
            //     len: fs.length,
            //     mode: -1,
            //     median: -1,
            // };
            
            // numbers.sort((a:number,b:number)=>a-b);
           
            // for (let ff of fs) {
            //     let n = ff.get('number');
            //     values.sum += n;
            //     if (n>values.max) values.max = n;
            //     if (n<values.min) values.min = n;
            // }

            // values.avg = values.sum / values.len;
            // (f as Feature).set('values', values, true);

            // set the value based on the current mode
            switch (binLayerConfig.aggFuncName) {
            case 'len':
                value = fs.length;
                break;
            case 'avg':
                value = numbers.reduce((a: number, b: number) => a + b, 0) / fs.length;
                break; 
            case 'sum':
                value = numbers.reduce((a: number, b: number) => a + b, 0);
                break;
            case 'min':
                value = numbers.reduce((a: number, b: number) => a < b ? a : b, Number.MAX_SAFE_INTEGER);
                break;
            case 'mode':
                // TODO
                break;
            case 'median': 
                // TODO
                break;
            case 'max':
            default:
                value = numbers.reduce((a: number, b: number) => a > b ? a : b, Number.MIN_SAFE_INTEGER);
            }
            (f as Feature).set('value', value, true);
            values.push(value);

        }

        // calculate value range
        values.sort((a : number, b: number) => a - b);

        let q1 = values[Math.floor(values.length * 0.25)];
        let q3 = values[Math.floor(values.length * 0.75)];
        let iqr = q3 - q1;

        // let minFence = Math.round(q1 - 1.5 * iqr);
        let maxFence = Math.round(q3 + 1.5 * iqr);
        binMaxesRef.current[binLayerConfig.id] = maxFence;

        // let maxValues: BinValues = {
        //     min: Number.MIN_SAFE_INTEGER,
        //     max: Number.MIN_SAFE_INTEGER,
        //     sum: Number.MIN_SAFE_INTEGER,
        //     avg: Number.MIN_SAFE_INTEGER,
        //     len: Number.MIN_SAFE_INTEGER,
        //     mode: Number.MIN_SAFE_INTEGER,
        //     median: Number.MIN_SAFE_INTEGER,
        // };
        // binMaxesRef.current[binLayerConfig.id] = maxValues;

        // // TODO: this seems like it would be really slow ... 
        // // is it faster to actually calculate the std and mean?
        // // better way to estimate outliers?

        // let featuresCopy = [...features];
        // let key: keyof BinValues;
        // for (key in maxValues) {
        //     // if (values[key] > maxValues[key]) maxValues[key] = values[key];

        //     featuresCopy.sort((a: FeatureLike, b: FeatureLike) => {
        //         return a.get('values')[key] - b.get('values')[key];
        //     });

        //     let index = Math.floor(featuresCopy.length * 0.98);
        //     maxValues[key] = featuresCopy[index].get('values')[key];

        //     console.log("bin layer: ", binLayerConfig.id, "interval max for", key, ": ", maxValues[key]);
        // }
    }

    // get the max value for a given bin id
    function getMaxValue(binLayerConfig: BinLayerOptions) {

        if (!Object.hasOwn(binMaxesRef.current, binLayerConfig.id)) {
            return -1;
        }

        return binMaxesRef.current[binLayerConfig.id];
    }

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number, binLayerConfig: BinLayerOptions) {

        // TODO: this method is called thousands of times, ensure there are no wasteful calculations
        // TODO: normal calculation is not correct

        let value = f.get('value');
        let normal = value/getMaxValue(binLayerConfig);
        normal = Math.max(0, Math.min(1, normal));
        
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

        findValueBounds(bins.getFeatures(), binLayerConfig);

        return bins;
    }

    // create and return a new bin layer
    function createBinLayer(binLayerConfig : BinLayerOptions) {

        console.log("creating new bin layer", binLayerConfig.binType, binLayerConfig.isVectorImage);
        
        let vClass = binLayerConfig.isVectorImage ? VectorImageLayer : VectorLayer;
        const binLayer = new vClass({ 
            source: createBins(binLayerConfig), 
            opacity: Number(binLayerConfig.opacity) / 100,
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
    function layerForConfig(layerConfig: BaseLayerOptions, resetBinLayer: boolean) {

        if (!layerConfig) return;

        let layer = layersRef.current[layerConfig.id];
        if (layer && layerConfig.layerType === 'bin' && resetBinLayer) {
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

            layersRef.current[layerConfig.id] = layer;
            mapRef.current?.addLayer(layer);
        }

        return layer;
    }

    // set layer properties according to layerConfigs
    function refreshLayers(resetBinLayers: boolean) {

        console.log("BinMapView refreshLayers", resetBinLayers);

        // set bin layer background color
        // if (options.binLayerBackgroundEnabled) {
        //     let scale = getColorScale();
        //     binLayerRef.current?.setBackground(scale(0).alpha(binLayerRef.current.getOpacity()).darken().name());
        // } else {
        //     binLayerRef.current?.setBackground();
        // }

        layerConfigs.forEach((layerConfig, i) => {
            let layer = layerForConfig(layerConfig, resetBinLayers);

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

                // recreate the syling function so options are refreshed
                layer.setStyle((f: FeatureLike, res: number) => styleForBin(f, res, binLayerConfig));

                // update hexbin style (point or flat)
                if (binLayerConfig.binType === "hex") {
                    let hexBin = layer.getSource() as HexBin;

                    // recalculate bins if layout style changed
                    if (hexBin.getLayout() as any !== binLayerConfig.hexStyle) {
                        hexBin.setLayout(binLayerConfig.hexStyle as any, false);
                        findValueBounds(hexBin.getFeatures(), binLayerConfig);
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

        // add selection handler to the map
        let select = new Select();
        map.addInteraction(select);
        select.on('select', handleFeatureSelect);

        return () => map.setTarget('');
    }, []);

    useEffect(() => {
        console.log("BinMapView useEffect layerConfigs changed");

        // TODO: currently only bin layers are affected by recreation (is there ever a reason to recreate other layers?)
        
        let shouldRecreateLayers = false;

        // recreate layers if number of layers has changeed
        if (layerConfigs.length !== prevLayerConfigs.current.length) {
            shouldRecreateLayers = true;
        }

        // check each config for 'expensive' changes
        for (let i = 0; i < layerConfigs.length && !shouldRecreateLayers; i++) {
            let prevLayerConfig = prevLayerConfigs.current[i];
            let currLayerConfig = layerConfigs[i];

            // recreate layers if layer order changed (TODO: could just set z index, but this is easier for now)
            if (prevLayerConfig.id !== currLayerConfig.id || prevLayerConfig.layerType !== currLayerConfig.layerType) {
                shouldRecreateLayers = true;
            }

            // check if any 'expensive' option changes were detected
            for (let key of optionsTriggeringReload) {
                if (Object.hasOwn(prevLayerConfig, key) && Object.hasOwn(currLayerConfig, key) && !Object.is(prevLayerConfig[key as keyof typeof prevLayerConfig], currLayerConfig[key as keyof typeof currLayerConfig])) {
                    shouldRecreateLayers = true;
                    break;
                }
            }
        }

        prevLayerConfigs.current = layerConfigs;        
        refreshLayers(shouldRecreateLayers);

    }, [layerConfigs]);

    useEffect(() => {
        console.log("BinMapView useEffect features changed");

        vectorSourceRef.current = new Vector({features: features});
        refreshLayers(true);

    }, [features]);

    return (
        <div ref={mapContainerRef} className="map"/>
    );
}
