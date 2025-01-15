import React, { useEffect, useRef } from 'react';
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
import { fromLonLat } from 'ol/proj';
import chroma from 'chroma-js';
import BinBase from 'ol-ext/source/BinBase';
import Geometry from 'ol/geom/Geometry';
import { BaseLayerOptions, BinLayerOptions, TileLayerOptions } from './binMapLayerOptions';

export interface BinMapViewProps {
    features: Feature<Geometry>[];
    layerConfigs: BaseLayerOptions[];
    mapCallback: (map: Map) => void;
    featureBinSource?: VectorSource;
};

export function BinMapView({ features, layerConfigs, mapCallback, featureBinSource }: BinMapViewProps) {

    console.log("BinMapView called ...");

    const mapContainerRef = useRef(null);
    const mapRef = useRef<Map>();
    const vectorSourceRef = useRef(new Vector());
    const minRadius = 1;
    const maxValueRef = useRef(100);
    const layerDictRef = useRef({} as any);
    const prevLayerConfigs = useRef(layerConfigs);
    const optionsTriggeringReload = ['isVectorImage', 'binSize', 'binType', 'hexStyle'];

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
        // TODO: remove this
        maxValueRef.current = Number.MIN_SAFE_INTEGER;

        // calculate the value for every feature
        for (let f of features) {
            let fs = f.get('features');
            let values = {
                min: fs.length > 0 ? Number.MAX_SAFE_INTEGER : -1,
                max: fs.length > 0 ? Number.MIN_SAFE_INTEGER : -1,
                sum: 0,
                avg: 0,
                len: fs.length,
                mode: -1,
                median: -1,
            };
            let numbers = fs.map((ff: FeatureLike) => ff.get('number'));
            numbers.sort((a:number,b:number)=>a-b);
           
            for (let ff of fs) {
                let n = ff.get('number');
                values.sum += n;
                if (n>values.max) values.max = n;
                if (n<values.min) values.min = n;
            }

            values.avg = values.sum / values.len;

            (f as Feature).set('values', values, true);
            if (values.max>maxValueRef.current) maxValueRef.current = values.max; // TODO: make dynamic, or even better remove this check entirely
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

        let values = f.get('values');
        let value = values[binLayerConfig.aggFuncName];
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

        let layer = layerDictRef.current[layerConfig.id];
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

            layerDictRef.current[layerConfig.id] = layer;
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
