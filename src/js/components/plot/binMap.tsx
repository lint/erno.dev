import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
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
// import { data } from '../../data/us_pa_alleghaney_addresses';
// import { data } from '../../data/us_pa_addresses';
import { data } from '../../data/us_addresses';
import { fromLonLat, Projection } from 'ol/proj';
import chroma from 'chroma-js';
import GeoJSON from 'ol/format/GeoJSON';
import BinBase from 'ol-ext/source/BinBase';
import { BinMapView, BinMapViewOptions } from './binMapView';
import Geometry from 'ol/geom/Geometry';

// type MapProps = {
//     width: number;
//     height: number;
// };

export function BinMap() {

    console.log("BinMap function called ...");

    const mapRef = useRef<Map>();
    const mapContainerRef = useRef(null);
    const binLayerRef = useRef<Layer>();
    const tileLayerRef = useRef<Layer>();
    const dataSourceRef = useRef<VectorSource>();
    const countySourceRef = useRef<VectorSource>();
    const binsRef = useRef<BinBase>();
    const legendContainerRef = useRef(null);
    let wasImageLayerUsed = true;
    const minRadius = 1;
    const [maxValue_s, setMaxValue_s] = useState(100);
    const maxValueRef = useRef(100);

    const colorScaleInputRef = useRef(null);
    const intervalMaxInputRef = useRef(null);
    const [features, setFeatures] = useState<Feature<Geometry>[]>([]);

    const [layers, setLayers] = useState<Layer[]>([]);

    const [options, setOptions] = useState<BinMapViewOptions>({
        tileLayerVisible: true,
        binLayerVisible: true,
        binLayerIsVectorImage: true,
        binLayerBackgroundEnabled: false,
        hexStyle: "pointy",
        binStyle: "gradient", // TODO: this value won't change in styles function??? not sure why since the options object in the method that calls it shows the correct value ...
        binType: "hex",
        binSize: 1000,
        aggFuncName: "max",
        tileSourceUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        numColorSteps: 5,
        colorScaleName: "viridis",
        intervalMin: 0,
        intervalMax: 30000,
        binLayerOpacity: 85,
        tileLayerOpacity: 100,
    });
    const optionsRef = useRef(options);


    // handle change in user checkbox input
    function handleCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
        if (!e || !e.target) return;

        const {name, checked} = e.target;
        console.log("BinMap handle change: ", name, checked);

        let op = optionsRef.current ? optionsRef.current : options;
        let newOptions = {...op, [name]: checked};
        optionsRef.current = newOptions;
        setOptions(newOptions);
    }

    // handle change in user value input
    function handleValueChange(e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> ) {
        if (!e || !e.target) return;

        const {name, value} = e.target;
        console.log("BinMap handle change: ", name, value);

        // TODO: check if number input field so that you can convert to Number

        // setOptions((prevOptions) => ({ ...prevOptions, [name]: value }));
        let op = optionsRef.current ? optionsRef.current : options;
        let newOptions = {...op, [name]: value};
        optionsRef.current = newOptions;
        setOptions(newOptions);

        // console.log('new options: ', newOptions)
    }
    
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

    // handler method to add random features to the dataset
    function handleRandomFeaturesButton() {
        // if (!dataSourceRef.current) return;

        // addRandomFeatures(5000, dataSourceRef.current);
        addRandomFeatures(5000);
        // reloadMap();
    }

    // reset any randomly added features
    function handleResetFeaturesButton() {
        // if (!dataSourceRef.current) return;


        // addPresetFeatures(dataSourceRef.current);
        // reloadMap();
        setFeatures([]);
        addPresetFeatures();
    }

    // create a set of features on seed points
    function addRandomFeatures(nb: any/*, vectorSource: Vector*/) {
        console.log(mapRef)
        if (!mapRef.current) return;

        let ssize = 20;		// seed size
        let ext = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
        let dx = ext[2]-ext[0];
        let dy = ext[3]-ext[1];
        let dl = Math.min(dx,dy);
        let randFeatures=[];

        for (let i=0; i<nb/ssize; ++i){
            let seed = [ext[0]+dx*Math.random(), ext[1]+dy*Math.random()]
            for (let j=0; j<ssize; j++){
                let f = new Feature(new Point([
                    seed[0] + dl/10*Math.random(),
                    seed[1] + dl/10*Math.random()
                ]));
                f.set('number', Math.floor(Math.random() * 10000));
                randFeatures.push(f);
            }
        }
        // vectorSource.clear(true);
        // vectorSource.addFeatures(randFeatures);
        setFeatures((oldFeatures) => {return [...oldFeatures, ...randFeatures]});
        // setFeatures([]);
    }

    // load features from preset data file
    // function addPresetFeatures(vectorSource: Vector) {
    function addPresetFeatures() {
        // if (!mapRef.current) return;

        let features=[];

        for (let row of data) {
            let coord = [row[0], row[1]];
            let f = new Feature(new Point(fromLonLat(coord)));
            f.set('number', row[2]);
            features.push(f);
        }

        // vectorSource.clear(true);
        // vectorSource.addFeatures(features);
        setFeatures((oldFeatures) => {return [...oldFeatures, ...features]});
    }

    // returns the chroma js color scale for the currently selected input
    function getColorScale() {
        let scaleName = optionsRef.current.colorScaleName;
        let scale = chroma.scale(scaleName);
        return scale
    }

    // determine style for the given bin (f=feature, res=resolutuion)
    // function styleForBin(f: FeatureLike, res: number) {

    //     let value = f.get('value');
    //     // console.log(maxValueRef.current)
    //     let normal = Math.min(1, value/maxValueRef.current);
        
    //     let numSteps = optionsRef.current.numColorSteps;
    //     let size = optionsRef.current.binSize;
    //     let scale = getColorScale();
    //     let steppedColors = scale.colors(numSteps);

    //     switch (optionsRef.current.binStyle) {

    //     // different sized hexagons
    //     case 'point': {
    //         let radius = Math.max(minRadius, Math.round(size/res + 0.5) * normal);
    //         return [ new Style({
    //             image: new RegularShape({
    //                 points: 6,
    //                 radius: radius,
    //                 fill: new Fill({ color: [0,0,255] }),
    //                 rotateWithView: true
    //                 }),
    //                 geometry: new Point(f.get('center'))
    //             })
    //             // , new Style({ fill: new Fill({color: [0,0,255,.1] }) })
    //         ];
    //     }

    //     // sharp transition between colors
    //     case 'color': {
    //         let index = Math.floor(normal * (numSteps - 1));
    //         let color = steppedColors[index];
    //         return [ new Style({ fill: new Fill({ color: color }) }) ];
    //     }

    //     // smooth transition between colors
    //     case 'gradient':
    //     default: {
    //         let scaledColor = scale(normal);
    //         let color = scaledColor ? scaledColor : [0, 0, 255, normal] as any;
    //         return [ new Style({ fill: new Fill({ color: color }) }) ];
    //     }}
    // }

    // // create and return a new hex bin object
    // function createHexBin(vectorSource: Vector) {
        
    //     // init and calculate the bins
    //     const hexbin = new HexBin({
    //         source: vectorSource,
    //         size: options.binSize,
    //         layout: options.hexStyle as any
    //     });
    //     binsRef.current = hexbin;

    //     // determine the highest and lowest values across all bins
    //     findValueBounds(hexbin.getFeatures());

    //     return hexbin;
    // }

    // // create and return a new grid bin object
    // function createGridBin(vectorSource: Vector) {

    //     // init and calculate the bins
    //     const gridBin = new GridBin({
    //         source: vectorSource,
    //         size: Number(options.binSize),
    //     });
    //     binsRef.current = gridBin;
    //     // gridBin.getSource().set('gridProjection', 'EPSG:'+3857);

    //     // determine the highest and lowest values across all bins
    //     findValueBounds(gridBin.getFeatures());

    //     return gridBin;
    // }

    // // create and return a new feature bin object
    // function createFeatureBin(vectorSource: Vector) {

    //     // init and calculate bins
    //     const featureBin = new FeatureBin({
    //         source: vectorSource,
    //         binSource: countySourceRef.current
    //     });
    //     binsRef.current = featureBin;

    //     // determine the highest and lowest values across all bins
    //     findValueBounds(featureBin.getFeatures());
    //     // featureBin.addEventListener('change', () => {
    //     //     if (binsRef.current && binsRef.current === featureBin) {
    //     //         findValueBounds(binsRef.current.getFeatures());
    //     //     }
    //     // })      

    //     return featureBin;
    // }

    // // find the minimum and maximum values in a given feature set
    // function findValueBounds(features: FeatureLike[]) {
    //     if (!features || features.length == 0) return;

    //     console.log("BinMap findValueBounds ...");

    //     // reset current values
    //     maxValueRef.current = Number.MIN_SAFE_INTEGER;

    //     // get current aggregation function
    //     let mode = options.aggFuncName;

    //     // calculate the value for every feature
    //     for (let f of features) {
    //         let fs = f.get('features');
    //         let fMax = Number.MIN_SAFE_INTEGER;
    //         let sum = 0;
    //         let value = 0;
           
    //         // do not need to iterate over data points for length
    //         if (mode !== 'len') {
    //             for (let ff of fs) {
    //                 let n = ff.get('number');
    //                 sum += n;
    //                 if (n>fMax) fMax = n;
    //             }
    //         }

    //         // set the value based on the current mode
    //         switch (mode) {
    //         case 'len':
    //             value = fs.length;
    //             break;
    //         case 'avg':
    //             value = sum / fs.length;
    //             break; 
    //         case 'sum':
    //             value = sum;
    //             break;
    //         case 'max':
    //         default:
    //             value = fMax;
    //         }

    //         (f as Feature).set('value', value, true);
    //         if (value>maxValueRef.current) maxValueRef.current = value;
    //     }

    //     // set new min/max by clipping ends (TODO: why?)
    //     maxValueRef.current = Math.min(Math.round(maxValueRef.current - maxValueRef.current/4), 30000);

    //     // update interval min and max fields
    //     // if (intervalMinInputRef.current) {
    //     //     let minInput = intervalMinInputRef.current as HTMLInputElement;
    //     //     minInput.value = String(minValue);
    //     // }
    //     if (intervalMaxInputRef.current) {
    //         let maxInput = intervalMaxInputRef.current as HTMLInputElement;
    //         maxInput.value = String(maxValueRef.current);
    //     }
    // }

    // reload fast visuals
    function refresh() {

        // // set bin layer background color
        // if (options.binLayerBackgroundEnabled) {
        //     let scale = getColorScale();
        //     binLayerRef.current?.setBackground(scale(0).alpha(binLayerRef.current.getOpacity()).darken().name());
        // } else {
        //     binLayerRef.current?.setBackground();
        // }

        // // set opacity
        // binLayerRef.current?.setOpacity(Number(options.binLayerOpacity)/100);
        // tileLayerRef.current?.setOpacity(Number(options.tileLayerOpacity)/100);

        // // set enabled
        // tileLayerRef.current?.setVisible(options.tileLayerVisible);
        // binLayerRef.current?.setVisible(options.binLayerVisible);

        // // update tile layer url
        // let osmSource = tileLayerRef.current?.getSource() as OSM;
        // osmSource.setUrl(options.tileSourceUrl);

        // refresh legend
        refreshLegend();

        // set manually
        // minValue = Number(options.intervalMin);
        // maxValueRef.current = Number(options.intervalMax);

        // if (binsRef.current) binsRef.current.changed();
    }

    // reload map on enter press on input fields
    function handleKeyDown(event: any) {
        if (event.key === 'Enter') {
            // reloadMap();
        }
    }

    // reset, calculate, and display updated hexbins
    // function reloadMap() {
    //     console.log("BinMap reloading map ...");
    //     if (!mapRef.current || !dataSourceRef.current) return;
        
    //     // group data points into bins
    //     let bins;
    //     if (options.binType == 'grid') {
    //         bins = createGridBin(dataSourceRef.current);
    //     } else if (options.binType == 'feature') {
    //         bins = createFeatureBin(dataSourceRef.current);
    //     } else {
    //         bins = createHexBin(dataSourceRef.current);
    //     }

    //     // update bin layer source
    //     if (binLayerRef.current) binLayerRef.current.setSource(bins);

    //     // create new layer to display the bins if necessary
    //     if (!binLayerRef.current || wasImageLayerUsed != options.binLayerIsVectorImage) {
    //         console.log("BinMap creating bin layer")
    //         wasImageLayerUsed = options.binLayerIsVectorImage;

    //         // remove the previous bin layer if there is one
    //         if (binLayerRef.current) mapRef.current.removeLayer(binLayerRef.current);

    //         let vClass = options.binLayerIsVectorImage ? VectorImageLayer : VectorLayer;
    //         let opacity = Number(options.binLayerOpacity) / 100;

    //         const binLayer = new vClass({ 
    //             source: bins, 
    //             opacity: opacity,
    //             style: styleForBin,
    //         });
    //         binLayerRef.current = binLayer;
    //         mapRef.current.addLayer(binLayer);
    //         let newLayers = [];
    //         if (tileLayerRef.current) {
    //             newLayers.push(tileLayerRef.current);
    //         }
    //         newLayers.push(binLayer);
    //         setLayers(newLayers);
    //     }

    //     // refresh visual updates
    //     refresh();
    // }
    
    // update legend colors
    function refreshLegend() {
        if (!legendContainerRef.current) return;

        let gradient = (legendContainerRef.current as HTMLElement).querySelector(".gradient");
        if (!gradient) return;

        let scale = getColorScale();
        let steppedColors = scale.colors(options.numColorSteps);
    
        gradient.innerHTML = "";

        // add grad-step span with the given color
        function addColor(color: string) {
            if (!gradient) return;
            let e = document.createElement('span');
            e.className="grad-step";
            e.style.backgroundColor = color;
            gradient.append(e);
        }
        
        // created stepped color legend
        if (options.binStyle == 'color') {
            for (let i = 0; i < 100; i++) {
                addColor(steppedColors[Math.floor(i / 100 * (options.numColorSteps))]);
            }
        
        // create smooth gradient legend
        } else {
            scale.colors(100).forEach((color) => addColor(color));
        }
    }

    function handleMapRefFromView(map: Map) {
        mapRef.current = map;
    }

    useEffect(() => {

        // set the default scale
        if (colorScaleInputRef.current) {
            let colorScaleSelect = colorScaleInputRef.current as HTMLInputElement;
            colorScaleSelect.value = 'Viridis';
        }

        // addPresetFeatures();

        // load US county data source
        let binSource = new Vector({
            url: '/data/counties.geojson',
            format: new GeoJSON(),
            // loader: () => {
            // }
        });
        countySourceRef.current = binSource;

        // force source to load
        let view = mapRef.current?.getView();
        binSource.loadFeatures([0,0,0,0], 0, view ? view.getProjection() : new Projection({code: "EPSG:4326"}));

    }, []);

    // called when component has mounted
    // useEffect(() => {
    //     console.log("BinMap useEffect ...");
    //     if (!mapContainerRef.current) return;

    //     // set the default scale
    //     if (colorScaleInputRef.current) {
    //         let colorScaleSelect = colorScaleInputRef.current as HTMLInputElement;
    //         colorScaleSelect.value = 'Viridis';
    //     }

    //     // initialize the tile layer
    //     // const tileLayer = new TileLayer({
    //     //     source: new OSM({url: options.tileSourceUrl}), 
    //     //     // preload: Infinity 
    //     //     preload: 1
    //     // });
    //     // tileLayerRef.current = tileLayer;

    //     // initialize vector source to store data points
    //     // let vectorSource = new Vector();
    //     // dataSourceRef.current = vectorSource;

    //     // let newLayers = [tileLayer];
    //     // setLayers(newLayers);
        
    //     // initialize the map object
    //     // const map = new Map({
    //     //     view: new View({
    //     //         center: fromLonLat([-80, 40.440]),
    //     //         zoom: 9,
    //     //     }),
    //     //     layers: newLayers,
    //     //     target: mapContainerRef.current
    //     // });
    //     // mapRef.current = map;

    //     // setup interaction handler for clicking on features
    //     // var select  = new Select();
    //     // map.addInteraction(select);
    //     // select.on('select', handleFeatureSelect);

    //     // load initial data points
    //     // addPresetFeatures(dataSourceRef.current);

    //     // load US county data source
    //     let binSource = new Vector({
    //         url: '/data/counties.geojson',
    //         format: new GeoJSON(),
    //         // loader: () => {
    //         // }
    //     });
    //     countySourceRef.current = binSource;

    //     // force source to load
    //     let view = mapRef.current?.getView();
    //     binSource.loadFeatures([0,0,0,0], 0, view ? view.getProjection() : new Projection({code: "EPSG:4326"}));

    //     // calculate the bins for the map
    //     reloadMap();

    //     // return () => map.setTarget('');
    // }, []);

    // const [effectsRan, setEffectsRan] = useState({
    //     refresh: false,
    //     reloadMap: false,
    // });

    // useEffect(() => {

    //     if (!effectsRan.refresh) {
    //         setEffectsRan((old) => { return {...old, refresh: true} });
    //         return;
    //     }

    //     console.log("BinMap refresh useEffect");
    //     refresh();
    // }, [options]);

    // useEffect(() => {

    //     if (!effectsRan.reloadMap) {
    //         setEffectsRan((old) => { return {...old, reloadMap: true} });
    //         return;
    //     }

    //     console.log("BinMap reloadMap useEffect");
    //     reloadMap();
    // }, [options.binLayerIsVectorImage, options.hexStyle, options.binType, options.binStyle, options.tileSourceUrl, options.aggFuncName, options.colorScaleName]);

    return (
        <div className='map-container'>
            {/* <div ref={mapContainerRef}  className="map"/> */}
            <BinMapView options={optionsRef.current} features={features} layerConfigs={{}} mapCallback={handleMapRefFromView}/>
            <div ref={legendContainerRef} className="legend-container">
                <div className="gradient">
                    {getColorScale().colors(100).map((color, index) => {
                        return (
                            <span className="grad-step" key={index} style={{backgroundColor: color}}></span>
                        );
                    })}
                </div>
            </div>
            <div>
                <label htmlFor="binSize">Size:</label>
                <input id="binSize" name="binSize" type="number" min={0} max={100000} defaultValue={options.binSize} step={500} onChange={handleValueChange} onKeyDown={handleKeyDown} />

                <label htmlFor="intervalMin">Interval Min:</label>
                <input id="intervalMin" name="intervalMin" type="number" size={6} defaultValue={options.intervalMin} step={1} onChange={handleValueChange}/>

                <label htmlFor="intervalMax">Max:</label>
                <input ref={intervalMaxInputRef} id="intervalMax" name="intervalMax" type="number" size={6} defaultValue={options.intervalMax} step={1} onChange={handleValueChange}/>

                <br/>

                <label htmlFor="binStyle">Style:</label>
                <select id="binStyle" name="binStyle" defaultValue={options.binStyle} onChange={handleValueChange}>
                    <option value="gradient">Gradient</option>
                    <option value="color">Color</option>
                    <option value="point">Point</option>
                </select>

                <br/>

                <label htmlFor="binType">Bin Type:</label>
                <select id="binType" name="binType" defaultValue={options.binType} onChange={handleValueChange}>
                    <option value="hex">Hex</option>
                    <option value="grid">Grid</option>
                    <option value="feature">Feature</option>
                </select>

                <br/>

                <label htmlFor="aggFuncName">Agg Func:</label>
                <select id="aggFuncName" name="aggFuncName" defaultValue={options.aggFuncName} onChange={handleValueChange}>
                    <option value="max">Max</option>
                    <option value="sum">Sum</option>
                    <option value="avg">Avg</option>
                    <option value="len">Count</option>
                </select>

                <br/>

                <label htmlFor="hexStyle">Hex Style:</label>
                <select id="hexStyle" name="hexStyle" defaultValue={options.hexStyle} onChange={handleValueChange}>
                    <option value="pointy">Pointy</option>
                    <option value="flat">Flat</option>
                </select>

                <br/>

                <label htmlFor="colorScaleName">Color Scale:</label>
                <select ref={colorScaleInputRef} id="colorScaleName" name="colorScaleName" onChange={handleValueChange} defaultValue={options.colorScaleName}>
                    {Object.keys(chroma.brewer).map((key) => {
                        return (
                            <option value={key} key={key}>{key}</option>
                        );
                    })}
                </select>

                <label htmlFor="numColorSteps">Num Color Steps:</label>
                <input id="numColorSteps" name="numColorSteps" type="number" min={0} max={16} defaultValue={options.numColorSteps} step={1} onChange={handleValueChange}/>

                <br/>

                <label htmlFor="tileSourceUrl">Tile Source:</label>
                <select name="tileSourceUrl" id="tileSourceUrl" onChange={handleValueChange} defaultValue={options.tileSourceUrl}>
                    <option value="https://tile.openstreetmap.org/{z}/{x}/{y}.png">OSM Standard</option>
                    <option value="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png">OSM Humanitarian</option>
                    <option value="https://a.tile.opentopomap.org/{z}/{x}/{y}.png">OSM Topographic</option>
                    {/* <option value="https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png">MemoMaps</option> */}
                    {/* <option value="https://s.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png">CyclOSM</option> */}
                    {/* <option value="https://tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png">CyclOSM-lite</option> */}
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}">Esri World Imagery (satellite)</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}">Esri World Street Map</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}">Esri World Topographic</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}">Esri Shaded Relief</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}">Esri Physical Map</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}">Esri Terrain Base</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}">Esri NatGeo</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}">Esri Transportation</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}">Esri Light Gray Base</option>
                    <option value="https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}">Esri Light Gray Reference</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}">Esri Dark Gray Base</option>
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}">Esri Dark Gray Reference</option>
                    <option value="https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}">Esri World Boundaries and Places</option>
                    <option value="https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}">Esri World Boundaries and Places (alt)</option>
                    <option value="https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}">Esri World Reference Overlay</option>
                    <option value="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png">Carto Positron</option>
                    <option value="https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png">Carto Positron - no labels</option>
                    <option value="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png">Carto Dark Matter</option>
                    <option value="https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png">Carto Dark Matter - no labels</option>
                    <option value="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png">Carto Voyager</option>
                    <option value="https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png">Carto Voyager - no labels</option>
                    {/* <option value="http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg">Stamen Watercolor</option> */}
                    {/* <option value="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png">OpenWeatherMap</option> */}
                </select>

                <br/>

                <input id="binLayerVisible" name="binLayerVisible" onChange={handleCheckboxChange} type="checkbox" defaultChecked={options.binLayerVisible}/>
                <label htmlFor="binLayerVisible">show bin layer</label>

                <input id="tileLayerVisible" name="tileLayerVisible" onChange={handleCheckboxChange} type="checkbox" defaultChecked={options.tileLayerVisible}/>
                <label htmlFor="tileLayerVisible">show tile layer</label>

                <br/>

                <input id="binLayerIsVectorImage" name="binLayerIsVectorImage" type="checkbox" onChange={handleCheckboxChange} defaultChecked={options.binLayerIsVectorImage}/>
                <label htmlFor="binLayerIsVectorImage">bin layer as image</label>

                <input id="binLayerBackgroundEnabled" name="binLayerBackgroundEnabled" type="checkbox" onChange={handleCheckboxChange} defaultChecked={options.binLayerBackgroundEnabled}/>
                <label htmlFor="binLayerBackgroundEnabled">bin layer background</label>

                <br/>

                <label htmlFor="binLayerOpacity">Bin Layer Opacity:</label>
                <input id="binLayerOpacity" name="binLayerOpacity" type="range" min={0} max={100} defaultValue={options.binLayerOpacity} step={1} onChange={handleValueChange} onMouseUp={refresh}/>
                <label htmlFor="tileLayerOpacity">Tile Layer Opacity:</label>
                <input id="tileLayerOpacity" name="tileLayerOpacity" type="range" min={0} max={100} defaultValue={options.tileLayerOpacity} step={1} onChange={handleValueChange} onMouseUp={refresh}/>

                <br/>

                <button onClick={handleRandomFeaturesButton}>Add Random Features</button>
                <button onClick={handleResetFeaturesButton}>Reset Features</button>
            </div>
        </div>
    );
}
