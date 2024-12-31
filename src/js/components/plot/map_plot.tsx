import React, { useState, useEffect, useRef } from 'react';
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
    const hexbinRef = useRef<HexBin>();
    // const [size, setSize] = useState(2000);
    let size = 2000;

    // input refs
    const tileLayerChkboxRef = useRef(null);
    const binLayerChkboxRef = useRef(null);
    const asImageChkboxRef = useRef(null);
    const sizeInputRef = useRef(null);
    const styleInputRef = useRef(null);
    const hexLayoutInputRef = useRef(null);
    const intervalMinInputRef = useRef(null);
    const intervalMaxInputRef = useRef(null);

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
                // f.set('id', i*ssize+j);
                features.push(f);
            }
        }
        vectorSource.clear(true);
        vectorSource.addFeatures(features);
    }

    function addPresetFeatures(vectorSource: Vector) {
        if (!mapRef.current) return;

        let features=[];

        for (let row of data) {
            let coord = [row['lon'], row['lat']];
            let newCoord = fromLonLat(coord);
            let f = new Feature(new Point(newCoord));
            f.set('number', row['n']);
            features.push(f);
        }

        vectorSource.clear(true);
        vectorSource.addFeatures(features);
    }

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number) {

        let style = styleInputRef.current ? styleInputRef.current['value'] : 'color';
    
        switch (style){
        // Display a point with a radius 
        // depending on the number of objects in the aggregate.
        case 'point': {
            var radius = Math.round(size/res +0.5) * Math.min(1,f.get('features').length/maxValue);
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
        // Display the polygon with a gradient value (opacity) 
        // depending on the number of objects in the aggregate.
        case 'gradient': {
            var opacity = Math.min(1,f.get('features').length/maxValue);
            return [ new Style({ fill: new Fill({ color: [0,0,255,opacity] }) }) ];
        }
        // Display the polygon with a color
        // depending on the number of objects in the aggregate.
        case 'color':
        default: {
            var color;
            if (f.get('features').length > maxValue) color = [136, 0, 0, 1];
            else if (f.get('features').length > minValue) color = [255, 165, 0, 1];
            else color = [0, 136, 0, 1];
            return [ new Style({ fill: new Fill({  color: color }) }) ];
        }
        }
    };

    // create and return a new hex bin object
    function createHexBin(vectorSource: Vector) {
        
        // init and calculate the bins
        const hexbin = new HexBin({
            source: vectorSource,
            size: size,
            layout: (hexLayoutInputRef.current ? hexLayoutInputRef.current['value'] : 'pointy') as any
        });
        hexbinRef.current = hexbin;

        // determine the highest and lowest values across all bins
        findValueBounds(hexbin.getFeatures());

        return hexbin;
    }

    // find the minimum and maximum values in a given feature set
    function findValueBounds(features: FeatureLike[]) {
        if (!features || features.length == 0) return;

        // reset current values
        minValue = Number.MAX_SAFE_INTEGER;
        maxValue = Number.MIN_SAFE_INTEGER;

        // iterate over every feature set
        for (let f of features) {
            let n = f.get('features').length;
            if (n<minValue) minValue = n;
            if (n>maxValue) maxValue = n;
        }

        // set new min/max by clipping ends (TODO: why?)
        let dl = (maxValue-minValue);
        minValue = Math.max(1,Math.round(dl/4));
        maxValue = Math.round(maxValue - dl/3);

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
        
        reloadHexbin();
    }

    // reload hexbin
    function reloadHexbin() {
        if (hexbinRef.current) hexbinRef.current.changed();
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
        const hexbin = createHexBin(vectorSourceRef.current);

        // create layer to display the bins
        let vClass = asImageChkboxRef.current && asImageChkboxRef.current['checked'] ? VectorLayer : VectorImageLayer;
        const binLayer = new vClass({ 
            source: hexbin, 
            opacity: .5,
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

        // create vector source to store data points
        const vectorSource = new Vector();
        // addRandomFeatures(20000, vectorSource);
        addPresetFeatures(vectorSource);
        vectorSourceRef.current = vectorSource;
        
        // calculate the bins for the map
        reloadMap();

        return () => map.setTarget('');
    }, []);

    return (
        <div className='map-container'>
            <div ref={mapContainerRef} style={{ height: height+"px", width: width+"px" }} className="map"/>
            <div>
                <label htmlFor="map-size-input">Size:</label>
                <input ref={sizeInputRef} id="map-size-input" type="number" min={0} max={100000} defaultValue={size} step={500} onChange={reloadMap}/>

                <label htmlFor="map-style-input">Style:</label>
                <select ref={styleInputRef} id="map-style-input" onChange={reloadHexbin}>
                    <option value="color">Color</option>
                    <option value="gradient">Gradient</option>
                    <option value="point">Point</option>
                </select>

                <label htmlFor="map-hex-layout-input">Style:</label>
                <select ref={hexLayoutInputRef} id="map-hex-layout-input" onChange={reloadMap}>
                    <option value="pointy">Pointy</option>
                    <option value="flat">Flat</option>
                </select>

                <br/>

                <input ref={asImageChkboxRef} id="map-image-layer-input" type="checkbox" onChange={reloadMap}/>
                <label htmlFor="map-image-layer-input">bin layer as image</label>

                <input ref={binLayerChkboxRef} id="map-bin-layer-input" type="checkbox" onChange={reloadMap} defaultChecked={true}/>
                <label htmlFor="map-bin-layer-input">show bin layer</label>

                <input ref={tileLayerChkboxRef} id="map-tile-layer-input" type="checkbox" onChange={reloadMap} defaultChecked={true}/>
                <label htmlFor="map-tile-layer-input">show tile layer</label>

                <br/>

                <label htmlFor="map-size-input">Interval Min:</label>
                <input ref={intervalMinInputRef} id="map-interval-min-input" type="number" size={6} defaultValue={0} step={1} onChange={updateInterval}/>

                <label htmlFor="map-size-input">Max:</label>
                <input ref={intervalMaxInputRef} id="map-interval-max-input" type="number" size={6} defaultValue={0} step={1} onChange={updateInterval}/>

            </div>
        </div>
        
    );
}
