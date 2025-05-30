import chroma from 'chroma-js';
import { Map, View } from 'ol';
import "ol-ext/dist/ol-ext.css";
import BinBase from 'ol-ext/source/BinBase';
import FeatureBin from 'ol-ext/source/FeatureBin';
import GridBin from 'ol-ext/source/GridBin';
import HexBin from 'ol-ext/source/HexBin';
import Geocoder from 'ol-geocoder';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import FullScreen from 'ol/control/FullScreen.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import Feature, { FeatureLike } from 'ol/Feature.js';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point.js';
import HeatmapLayer from 'ol/layer/Heatmap.js';
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
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import React, { useEffect, useRef, useState } from 'react';
import downloadFileFromURL from '../../util/download';
import styles from './Map.module.css';
import { BaseLayerOptions, BinLayerOptions, BinRange, getBackgroundColor, getRangeValue, HeatmapLayerOptions, LayerDisplayInfoSet, TileLayerOptions } from './MapOptions';
import Legend from './ViewControls/Legend';
import { ExportMapControl, ToggleLegendControl, ToggleScaleLineControl } from './ViewControls/ViewControls';
import './ViewControls/ViewControls.css';

export interface MapViewProps {
    features: { [key: string]: VectorSource };
    regionSources: { [key: string]: VectorSource };
    layerConfigs: BaseLayerOptions[];
    rangesCallback: (binLayerRanges: LayerDisplayInfoSet) => void;
};

export function MapView({ features, layerConfigs, regionSources, rangesCallback }: MapViewProps) {

    // console.log("BinMapView called ...");

    const mapRef = useRef<Map>();
    const mapContainerRef = useRef(null);
    const minRadius = 1; // minimum radius used for 'point' hex style
    const layersRef = useRef({} as any); // maps id => layer object
    const prevLayerConfigs = useRef(layerConfigs); // stores previous version of layerConfigs for later comparision
    const optionsTriggeringReload = ['layerClass', 'binSize', 'binType', 'hexStyle', 'aggFuncName', 'useIQRInterval', 'featureSourceUrl', 'dataTag'];
    const binMaxesRef = useRef<LayerDisplayInfoSet>({});
    const [legendVisible, setLegendVisible] = useState(false);
    const [scaleLineVisible, setScaleLineVisible] = useState(true);
    let scaleLineRef = useRef<ScaleLine>();

    const selectedFeatureInfoRef = useRef<HTMLDivElement>(null);
    const selectedFeatureRef = useRef<FeatureLike>();
    const selectStyle = new Style({
        fill: new Fill({
            color: '#eeeeee',
        }),
        stroke: new Stroke({
            color: 'rgba(255, 255, 255, 1.0)',
            width: 2,
        }),
    });

    function updateSelectedFeature(feature: any, pixel: any) {

        if (!selectedFeatureInfoRef.current) return;
        if (feature) {
            selectStyle.getFill()?.setColor(feature.get('color') || '#eeeeee');
            (feature as Feature).setStyle(selectStyle);
            selectedFeatureInfoRef.current.style.left = pixel[0] + 10 + 'px';
            selectedFeatureInfoRef.current.style.top = pixel[1] + 'px';
            selectedFeatureInfoRef.current.innerText = feature.get('value');
            selectedFeatureInfoRef.current.style.visibility = 'visible';
        } else {
            selectedFeatureInfoRef.current.style.visibility = 'hidden';
        }
        selectedFeatureRef.current = feature;
    };

    function sourceForDataTag(dataTag: string) {
        if (dataTag in features) {
            return features[dataTag];
        }
        return new Vector();
    }

    // // handle selection of a feature
    // function handleFeatureSelect(event: SelectEvent) {
    //     if (event.selected.length) {
    //         let f = event.selected[0];
    //         console.log("BinMap selected: ", f);
    //         // console.log(`min=${f.get('min')} max=${f.get('max')} avg=${f.get('avg')} sum=${f.get('sum')} len=${f.get('len')}`);
    //         console.log("value:", f.get('value'));
    //     } else {
    //         // did not select a feature
    //         console.log("BinMap did not select feature");
    //     }
    // }

    // find the minimum and maximum values in a given feature set
    function findValueBounds(features: Feature<Geometry>[], aggFuncName: string, layerId: string) {
        if (!features || features.length == 0) return;

        console.log("BinMapView findValueBounds ...");
        console.log("num features:", features.length)

        let values: number[] = [];

        // calculate the value for every feature
        for (let f of features) {
            let fs = f.get('features');
            if (!fs) fs = [f];

            // get list of values for the bins
            let numbers = fs.map((ff: Feature<Geometry>) => {

                let aggNum = ff.get(aggFuncName);
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
            switch (aggFuncName) {
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

        let ranges: BinRange = {
            full_min: min,
            full_max: max,
            iqr_min: minFence,
            iqr_max: maxFence
        };
        binMaxesRef.current[layerId] = { binRanges: ranges };
        rangesCallback({ ...binMaxesRef.current });
    }

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number, binLayerConfig: BinLayerOptions) {

        // TODO: this method is called thousands of times, ensure there are no wasteful calculations
        // TODO: normal calculation is not correct

        // when you switch to custom for the first time everything is one color, this is because you have not set a value. when you switch agg fun you should also set the custom amount to the full amount? hmm or do you want to set it b
        // make the interval slider a scale of 0 to 1 and then calc the normal from values from that
        let ranges = binMaxesRef.current[binLayerConfig.id].binRanges;
        let value = f.get('value');
        let min = getRangeValue(binLayerConfig, ranges!, false);
        let max = getRangeValue(binLayerConfig, ranges!, true);
        let normal = 0;
        if (value !== min && max !== min) normal = (value - min) / (max - min);
        normal = Math.min(1, Math.max(0, normal));
        // console.log(`value: ${value}, min: ${min}, max: ${max}, normal: ${normal}`)

        let scale = chroma.scale(binLayerConfig.colorScaleName);
        let steppedColors = scale.colors(binLayerConfig.numColorSteps);

        switch (binLayerConfig.colorMode) {

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
            case 'step': {
                let index = Math.floor(normal * (binLayerConfig.numColorSteps - 1));
                let color = steppedColors[index];
                (f as Feature).set('color', color);
                return [new Style({ fill: new Fill({ color: color }) })];
            }

            // smooth transition between colors
            case 'gradient':
            default: {
                let scaledColor = scale(normal);
                let color = scaledColor ? scaledColor : [0, 0, 255, normal] as any;
                (f as Feature).set('color', color);
                return [new Style({
                    fill: new Fill({ color: color }),
                    // stroke: new Stroke({
                    //     width: 0,
                    // }),
                })];
            }
        }
    }

    // creates a new bin object
    function createBins(binLayerConfig: BinLayerOptions) {
        let source = sourceForDataTag(binLayerConfig.dataTag);
        let bins: BinBase;
        switch (binLayerConfig.binType) {
            case "grid": {
                bins = new GridBin({
                    source: source,
                    size: Number(binLayerConfig.binSize),
                    listenChange: false,
                } as any);
                break;
            }
            case "feature": {
                bins = new FeatureBin({
                    source: source,
                    binSource: regionSources[binLayerConfig.featureSourceUrl],
                    listenChange: false,
                } as any);
                break;
            }
            case "hex":
            default: {
                bins = new HexBin({
                    source: source,
                    size: Number(binLayerConfig.binSize),
                    layout: binLayerConfig.hexStyle as any,
                    listenChange: false,
                } as any);
            }
        }

        findValueBounds(bins.getFeatures(), binLayerConfig.aggFuncName, binLayerConfig.id);

        return bins;
    }

    // create and return a new bin layer
    function createBinLayer(binLayerConfig: BinLayerOptions) {

        console.log("creating new bin layer", binLayerConfig.binType, binLayerConfig.layerClass);

        let vClass = binLayerConfig.layerClass === 'VectorImage' ? VectorImageLayer : VectorLayer;
        const binLayer = new vClass({
            source: createBins(binLayerConfig),
            opacity: Number(binLayerConfig.opacity) / 100,
            style: (f: FeatureLike, res: number) => styleForBin(f, res, binLayerConfig),
            background: getBackgroundColor(binLayerConfig)
        });

        return binLayer;
    }

    // create and return a new tile layer
    function createTileLayer(tileLayerConfig: TileLayerOptions) {

        console.log("creating new tile layer", tileLayerConfig);

        const tileLayer = new TileLayer({
            source: new OSM({ url: tileLayerConfig.sourceType === 'base' ? tileLayerConfig.baseSourceUrl : tileLayerConfig.overlaySourceUrl }),
            // preload: Infinity 
            preload: 1,
            opacity: Number(tileLayerConfig.opacity) / 100,

        });
        return tileLayer;
    }

    // create and return a new heatmap layer
    function createHeatmapLayer(heatmapLayerConfig: HeatmapLayerOptions) {

        console.log("creating new heatmap layer", heatmapLayerConfig);

        const heatmapLayer = new HeatmapLayer({
            source: sourceForDataTag(heatmapLayerConfig.dataTag),
            blur: heatmapLayerConfig.blur,
            radius: heatmapLayerConfig.radius,
            opacity: Number(heatmapLayerConfig.opacity) / 100,
            weight: (feature) => {
                let value = 1;
                let binRange = binMaxesRef.current[heatmapLayerConfig.id].binRanges
                let min = binRange ? binRange.full_min : 0;
                let max = binRange ? binRange.full_max : 0;
                value = (feature.get(heatmapLayerConfig.aggFuncName) - min) / (max - min);
                return value;
            },
            gradient: chroma.scale(heatmapLayerConfig.colorScaleName).colors(heatmapLayerConfig.numColorSteps),
        });

        return heatmapLayer;
    }

    // get the layer associated witht the given layer config
    function layerForConfig(layerConfig: BaseLayerOptions, resetDataLayers: boolean) {

        if (!layerConfig) return;

        let layer = layersRef.current[layerConfig.id];
        if (layer && resetDataLayers) {

            if (layerConfig.layerType === 'bin') {
                mapRef.current?.removeLayer(layer);
                layer = undefined;

            } else if (layerConfig.layerType === 'heatmap') {
                layer.setMap(null);
                layer.setSource(null);
                layer = undefined;
            }
        }

        // make new layer if it does not exist
        if (!layer) {

            if (layerConfig.layerType === "bin") {
                layer = createBinLayer(layerConfig as BinLayerOptions);
            } else if (layerConfig.layerType === "tile") {
                layer = createTileLayer(layerConfig as TileLayerOptions);
            } else if (layerConfig.layerType === "heatmap") {
                layer = createHeatmapLayer(layerConfig as HeatmapLayerOptions);
            }
            layersRef.current[layerConfig.id] = layer;

            // continue if could not create layer
            if (!layer) return;

            if (layerConfig.layerType === 'heatmap') {
                layer.setMap(mapRef.current);
            } else {
                mapRef.current?.addLayer(layer);
            }
        }

        return layer;
    }

    // set layer properties according to layerConfigs
    function refreshLayers(resetBinLayers: boolean) {

        console.log("BinMapView refreshLayers", resetBinLayers);

        layerConfigs.forEach((layerConfig) => {
            let layer = layerForConfig(layerConfig, resetBinLayers);
            // if (!layer) return;

            // update common layer properties
            layer.setZIndex(layerConfig.zIndex);
            layer.setOpacity(Number(layerConfig.opacity) / 100);
            layer.setVisible(layerConfig.visible);

            // update tile layer properties
            if (layerConfig.layerType === "tile") {
                let tileLayerConfig = layerConfig as TileLayerOptions;

                let osmSource = layer.getSource() as OSM;
                osmSource.setUrl(tileLayerConfig.sourceType === 'base' ? tileLayerConfig.baseSourceUrl : tileLayerConfig.overlaySourceUrl);

                // update heatmap layer properties 
            } else if (layerConfig.layerType === 'heatmap') {
                let heatmapLayerConfig = layerConfig as HeatmapLayerOptions;

                layer.setRadius(heatmapLayerConfig.radius);
                layer.setBlur(heatmapLayerConfig.blur);
                layer.setBackground(getBackgroundColor(heatmapLayerConfig));
                // layer.setSource(vectorSourceRef.current);

                layer.setGradient(chroma.scale(heatmapLayerConfig.colorScaleName).colors(Math.max(2, heatmapLayerConfig.numColorSteps)));

                if (resetBinLayers) {
                    findValueBounds(sourceForDataTag(heatmapLayerConfig.dataTag).getFeatures(), heatmapLayerConfig.aggFuncName, heatmapLayerConfig.id);
                }

                // layer.changed();

                // update bin layer properties
            } else if (layerConfig.layerType === "bin") {
                let binLayerConfig = layerConfig as BinLayerOptions;

                // recreate the syling function so options are refreshed
                layer.setStyle((f: FeatureLike, res: number) => styleForBin(f, res, binLayerConfig));
                layer.setBackground(getBackgroundColor(binLayerConfig));

                // update hexbin style (point or flat)
                if (binLayerConfig.binType === "hex") {
                    let hexBin = layer.getSource() as HexBin;

                    // recalculate bins if layout style changed
                    if (hexBin.getLayout() as any !== binLayerConfig.hexStyle) {
                        hexBin.setLayout(binLayerConfig.hexStyle as any, false);
                        findValueBounds(hexBin.getFeatures(), binLayerConfig.aggFuncName, binLayerConfig.id);
                    }
                }
            }
        });

        let currIds = layerConfigs.map(config => config.id);
        let prevIds = prevLayerConfigs.current ? prevLayerConfigs.current.map(config => config.id) : [];

        for (let prevId of prevIds) {
            if (currIds.indexOf(prevId) > -1) continue;
            let layer = layersRef.current[prevId];
            layersRef.current[prevId] = undefined;

            console.log(`removing layer id: ${prevId} ...`);
            mapRef.current?.removeLayer(layer);
        }
    }

    // https://openlayers.org/en/latest/examples/export-map.html
    function exportMapToPNG() {
        if (!mapRef.current) return;
        const map = mapRef.current;
        map.once('rendercomplete', function () {
            const mapCanvas = document.createElement('canvas');
            const size = map.getSize();
            mapCanvas.width = size![0];
            mapCanvas.height = size![1];
            const mapContext = mapCanvas.getContext('2d');
            Array.prototype.forEach.call(
                map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'), canvas => {
                    if (canvas.width <= 0) return;

                    const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
                    mapContext!.globalAlpha = opacity === '' ? 1 : Number(opacity);
                    let matrix;
                    const transform = canvas.style.transform;
                    if (transform) {
                        matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
                    } else {
                        matrix = [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
                    }
                    CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix,);
                    const backgroundColor = canvas.parentNode.style.backgroundColor;
                    if (backgroundColor) {
                        mapContext!.fillStyle = backgroundColor;
                        mapContext!.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    mapContext!.drawImage(canvas, 0, 0);
                },
            );
            mapContext!.globalAlpha = 1;
            mapContext!.setTransform(1, 0, 0, 1, 0, 0);
            let url = mapCanvas.toDataURL();
            downloadFileFromURL(url);
        });
        map.renderSync();
    }

    // called when component has mounted
    useEffect(() => {
        console.log("BinMapView useEffect ...");

        // TODO: fixed the issue where tile layer is gone when navigating to page, but now i don't think i'm cleaning things up properly
        if (!mapContainerRef.current || mapRef.current) return;

        // initialize the map object
        const map = new Map({
            view: new View({
                // center: fromLonLat([-80, 40.440]), // Pittsburgh, PA
                center: fromLonLat([-100.303646, 39.869390]), // Burr Oak, KA (center of US-ish)
                zoom: 4.5,
            }),
            layers: [],
            target: mapContainerRef.current,
            controls: defaultControls().extend([
                new ToggleLegendControl(() => {
                    setLegendVisible(oldVisible => !oldVisible);
                }, {}),
                new ToggleScaleLineControl(() => {
                    setScaleLineVisible(oldVisible => !oldVisible);
                }, {}),
                new ExportMapControl(() => {
                    exportMapToPNG();
                }, {}),
                new Geocoder('nominatim', {
                    provider: 'osm',
                    lang: 'en-US',
                    placeholder: 'Search for ...',
                    limit: 5,
                    keepOpen: false,
                }) as any,
                new FullScreen()
            ]),
        });
        mapRef.current = map;

        // add selection handler to the map
        // let select = new Select();
        // map.addInteraction(select);
        // select.on('select', handleFeatureSelect);

        map.on('pointermove', function (e) {

            function resetSelected() {
                if (selectedFeatureInfoRef.current) selectedFeatureInfoRef.current.style.visibility = 'hidden';
                if (selectedFeatureRef.current) (selectedFeatureRef.current as Feature).setStyle(undefined);
                selectedFeatureRef.current = undefined;
            }

            if (e.dragging) {
                resetSelected();
                return;
            }

            if (selectedFeatureRef.current) {
                resetSelected();
            }

            map.forEachFeatureAtPixel(e.pixel, function (f: FeatureLike) {
                updateSelectedFeature(f, e.pixel);
                return true;
            });
        });

        // return () => map.setTarget('');
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!scaleLineRef.current) {
            const scaleLine = new ScaleLine({ minWidth: 125, className: `${styles.scale} ol-scale-line` });
            scaleLineRef.current = scaleLine;
        }
        if (scaleLineVisible) {
            mapRef.current.addControl(scaleLineRef.current);
        } else {
            mapRef.current.removeControl(scaleLineRef.current);
        }
    }, [scaleLineVisible]);

    useEffect(() => {
        let searchControl = document.getElementById('gcd-button-control');
        if (searchControl) {
            searchControl.title = 'Search for Location';
        }
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

        refreshLayers(shouldRecreateLayers);
        prevLayerConfigs.current = layerConfigs;

    }, [layerConfigs]);

    useEffect(() => {
        console.log("BinMapView useEffect features changed");
        refreshLayers(true);
    }, [features, regionSources]);

    return (<>
        <div ref={mapContainerRef} className={styles.map}>
            <div ref={selectedFeatureInfoRef} className={styles.selectedFeatureInfo}></div>
            <Legend layerConfigs={layerConfigs} layerDisplayInfo={binMaxesRef.current} visible={legendVisible} scaleVisible={scaleLineVisible} />
        </div>
    </>
    );
}
