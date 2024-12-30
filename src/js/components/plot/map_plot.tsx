import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import "ol-ext/dist/ol-ext.css";
import './map.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM';
import {Select, Modify } from 'ol/interaction';
import Feature, { FeatureLike } from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import HexBin from 'ol-ext/source/HexBin';
import { Vector } from 'ol/source';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape.js';
import { SelectEvent } from 'ol/interaction/Select';
import { create } from 'ol/transform';
import VectorSource from 'ol/source/Vector';

type MapProps = {
    width: number;
    height: number;
};

export function MapPlot({ width, height }: MapProps) {

    const mapRef = useRef<Map>();
    const mapContainerRef = useRef(null);
    const binLayerRef = useRef<VectorLayer>();
    const vectorSourceRef = useRef<VectorSource>();
    const [size, setSize] = useState(200000);

    let style = 'color';
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
    function addFeatures(nb: any, vectorSource: Vector) {
        if (!mapRef.current) return;

        var ssize = 20;		// seed size
        var ext = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
        var dx = ext[2]-ext[0];
        var dy = ext[3]-ext[1];
        var dl = Math.min(dx,dy);
        var features=[];
        for (var i=0; i<nb/ssize; ++i){
            var seed = [ext[0]+dx*Math.random(), ext[1]+dy*Math.random()]
            for (var j=0; j<ssize; j++){
                var f = new Feature(new Point([
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

    // determine style for the given bin (f=feature, res=resolutuion)
    function styleForBin(f: FeatureLike, res: number) {
    
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
            size: size
        });

        // determine the highest and lowest values across all bins
        findValueBounds(hexbin.getFeatures());

        return hexbin;
    }

    // reset, calculate, and display updated hexbins
    function calcBins() {
        if (!mapRef.current || !vectorSourceRef.current) return;
        if (binLayerRef.current) mapRef.current.removeLayer(binLayerRef.current);

        // group data points into bins
        const hexbin = createHexBin(vectorSourceRef.current);

        // create layer to display the bins
        const binLayer = new VectorLayer({ 
            source: hexbin, 
            opacity: .5,
            style: styleForBin
        });
        binLayerRef.current = binLayer;
    
        // add bin layer to map
        mapRef.current.addLayer(binLayer);
        // map.addLayer(tileLayer);
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
    }

    function readOptionsInput() {
        // TODO: better way of doing this
        let sizeInput = document.getElementById("map-size-input") as HTMLInputElement;

        if (sizeInput) {
            setSize(Number(sizeInput.value))
        }

        calcBins();
    }

    // called when component has mounted
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // initialize the tile layer
        const tileLayer = new TileLayer({
            source: new OSM(), 
            preload: Infinity 
        });
        
        // initialize the map object
        const map = new Map({
            view: new View({
                center: [-11000000, 4600000],
                zoom: 2,
            }),
            layers: [
                tileLayer
            ],
            target: mapContainerRef.current
        });
        mapRef.current = map;

        // setup interaction handler for clicking on features
        var select  = new Select();
        map.addInteraction(select);
        select.on('select', handleFeatureSelect);

        // create vector source to store data points
        const vectorSource = new Vector();
        addFeatures(2000, vectorSource);
        vectorSourceRef.current = vectorSource;
        
        // calculate the bins for the map
        calcBins();

        return () => map.setTarget('');
    }, []);

    return (
        <div className='map-container'>
            <div ref={mapContainerRef} style={{ height: height+"px", width: width+"px" }} className="map"/>
            <div className='map-controls'>
                <label htmlFor="size">Size:</label>
                <input id="map-size-input" type="number" min={1000} max={300000} defaultValue={size} step={10000} onChange={readOptionsInput}/>
            </div>
        </div>
        
    );
}
