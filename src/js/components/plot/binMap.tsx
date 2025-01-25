import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import 'ol/ol.css';
import "ol-ext/dist/ol-ext.css";
import './map.css';
import { Map } from 'ol';
// import TileLayer from 'ol/layer/Tile';
// import VectorLayer from 'ol/layer/Vector.js';
// import OSM from 'ol/source/OSM';
// import {Select} from 'ol/interaction';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
// import HexBin from 'ol-ext/source/HexBin';
// import GridBin from 'ol-ext/source/GridBin';
// import FeatureBin from 'ol-ext/source/FeatureBin';
import { Vector } from 'ol/source';
// import Fill from 'ol/style/Fill';
// import Style from 'ol/style/Style';
// import RegularShape from 'ol/style/RegularShape.js';
// import { SelectEvent } from 'ol/interaction/Select';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
// import VectorImageLayer from 'ol/layer/VectorImage';
// import Layer from 'ol/layer/Layer';
// import { data } from '../../data/us_pa_alleghaney_addresses';
// import { data } from '../../data/us_pa_addresses';
// import { data } from '../../data/us_addresses';
import { Projection } from 'ol/proj';
import chroma from 'chroma-js';
import GeoJSON from 'ol/format/GeoJSON';
// import BinBase from 'ol-ext/source/BinBase';
import { BinMapView } from './binMapView';
import Geometry from 'ol/geom/Geometry';
import { BaseLayerOptions, BinLayerOptions, TileLayerOptions } from './binMapLayerOptions';
import BinMapLayerControl from './binMapLayerControl';

// type MapProps = {
//     width: number;
//     height: number;
// };

const usStates = ['ak', 'al', 'ar', 'az', 'ca', 'co', 'ct', 'dc', 'de', 'fl', 'ga', 'hi', 'ia', 'id', 'il', 'in', 'ks', 'ky', 'la', 'ma', 'md', 'me', 'mi', 'mn', 'mo', 'ms', 'mt', 'nc', 'nd', 'ne', 'nh', 'nj', 'nm', 'nv', 'ny', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'va', 'vt', 'wa', 'wi', 'wv', 'wy'];

export function BinMap() {

    console.log("BinMap function called ...");

    const mapRef = useRef<Map>();
    const countySourceRef = useRef<VectorSource>();
    const [countyFeatureSource, setCountyFeatureSource] = useState<VectorSource>();
    const legendContainerRef = useRef(null);
    const [reloadState, setReloadState] = useState(false);

    const colorScaleInputRef = useRef(null);
    const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
    const defaultLayerConfigs = [
        {
            id: "tile_test",
            layerType: "tile",
            visible: true,
            opacity: 100,
            tileSourceUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        } as TileLayerOptions,
        {
            id: "bin_test",
            layerType: "bin",
            visible: true,
            opacity: 100,
            hexStyle: "pointy",
            binStyle: "hex",
            binType: "gradient",
            binSize: 30000,
            aggFuncName: "max",
            isVectorImage: true,
            numColorSteps: 5,
            colorScaleName: "viridis",
            intervalMin: 0,
            intervalMax: 30000,
            useManualInterval: false,
            useIQRInterval: true,
        } as BinLayerOptions,
        // {
        //     id: "bin_test2",
        //     layerType: "bin",
        //     visible: true,
        //     opacity: 50,
        //     hexStyle: "pointy",
        //     binStyle: "grid",
        //     binType: "gradient",
        //     binSize: 0.1,
        //     aggFuncName: "max",
        //     isVectorImage: true,
        //     numColorSteps: 5,
        //     colorScaleName: "viridis",
        //     intervalMin: 0,
        //     intervalMax: 30000,
        // } as BinLayerOptions, 
    ];
    const [layerConfigs, setLayerConfigs] = useState<BaseLayerOptions[]>(defaultLayerConfigs);

    const resSelectRef = useRef(null);
    const resEnabledRef = useRef({});
    const defaultEnabledStates = [...usStates];

    // handler method to add random features to the dataset
    function handleRandomFeaturesButton() {
        // if (!dataSourceRef.current) return;
        addRandomFeatures(5000);
    }

    // reset any randomly added features
    function handleResetFeaturesButton() {
        // if (!dataSourceRef.current) return;
        setFeatures([]);
        addPresetFeatures();
    }

    // create a set of features on seed points
    function addRandomFeatures(nb: any) {
        console.log(mapRef)
        if (!mapRef.current) return;

        let ssize = 20;		// seed size
        let ext = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
        let dx = ext[2] - ext[0];
        let dy = ext[3] - ext[1];
        let dl = Math.min(dx, dy);
        let randFeatures = [];

        for (let i = 0; i < nb / ssize; ++i) {
            let seed = [ext[0] + dx * Math.random(), ext[1] + dy * Math.random()]
            for (let j = 0; j < ssize; j++) {
                let f = new Feature(new Point([
                    seed[0] + dl / 10 * Math.random(),
                    seed[1] + dl / 10 * Math.random()
                ]));
                f.set('number', Math.floor(Math.random() * 10000));
                randFeatures.push(f);
            }
        }
        setFeatures((oldFeatures) => { return [...oldFeatures, ...randFeatures] });
    }

    // load features from preset data file
    // function addPresetFeatures(vectorSource: Vector) {
    function addPresetFeatures() {
        // if (!mapRef.current) return;

        // let features=[];
        // for (let row of data) {
        //     let coord = [row[0], row[1]];
        //     let f = new Feature(new Point(fromLonLat(coord)));
        //     f.set('number', row[2]);
        //     features.push(f);
        // }

        let baseUrl = 'https://lint.github.io/AggregatedAddresses/data/{dataset}/us/{state}/data.geojson';
        let dataset = resSelectRef.current ? (resSelectRef.current as HTMLInputElement).value : 'res-0.1';
        let urls = getEnabledStates().map(state => baseUrl.replace('{dataset}', dataset).replace('{state}', state.toLowerCase()));

        urls.forEach(url => {
            // console.log("getting url:", url)

            let loadUrl = async () => {
                let binSource = new Vector({
                    // url: '/data/us.pa.geojson',

                    url: url,
                    format: new GeoJSON(),
                    // loader: () => {
                    // }
                });

                // force source to load
                let view = mapRef.current?.getView();
                binSource.loadFeatures([0, 0, 0, 0], 0, view ? view.getProjection() : new Projection({ code: "EPSG:3857" }));

                binSource.on('featuresloadend', (e: VectorSourceEvent) => {
                    if (e.features) {
                        setFeatures((oldFeatures) => { return [...oldFeatures, ...e.features as Feature[]] });
                    }
                });
            };
            loadUrl();
        });
    }


    // returns the chroma js color scale for the currently selected input
    function getColorScale() {
        // let scaleName = optionsRef.current.colorScaleName;
        // TODO: better legend system now that you can have multiple bin layers
        let scaleName = 'viridis';
        let scale = chroma.scale(scaleName);
        return scale
    }

    // update legend colors
    // function refreshLegend() {
    //     if (!legendContainerRef.current) return;

    //     let gradient = (legendContainerRef.current as HTMLElement).querySelector(".gradient");
    //     if (!gradient) return;

    //     let numColorSteps = 5;
    //     let binStyle = 'gradient';

    //     let scale = getColorScale();
    //     let steppedColors = scale.colors(numColorSteps);

    //     gradient.innerHTML = "";

    //     // add grad-step span with the given color
    //     function addColor(color: string) {
    //         if (!gradient) return;
    //         let e = document.createElement('span');
    //         e.className="grad-step";
    //         e.style.backgroundColor = color;
    //         gradient.append(e);
    //     }

    //     // created stepped color legend
    //     if (binStyle == 'color') {
    //         for (let i = 0; i < 100; i++) {
    //             addColor(steppedColors[Math.floor(i / 100 * (numColorSteps))]);
    //         }

    //     // create smooth gradient legend
    //     } else {
    //         scale.colors(100).forEach((color) => addColor(color));
    //     }
    // }

    function handleMapRefFromView(map: Map) {
        mapRef.current = map;
    }

    function handleLayerControlChange(updatedLayerConfig: BaseLayerOptions) {

        setLayerConfigs((oldLayerConfigs) => {

            for (let i = 0; i < oldLayerConfigs.length; i++) {
                let layerConfig = oldLayerConfigs[i];
                if (layerConfig.id === updatedLayerConfig.id) {

                    let newLayerConfigs = [...oldLayerConfigs];
                    newLayerConfigs[i] = updatedLayerConfig;
                    return newLayerConfigs;
                }
            }

            return oldLayerConfigs;
        });
    }

    function handlePrintExtentButton() {
        if (!mapRef.current) return;
        let map = mapRef.current;

        console.log(map.getView().calculateExtent(map.getSize()));
    }

    function getStateEnabled(stateName: string) {
        let val = (resEnabledRef.current as any)[stateName];
        if (val !== undefined) {
            return val;
        }
        return defaultEnabledStates.indexOf(stateName) > -1;
    }

    function setStateEnabled(stateName: string, enabled: boolean) {
        // console.log("setStateEnabled", stateName, enabled);
        (resEnabledRef.current as any)[stateName] = enabled;
    }

    function getEnabledStates() {
        let enabledStates = [];
        // console.log(defaultEnabledStates)
        // console.log(resEnabledRef.current)
        for (let state in resEnabledRef.current) {
            if (getStateEnabled(state)) {
                enabledStates.push(state);
            }
        }
        return enabledStates;
    }

    // handle change in user checkbox input
    function handleStateCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
        if (!e || !e.target) return;

        const { name, checked } = e.target;
        setStateEnabled(name, checked);
        handleResetFeaturesButton();
    }

    function handleSelectAllStates() {
        for (let state of usStates) {
            setStateEnabled(state, true);
        }
        setFeatures([]);
        setReloadState(!reloadState);
        addPresetFeatures();
    }

    function handleClearAllStates() {
        for (let state of usStates) {
            setStateEnabled(state, false);
        }
        setFeatures([]);
        setReloadState(!reloadState);
        addPresetFeatures();
    }

    useEffect(() => {

        // set the default scale
        if (colorScaleInputRef.current) {
            let colorScaleSelect = colorScaleInputRef.current as HTMLInputElement;
            colorScaleSelect.value = 'Viridis'; // TODO: make this dynamic
        }

        for (let state of usStates) {
            setStateEnabled(state, defaultEnabledStates.indexOf(state) > -1);
        }

        addPresetFeatures();

        // load US county data source
        let binSource = new Vector({
            url: '/data/counties.geojson',
            format: new GeoJSON(),
            // loader: () => {
            // }
        });
        countySourceRef.current = binSource;
        setCountyFeatureSource(binSource);

        // force source to load
        let view = mapRef.current?.getView();
        binSource.loadFeatures([0, 0, 0, 0], 0, view ? view.getProjection() : new Projection({ code: "EPSG:3857" }));
        // console.log(binSource.getFeatures())

    }, []);

    // useEffect(() => {
    //     refreshLegend();
    // }, [options.colorScaleName, options.binStyle, options.numColorSteps]);

    return (
        <div className='map-container'>
            <div className='map-settings'>
                {layerConfigs.map(layerConfig => (
                    <BinMapLayerControl config={layerConfig} callback={handleLayerControlChange} key={layerConfig.id} />
                ))}
                <div ref={legendContainerRef} className="legend-container">
                    <div className="gradient">
                        {getColorScale().colors(100).map((color, index) => (
                            <span className="grad-step" key={index} style={{ backgroundColor: color }}></span>
                        ))}
                    </div>
                </div>
                <div>
                    <button onClick={handleRandomFeaturesButton}>Add Random Features</button>
                    <button onClick={handleResetFeaturesButton}>Reset Features</button>
                    <button onClick={handlePrintExtentButton}>Print Extent</button>
                </div>
                <div>
                    <label htmlFor="TODO-MOVE-state-chkboxes">Load States:</label>
                    <div id="TODO-MOVE-state-chkboxes">
                        {
                            usStates.map((state) => {
                                let displayName = state.toUpperCase();
                                return (
                                    <span style={{ display: 'inline-block', width: '50px' }} key={"input-" + state}>
                                        <input id={"load-state-" + state} name={state} type="checkbox" onChange={handleStateCheckboxChange} defaultChecked={getStateEnabled(state)} />
                                        <label htmlFor={"load-state-" + state} >{displayName}</label>
                                    </span>
                                );
                            })
                        }
                    </div>
                    <label htmlFor="TODO-MOVE-res-size-input">Data Resolution:</label>
                    <select id="TODO-MOVE-res-size-input" name="TODO-MOVE-res-size-input" defaultValue="res-0.5" ref={resSelectRef} onChange={handleResetFeaturesButton}>
                        <option value="res-0.01">res-0.01</option>
                        <option value="res-0.05">res-0.05</option>
                        <option value="res-0.1">res-0.1</option>
                        <option value="res-0.5">res-0.5</option>
                        <option value="res-1">res-1</option>
                        <option value="res-5">res-5</option>
                    </select>
                    <button onClick={handleSelectAllStates}>Select All</button>
                    <button onClick={handleClearAllStates}>Clear All</button>
                </div>
            </div>
            <BinMapView features={features} layerConfigs={layerConfigs} mapCallback={handleMapRefFromView} featureBinSource={countyFeatureSource} />
        </div>
    );
}
