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
import { Vector } from 'ol/source';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape.js';
import { SelectEvent } from 'ol/interaction/Select';
import VectorSource from 'ol/source/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';
import Layer from 'ol/layer/Layer';
import { data } from '../../data/us_pa_alleghaney_addresses';
import { fromLonLat } from 'ol/proj';
import chroma from 'chroma-js';

type MapProps = {
    width: number;
    height: number;
};

export function MapPlot({ width, height }: MapProps) {

    const mapRef = useRef<Map>();
    const mapContainerRef = useRef(null);
    const binLayerRef = useRef<Layer>();
    const tileLayerRef = useRef<Layer>();
    const vectorSourceRef = useRef<VectorSource>();
    const binsRef = useRef<VectorSource>();
    // const [size, setSize] = useState(2000);
    let size = 250;

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

    let minValue = 0, maxValue = 100; 
    const minRadius = 1;

    // handle selection of a feature
    function handleFeatureSelect(event: SelectEvent) {
        if (event.selected.length){
            let f = event.selected[0].get('features');
            if (f) {
                // use f.get("features")
                console.log("num features:", f.length);
            } else {
                // bin has no features
                console.log("num features: 0 (no features array)");
            }
        } else {
            // did not select a feature
            console.log("did not select feature");
        }
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

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number) {

        let style = styleInputRef.current ? styleInputRef.current['value'] : 'color';
        let value = f.get('value');
        let normal = Math.min(1,value/maxValue);
        
        let numSteps = colorStepsInputRef.current ? Number(colorStepsInputRef.current['value']) : 5;
        let scaleName = colorScaleInputRef.current ? colorScaleInputRef.current['value'] : 'spectral';
        let scale = chroma.scale(scaleName).correctLightness();
        let steppedColors = scale.colors(numSteps);
    
        switch (style) {

        // different sized hexagons
        case 'point': {
            let radius = Math.round(size/res +0.5) * Math.min(1,value/maxValue);
            if (radius < minRadius) radius = minRadius;
            return	[ new Style({
                image: new RegularShape({
                    points: 6,
                    radius: radius,
                    fill: new Fill({ color: [0,0,255] }),
                    rotateWithView: true
                    }),
                    geometry: new Point(f.get('center'))
                })
                //, new Style({ fill: new Fill({color: [0,0,255,.1] }) })
            ];
        }

        // sharp transition between colors
        case 'color': {
            let index = Math.round(normal * (numSteps - 1));
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

    // find the minimum and maximum values in a given feature set
    function findValueBounds(features: FeatureLike[]) {
        if (!features || features.length == 0) return;

        // reset current values
        minValue = Number.MAX_SAFE_INTEGER;
        maxValue = Number.MIN_SAFE_INTEGER;

        // get the number of features in the set
        // for (let f of features) {
        //     let n = f.get('features').length;
        //     if (n<minValue) minValue = n;
        //     if (n>maxValue) maxValue = n;
        //     (f as Feature).set('value', n, true);
        // }

        // get the max number of features in the set
        for (let f of features) {
            let fs = f.get('features');
            let fMin = Number.MAX_SAFE_INTEGER;
            let fMax = Number.MIN_SAFE_INTEGER;

            for (let ff of fs) {
                let n = ff.get('number');
                if (n<fMin) fMin = n;
                if (n>fMax) fMax = n;
            }

            (f as Feature).set('value', fMax, true);

            if (fMin<minValue) minValue = fMin;
            if (fMax>maxValue) maxValue = fMax;
        }

        // set new min/max by clipping ends (TODO: why?)
        let dl = (maxValue-minValue);
        minValue = Math.max(1,Math.round(dl/4));
        maxValue = Math.round(maxValue - dl/1.5);

        // update interval min and max fields
        if (intervalMinInputRef.current) {
            let minInput = intervalMinInputRef.current as HTMLInputElement;
            minInput.value = String(minValue);
        }
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

    // reload bins
    function reloadBins() {
        if (binLayerRef.current && binOpacityInputRef.current) binLayerRef.current.setOpacity(Number(binOpacityInputRef.current['value'])/100);
        if (binsRef.current) binsRef.current.changed();
    }

    // update data source
    function updateDataSource() {

        let vectorSource;

        if (vectorSourceRef.current) {
            vectorSourceRef.current.clear();
            vectorSource = vectorSourceRef.current;
        } else {
            // create vector source to store data points
            vectorSource = new Vector();
            vectorSourceRef.current = vectorSource;
        }

        if (randDataChkboxRef.current && randDataChkboxRef.current['checked']) {
            addRandomFeatures(10000, vectorSource);
        } else {
            addPresetFeatures(vectorSource);
        }

        reloadMap();
    }

    // reset, calculate, and display updated hexbins
    function reloadMap() {
        console.log("reloading map ...");

        if (!mapRef.current || !vectorSourceRef.current) return;
        if (binLayerRef.current) mapRef.current.removeLayer(binLayerRef.current);
        if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);

        // get the current size from input
        // if (sizeInputRef.current) setSize(Number(sizeInputRef.current['value']));
        if (sizeInputRef.current) size = Number(sizeInputRef.current['value']);

        // group data points into bins
        let bins;
        if (binTypeInputRef.current && binTypeInputRef.current['value'] == 'grid') {
            bins = createGridBin(vectorSourceRef.current);
        } else {
            bins = createHexBin(vectorSourceRef.current);
        }

        // create layer to display the bins
        let vClass = asImageChkboxRef.current && asImageChkboxRef.current['checked'] ? VectorLayer : VectorImageLayer;
        let opacity = binOpacityInputRef.current ? Number(binOpacityInputRef.current['value']) / 100 : 0.7;
        const binLayer = new vClass({ 
            source: bins, 
            opacity: opacity,
            style: styleForBin
        });
        binLayerRef.current = binLayer;
    
        // add layers to map
        if ((!tileLayerChkboxRef.current || tileLayerChkboxRef.current['checked']) && tileLayerRef.current) {
            mapRef.current.addLayer(tileLayerRef.current);
        }
        if (!binLayerChkboxRef.current || binLayerChkboxRef.current['checked']) {
            mapRef.current.addLayer(binLayer);
        }
    }

    // called when component has mounted
    useEffect(() => {
        console.log("Map useEffect ...");
        if (!mapContainerRef.current) return;

        // initialize the tile layer
        const tileLayer = new TileLayer({
            source: new OSM(), 
            preload: Infinity 
        });
        tileLayerRef.current = tileLayer;
        
        // initialize the map object
        const map = new Map({
            view: new View({
                center: fromLonLat([-80, 40.440]),
                zoom: 11,
            }),
            layers: [],
            target: mapContainerRef.current
        });
        mapRef.current = map;

        // setup interaction handler for clicking on features
        var select  = new Select();
        map.addInteraction(select);
        select.on('select', handleFeatureSelect);

        // load initial data
        updateDataSource();
        
        // calculate the bins for the map
        // reloadMap();

        return () => map.setTarget('');
    }, []);

    return (
        <div className='map-container'>
            <div ref={mapContainerRef} style={{ height: height+"px", width: width+"px" }} className="map"/>
            <div>
                <label htmlFor="map-size-input">Size:</label>
                <input ref={sizeInputRef} id="map-size-input" type="number" min={0} max={100000} defaultValue={size} step={500} onChange={reloadMap}/>

                <label htmlFor="map-style-input">Style:</label>
                <select ref={styleInputRef} id="map-style-input" onChange={reloadBins}>
                    <option value="gradient">Gradient</option>
                    <option value="color">Color</option>
                    <option value="point">Point</option>
                </select>

                <label htmlFor="map-bin-type-input">Bin Type:</label>
                <select ref={binTypeInputRef} id="map-bin-type-input" onChange={reloadMap}>
                    <option value="hex">Hex</option>
                    <option value="grid">Grid</option>
                </select>

                <br/>

                <label htmlFor="map-hex-layout-input">Hex Style:</label>
                <select ref={hexLayoutInputRef} id="map-hex-layout-input" onChange={reloadMap}>
                    <option value="pointy">Pointy</option>
                    <option value="flat">Flat</option>
                </select>

                <br/>

                <input ref={asImageChkboxRef} id="map-image-layer-input" type="checkbox" onChange={reloadMap}/>
                <label htmlFor="map-image-layer-input">bin layer as image</label>

                <input ref={binLayerChkboxRef} id="map-bin-layer-input" type="checkbox" onChange={reloadMap} defaultChecked={true}/>
                <label htmlFor="map-bin-layer-input">show bin layer</label>

                <input ref={tileLayerChkboxRef} id="map-tile-layer-input" type="checkbox" onChange={reloadMap} defaultChecked={false}/>
                <label htmlFor="map-tile-layer-input">show tile layer</label>

                <br/>

                <label htmlFor="map-bin-opacity-input">Bin Opacity:</label>
                <input ref={binOpacityInputRef} id="map-color-steps-input" type="number" min={0} max={100} defaultValue={64} step={1} onChange={reloadBins}/>

                <br/>

                <input ref={randDataChkboxRef} id="map-rand-data-input" type="checkbox" onChange={updateDataSource} defaultChecked={false}/>
                <label htmlFor="map-rand-data-input">use random data</label>

                <br/>

                <label htmlFor="map-color-scale-input">Color Scale:</label>
                <select ref={colorScaleInputRef} id="map-color-scale-input" onChange={reloadBins}>
                    {Object.keys(chroma.brewer).map((key) => {
                        return (
                            <option value={key}>{key}</option>
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

            </div>

        </div>
        
    );
}
