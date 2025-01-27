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
    featureBinSource?: VectorSource;
    layerConfigs: BaseLayerOptions[];
    mapCallback: (map: Map) => void;
    rangesCallback: (binLayerRanges: any[]) => void;
};

export interface BinValues {
    min: number;
    max: number;
    sum: number;
    avg: number;
    len: number;
};

export function BinMapView({ features, layerConfigs, featureBinSource, mapCallback, rangesCallback }: BinMapViewProps) {

    console.log("BinMapView called ...");

    const mapRef = useRef<Map>();
    const mapContainerRef = useRef(null);
    const vectorSourceRef = useRef(new Vector()); // stores input features (data points) as vector source
    const minRadius = 1; // minimum radius used for 'point' hex style
    const layersRef = useRef({} as any); // maps id => layer object
    const prevLayerConfigs = useRef(layerConfigs); // stores previous version of layerConfigs for later comparision
    const optionsTriggeringReload = ['isVectorImage', 'binSize', 'binType', 'hexStyle', 'aggFuncName', 'useIQRInterval'];
    const binMaxesRef = useRef({} as any);

    // handle selection of a feature
    function handleFeatureSelect(event: SelectEvent) {
        if (event.selected.length) {
            let f = event.selected[0];
            console.log("BinMap selected: ", f);
            // console.log(`min=${f.get('min')} max=${f.get('max')} avg=${f.get('avg')} sum=${f.get('sum')} len=${f.get('len')}`);
            console.log("value:", f.get('value'));
        } else {
            // did not select a feature
            console.log("BinMap did not select feature");
        }
    }

    // find the minimum and maximum values in a given feature set
    function findValueBounds(features: Feature<Geometry>[], binLayerConfig: BinLayerOptions) {
        if (!features || features.length == 0) return;

        console.log("BinMapView findValueBounds ...");
        console.log("num features:", features.length)

        let values: number[] = [];

        // calculate the value for every feature
        for (let f of features) {
            let fs = f.get('features');

            // get list of values for the bins
            let numbers = fs.map((ff: Feature<Geometry>) => {

                let aggNum = ff.get(binLayerConfig.aggFuncName);
                let numNum = ff.get('number');
                if (!aggNum && Number.isFinite(numNum)) {
                    ff.set('min', numNum, true);
                    ff.set('max', numNum, true);
                    ff.set('avg', numNum, true);
                    ff.set('sum', numNum, true);
                    ff.set('len', 1, true);
                    return numNum;
                }
                if (aggNum) {
                    return aggNum;
                }

                return -1;
            });
            let value = -1;

            // find value for bins with aggregated value features
            switch (binLayerConfig.aggFuncName) {
                case 'len':
                    value = numbers.reduce((a: number, b: number) => a + b, 0);
                    break;
                case 'avg':
                    let totalLen = 0;
                    let weightedSum = 0;
                    for (let feature of fs) {
                        totalLen += feature.get('len');
                        weightedSum += feature.get('len') * feature.get('avg');
                    }
                    value = weightedSum / totalLen;

                    break;
                case 'sum':
                    value = numbers.reduce((a: number, b: number) => a + b, 0);
                    break;
                case 'min':
                    value = numbers.reduce((a: number, b: number) => a < b ? a : b, Number.MAX_SAFE_INTEGER);
                    break;
                case 'max':
                default:
                    value = numbers.reduce((a: number, b: number) => a > b ? a : b, Number.MIN_SAFE_INTEGER);
            }
            (f as Feature).set('value', value, true);
            values.push(value);
        }

        // calculate value range
        values.sort((a: number, b: number) => a - b);
        let q1 = values[Math.floor((values.length - 1) * 0.25)];
        let q3 = values[Math.floor((values.length - 1) * 0.75)];
        let iqr = q3 - q1;

        let iqrMult = 0.5;
        let min = values[0];
        let max = values[values.length - 1];
        let minFence = Math.max(1, Math.round(q1 - iqrMult * iqr));
        let maxFence = Math.round(q3 + iqrMult * iqr);

        console.log(`q1=${q1} q3=${q3} iqr=${iqr}\nmin=${min} max=${max}\n q1-1.5*iqr=${minFence} q3+1.5*iqr=${maxFence}`)

        let ranges = {
            full_min: min,
            full_max: max,
            iqr_min: minFence,
            iqr_max: maxFence
        };
        binMaxesRef.current[binLayerConfig.id] = ranges;
        rangesCallback({ ...binMaxesRef.current });
    }

    function getRangeValue(binLayerConfig: BinLayerOptions, isMax: boolean, modeOverride?: string) {
        if (!Object.hasOwn(binMaxesRef.current, binLayerConfig.id)) {
            return -1;
        }

        let ranges = binMaxesRef.current[binLayerConfig.id];
        switch (modeOverride ? modeOverride : binLayerConfig.intervalMode) {
            case 'manual':
                return isMax ? binLayerConfig.manualMax : binLayerConfig.manualMin;
            case 'IQR':
                return isMax ? ranges.iqr_max : ranges.iqr_min;
            case 'full':
            default:
                return isMax ? ranges.full_max : ranges.full_min;
        }
    }

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number, binLayerConfig: BinLayerOptions) {

        // TODO: this method is called thousands of times, ensure there are no wasteful calculations
        // TODO: normal calculation is not correct

        let value = f.get('value');
        let min = getRangeValue(binLayerConfig, false);
        let max = getRangeValue(binLayerConfig, true);
        let normal = (value - min) / (max - min);
        normal = Math.min(1, Math.max(0, normal));

        let scale = chroma.scale(binLayerConfig.colorScaleName);
        let steppedColors = scale.colors(binLayerConfig.numColorSteps);

        switch (binLayerConfig.binStyle) {

            // different sized hexagons
            case 'point': {
                let radius = Math.max(minRadius, Math.round(binLayerConfig.binSize / res + 0.5) * normal);
                return [
                    new Style({
                        image: new RegularShape({
                            points: 6,
                            radius: radius,
                            fill: new Fill({ color: [0, 0, 255] }),
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
                return [new Style({ fill: new Fill({ color: color }) })];
            }

            // smooth transition between colors
            case 'gradient':
            default: {
                let scaledColor = scale(normal);
                let color = scaledColor ? scaledColor : [0, 0, 255, normal] as any;
                return [new Style({ fill: new Fill({ color: color }) })];
            }
        }
    }

    // creates a new bin object
    function createBins(binLayerConfig: BinLayerOptions) {
        let bins: BinBase;
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
            }
        }

        findValueBounds(bins.getFeatures(), binLayerConfig);

        return bins;
    }

    // create and return a new bin layer
    function createBinLayer(binLayerConfig: BinLayerOptions) {

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
            source: new OSM({ url: url }),
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

        layerConfigs.forEach((layerConfig) => {
            let layer = layerForConfig(layerConfig, resetBinLayers);

            // update common layer properties
            layer.setZIndex(layerConfig.zIndex);
            layer.setOpacity(Number(layerConfig.opacity) / 100);
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
                // center: fromLonLat([-80, 40.440]), // Pittsburgh, PA
                center: fromLonLat([-98.303646, 39.869390]), // Burr Oak, KA (center of US-ish)
                zoom: 5,
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

        vectorSourceRef.current = new Vector({ features: features });
        refreshLayers(true);

    }, [features]);

    return (
        <div ref={mapContainerRef} className="map" />
    );
}
