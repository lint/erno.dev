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
import Layer from 'ol/layer/Layer';
// import { data } from '../../data/us_pa_alleghaney_addresses';
// import { data } from '../../data/us_pa_addresses';
import { data } from '../../data/us_addresses';
import { fromLonLat, Projection } from 'ol/proj';
import chroma from 'chroma-js';
import GeoJSON from 'ol/format/GeoJSON';
import BinBase from 'ol-ext/source/BinBase';

// type MapProps = {
//     width: number;
//     height: number;
// };

export function MapPlot() {

    const mapRef = useRef<Map>();
    const mapContainerRef = useRef(null);
    const binLayerRef = useRef<Layer>();
    const tileLayerRef = useRef<Layer>();
    const dataSourceRef = useRef<VectorSource>();
    const countySourceRef = useRef<VectorSource>();
    const binsRef = useRef<BinBase>();
    // const [size, setSize] = useState(2000);
    let size = 1000;
    let wasImageLayerUsed = true;

    const legendContainerRef = useRef(null);

    // input refs
    const tileLayerChkboxRef = useRef(null);
    const binLayerChkboxRef = useRef(null);
    const asImageChkboxRef = useRef(null);
    const randDataChkboxRef = useRef(null);
    const sizeInputRef = useRef(null);
    const styleInputRef = useRef(null);
    const binTypeInputRef = useRef(null);
    const hexLayoutInputRef = useRef(null);
    const intervalMinInputRef = useRef(null);
    const intervalMaxInputRef = useRef(null);
    const colorStepsInputRef = useRef(null);
    const colorScaleInputRef = useRef(null);
    const binOpacityInputRef = useRef(null);
    const tileOpacityInputRef = useRef(null);
    const tileSourceInputRef = useRef(null);
    const backgroundColorChkboxRef = useRef(null);
    const aggFuncInputRef = useRef(null);

    let minValue = 0, maxValue = 100; 
    const minRadius = 1;

    // handle selection of a feature
    function handleFeatureSelect(event: SelectEvent) {
        if (event.selected.length){
            let f = event.selected[0];
            console.log("selected value: ", f.get("value"));
        } else {
            // did not select a feature
            console.log("did not select feature");
        }

        console.log(binsRef.current?.getFeatures())
    }

    // create a set of features on seed points
    function addRandomFeatures(nb: any, vectorSource: Vector) {
        if (!mapRef.current) return;

        let ssize = 20;		// seed size
        let ext = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
        let dx = ext[2]-ext[0];
        let dy = ext[3]-ext[1];
        let dl = Math.min(dx,dy);
        let features=[];

        for (let i=0; i<nb/ssize; ++i){
            let seed = [ext[0]+dx*Math.random(), ext[1]+dy*Math.random()]
            for (let j=0; j<ssize; j++){
                let f = new Feature(new Point([
                    seed[0] + dl/10*Math.random(),
                    seed[1] + dl/10*Math.random()
                ]));
                f.set('number', Math.floor(Math.random() * 10));
                features.push(f);
            }
        }
        vectorSource.clear(true);
        vectorSource.addFeatures(features);
    }

    // load features from preset data file
    function addPresetFeatures(vectorSource: Vector) {
        if (!mapRef.current) return;

        let features=[];

        for (let row of data) {
            let coord = [row[0], row[1]];
            let f = new Feature(new Point(fromLonLat(coord)));
            f.set('number', row[2]);
            features.push(f);
        }

        vectorSource.clear(true);
        vectorSource.addFeatures(features);
    }

    // returns the chroma js color scale for the currently selected input
    function getColorScale() {
        let scaleName = colorScaleInputRef.current ? colorScaleInputRef.current['value'] : 'Viridis';
        let scale = chroma.scale(scaleName);
        return scale
    }

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number) {

        let style = styleInputRef.current ? styleInputRef.current['value'] : 'color';
        let value = f.get('value');
        let normal = Math.min(1,value/maxValue);
        
        let numSteps = colorStepsInputRef.current ? Number(colorStepsInputRef.current['value']) : 5;
        let scale = getColorScale();
        let steppedColors = scale.colors(numSteps);
    
        switch (style) {

        // different sized hexagons
        case 'point': {
            let radius = Math.max(minRadius, Math.round(size/res + 0.5) * Math.min(1, value/maxValue));
            return [ new Style({
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
            let index = Math.floor(normal * numSteps);
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

    // create and return a new hex bin object
    function createHexBin(vectorSource: Vector) {
        
        // init and calculate the bins
        const hexbin = new HexBin({
            source: vectorSource,
            size: size,
            layout: (hexLayoutInputRef.current ? hexLayoutInputRef.current['value'] : 'pointy') as any
        });
        binsRef.current = hexbin;

        // determine the highest and lowest values across all bins
        findValueBounds(hexbin.getFeatures());

        return hexbin;
    }

    // create and return a new grid bin object
    function createGridBin(vectorSource: Vector) {
        
        // init and calculate the bins
        const gridBin = new GridBin({
            source: vectorSource,
            size: size,
        });
        binsRef.current = gridBin;
        // gridBin.getSource().set('gridProjection', 'EPSG:'+3857);

        // determine the highest and lowest values across all bins
        findValueBounds(gridBin.getFeatures());

        return gridBin;
    }

    // create and return a new feature bin object
    function createFeatureBin(vectorSource: Vector) {

        // init and calculate bins
        const featureBin = new FeatureBin({
            source: vectorSource,
            binSource: countySourceRef.current
        });
        binsRef.current = featureBin;

        // determine the highest and lowest values across all bins
        findValueBounds(featureBin.getFeatures());
        // featureBin.addEventListener('change', () => {
        //     if (binsRef.current && binsRef.current === featureBin) {
        //         findValueBounds(binsRef.current.getFeatures());
        //     }
        // })      

        return featureBin;
    }

    // find the minimum and maximum values in a given feature set
    function findValueBounds(features: FeatureLike[]) {
        if (!features || features.length == 0) return;

        // reset current values
        maxValue = Number.MIN_SAFE_INTEGER;

        // get current aggregation function
        let mode = aggFuncInputRef.current ? aggFuncInputRef.current['value'] : 'max';

        // calculate the value for every feature
        for (let f of features) {
            let fs = f.get('features');
            let fMax = Number.MIN_SAFE_INTEGER;
            let sum = 0;
            let value = 0;
           
            // do not need to iterate over data points for length`
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
            if (value>maxValue) maxValue = value;
        }

        // set new min/max by clipping ends (TODO: why?)
        let dl = (maxValue-minValue);
        // minValue = Math.max(1,Math.round(dl/4));
        maxValue = Math.round(maxValue - dl/4);
        maxValue = Math.min(maxValue, 30000);

        // update interval min and max fields
        // if (intervalMinInputRef.current) {
        //     let minInput = intervalMinInputRef.current as HTMLInputElement;
        //     minInput.value = String(minValue);
        // }
        if (intervalMaxInputRef.current) {
            let maxInput = intervalMaxInputRef.current as HTMLInputElement;
            maxInput.value = String(maxValue);
        }
    }

    // handler for when the interval is manually changed
    function updateInterval() {

        if (intervalMinInputRef.current) minValue = Number(intervalMinInputRef.current['value']);
        if (intervalMaxInputRef.current) maxValue = Number(intervalMaxInputRef.current['value']);
        
        reloadBins();
    }

    // reload fast visuals
    function refresh() {

        // set bin layer background color
        if (backgroundColorChkboxRef.current && backgroundColorChkboxRef.current['checked']) {
            let scale = getColorScale();
            binLayerRef.current?.setBackground(scale(0).alpha(binLayerRef.current.getOpacity()).darken().name());
        } else {
            binLayerRef.current?.setBackground();
        }

        // set opacity
        if (binLayerRef.current && binOpacityInputRef.current) binLayerRef.current.setOpacity(Number(binOpacityInputRef.current['value'])/100);
        if (tileLayerRef.current && tileOpacityInputRef.current) tileLayerRef.current.setOpacity(Number(tileOpacityInputRef.current['value'])/100);

        // set enabled
        tileLayerRef.current?.setVisible(!tileLayerChkboxRef.current || tileLayerChkboxRef.current['checked']);
        binLayerRef.current?.setVisible(!binLayerChkboxRef.current || binLayerChkboxRef.current['checked']);

        // update tile layer url
        let tileUrl = tileSourceInputRef.current ? tileSourceInputRef.current['value'] : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
        let osmSource = tileLayerRef.current?.getSource() as OSM;
        osmSource.setUrl(tileUrl);

        // refresh legend
        refreshLegend();
    }

    // update data source
    function updateDataSource() {
        if (!dataSourceRef.current) return;

        dataSourceRef.current.clear();

        if (randDataChkboxRef.current && randDataChkboxRef.current['checked']) {
            addRandomFeatures(10000, dataSourceRef.current);
        } else {
            addPresetFeatures(dataSourceRef.current);
        }

        reloadMap();
    }

    // reload bins
    function reloadBins() {
        if (binsRef.current) binsRef.current.changed();
    }

    // reload map on enter press on input fields
    function handleKeyDown(event: any) {
        if (event.key === 'Enter') {
            reloadMap();
        }
    }

    // reset, calculate, and display updated hexbins
    function reloadMap() {
        console.log("reloading map ...");
        if (!mapRef.current || !dataSourceRef.current) return;

        // get the current size from input
        if (sizeInputRef.current) size = Number(sizeInputRef.current['value']);
        
        // group data points into bins
        let bins;
        if (binTypeInputRef.current && binTypeInputRef.current['value'] == 'grid') {
            bins = createGridBin(dataSourceRef.current);
        } else if (binTypeInputRef.current && binTypeInputRef.current['value'] == 'feature') {
            bins = createFeatureBin(dataSourceRef.current);
        } else {
            bins = createHexBin(dataSourceRef.current);
        }

        // update bin layer source
        if (binLayerRef.current) binLayerRef.current.setSource(bins);

        // create new layer to display the bins if necessary
        let isImageLayer = !(asImageChkboxRef.current && asImageChkboxRef.current['checked']);
        if (!binLayerRef.current || wasImageLayerUsed != isImageLayer) {
            console.log("creating bin layer")
            wasImageLayerUsed = isImageLayer;

            // remove the previous bin layer if there is one
            if (binLayerRef.current) mapRef.current.removeLayer(binLayerRef.current);

            let vClass = isImageLayer ? VectorImageLayer : VectorLayer;
            let opacity = binOpacityInputRef.current ? Number(binOpacityInputRef.current['value']) / 100 : 0.7;

            const binLayer = new vClass({ 
                source: bins, 
                opacity: opacity,
                style: styleForBin,
            });
            binLayerRef.current = binLayer;
            mapRef.current.addLayer(binLayer);
        }

        // refresh visual updates
        refresh();
    }
    
    // update legend colors
    function refreshLegend() {
        if (!legendContainerRef.current) return;

        let gradient = (legendContainerRef.current as HTMLElement).querySelector(".gradient");
        if (!gradient) return;

        let style = styleInputRef.current ? styleInputRef.current['value'] : 'color';
        let numSteps = colorStepsInputRef.current ? Number(colorStepsInputRef.current['value']) : 5;
        let scale = getColorScale();
        let steppedColors = scale.colors(numSteps);
    
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
        if (style == 'color') {
            for (let i = 0; i < 100; i++) {
                addColor(steppedColors[Math.floor(i / 100 * (numSteps))]);
            }
        
        // create smooth gradient legend
        } else {
            scale.colors(100).forEach((color) => addColor(color));
        }
    }

    // called when component has mounted
    useEffect(() => {
        console.log("Map useEffect ...");
        if (!mapContainerRef.current) return;

        // set the default scale
        if (colorScaleInputRef.current) {
            let colorScaleSelect = colorScaleInputRef.current as HTMLInputElement;
            colorScaleSelect.value = 'Viridis';
        }

        // initialize the tile layer
        let tileUrl = tileSourceInputRef.current ? tileSourceInputRef.current['value'] : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
        const tileLayer = new TileLayer({
            source: new OSM({url: tileUrl}), 
            // preload: Infinity 
            preload: 1
        });
        tileLayerRef.current = tileLayer;

        // initialize vector source to store data points
        let vectorSource = new Vector();
        dataSourceRef.current = vectorSource;
        
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

        // setup interaction handler for clicking on features
        var select  = new Select();
        map.addInteraction(select);
        select.on('select', handleFeatureSelect);

        // load initial data points
        updateDataSource();

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

        // calculate the bins for the map
        // reloadMap();

        return () => map.setTarget('');
    }, []);

    return (
        <div className='map-container'>
            <div ref={mapContainerRef}  className="map"/>
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
                <label htmlFor="map-size-input">Size:</label>
                <input ref={sizeInputRef} id="map-size-input" type="number" min={0} max={100000} defaultValue={size} step={500} onKeyDown={handleKeyDown} onBlur={()=>reloadMap()} />

                <label htmlFor="map-style-input">Style:</label>
                <select ref={styleInputRef} id="map-style-input" onChange={refresh}>
                    <option value="gradient">Gradient</option>
                    <option value="color">Color</option>
                    <option value="point">Point</option>
                </select>

                <label htmlFor="map-bin-type-input">Bin Type:</label>
                <select ref={binTypeInputRef} id="map-bin-type-input" onChange={reloadMap}>
                    <option value="hex">Hex</option>
                    <option value="grid">Grid</option>
                    <option value="feature">Feature (Counties)</option>
                </select>

                <br/>

                <label htmlFor="map-hex-layout-input">Hex Style:</label>
                <select ref={hexLayoutInputRef} id="map-hex-layout-input" onChange={reloadMap}>
                    <option value="pointy">Pointy</option>
                    <option value="flat">Flat</option>
                </select>

                <br/>

                <input ref={asImageChkboxRef} id="map-image-layer-input" type="checkbox" onChange={reloadMap} defaultChecked={wasImageLayerUsed}/>
                <label htmlFor="map-image-layer-input">bin layer as image</label>

                <input ref={binLayerChkboxRef} id="map-bin-layer-input" type="checkbox" onChange={reloadMap} defaultChecked={true}/>
                <label htmlFor="map-bin-layer-input">show bin layer</label>

                <input ref={tileLayerChkboxRef} id="map-tile-layer-input" type="checkbox" onChange={refresh} defaultChecked={true}/>
                <label htmlFor="map-tile-layer-input">show tile layer</label>

                <br/>

                <input ref={backgroundColorChkboxRef} id="map-bin-background-input" type="checkbox" onChange={refresh} defaultChecked={false}/>
                <label htmlFor="map-bin-background-input">bin layer background</label>

                <br/>

                <label htmlFor="map-bin-opacity-input">Bin Layer Opacity:</label>
                <input ref={binOpacityInputRef} id="map-bin-opacity-input" type="range" min={0} max={100} defaultValue={75} step={1} onMouseUp={refresh}/>
                <label htmlFor="map-tile-opacity-input">Tile Layer Opacity:</label>
                <input ref={tileOpacityInputRef} id="map-tile-opacity-input" type="range" min={0} max={100} defaultValue={100} step={1} onMouseUp={refresh}/>

                <br/>

                <label htmlFor="map-tile-source-input">Tile Source:</label>
                <select ref={tileSourceInputRef} id="map-tile-source-input" onChange={reloadMap}>
                    {/* TODO: temp default */}
                    <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}">Esri Dark Gray Bas</option>

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

                <input ref={randDataChkboxRef} id="map-rand-data-input" type="checkbox" onChange={updateDataSource} defaultChecked={false}/>
                <label htmlFor="map-rand-data-input">use random data</label>

                <br/>

                <label htmlFor="map-color-scale-input">Color Scale:</label>
                <select ref={colorScaleInputRef} id="map-color-scale-input" onChange={refresh} defaultValue="viridis">
                    {Object.keys(chroma.brewer).map((key) => {
                        return (
                            <option value={key} key={key}>{key}</option>
                        );
                    })}
                </select>

                <label htmlFor="map-color-steps-input">Num Color Steps:</label>
                <input ref={colorStepsInputRef} id="map-color-steps-input" type="number" min={0} max={16} defaultValue={5} step={1} onChange={reloadBins}/>

                <br/>

                <label htmlFor="map-size-input">Interval Min:</label>
                <input ref={intervalMinInputRef} id="map-interval-min-input" type="number" size={6} defaultValue={0} step={1} onChange={updateInterval}/>

                <label htmlFor="map-size-input">Max:</label>
                <input ref={intervalMaxInputRef} id="map-interval-max-input" type="number" size={6} defaultValue={0} step={1} onChange={updateInterval}/>

                <br/>

                <label htmlFor="map-agg-func-input">Agg Func:</label>
                <select ref={aggFuncInputRef} id="map-agg-func-input" onChange={reloadMap}>
                    <option value="max">Max</option>
                    <option value="sum">Sum</option>
                    <option value="avg">Avg</option>
                    <option value="len">Count</option>
                </select>
                
            </div>

        </div>
    );
}
