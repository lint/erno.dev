import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import "ol-ext/dist/ol-ext.css";
import './map.css';
import {Select, Modify } from 'ol/interaction';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import HexBin from 'ol-ext/source/HexBin';
import { Vector } from 'ol/source';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import RegularShape from 'ol/style/RegularShape.js';

type MapProps = {
    width: number;
    height: number;
};

export function MapPlot({ width, height }: MapProps) {

    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;
        
        const tileLayer = new TileLayer({
            source: new OSM(), 
            preload: Infinity 
        });

        const mapObj = new Map({
            view: new View({
                center: [-11000000, 4600000],
                zoom: 2,
            }),
            layers: [
                tileLayer
            ],
            target:mapRef.current
        });

        var select  = new Select();
        mapObj.addInteraction(select);
        select.on('select', function(e){
          if (e.selected.length){
            var f = e.selected[0].get('features');
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
        });

        // Create a set of features on seed points
        function addFeatures(nb: any){
            var ssize = 20;		// seed size
            var ext = mapObj.getView().calculateExtent(mapObj.getSize());
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

        const vectorSource = new Vector();
        addFeatures(2000);

        var size = 300000;
        var style = 'gradient';
        var min = 0, max = 100, maxi;
        var minRadius = 1;
        // res = resolution = zoom level
        var styleFn = function(f: any, res: any){
          switch (style){
            // Display a point with a radius 
            // depending on the number of objects in the aggregate.
            case 'point':{
              var radius = Math.round(size/res +0.5) * Math.min(1,f.get('features').length/max);
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
              var opacity = Math.min(1,f.get('features').length/max);
              return [ new Style({ fill: new Fill({ color: [0,0,255,opacity] }) }) ];
            }
            // Display the polygon with a color
            // depending on the number of objects in the aggregate.
            case 'color':
            default: {
              var color;
              if (f.get('features').length > max) color = [136, 0, 0, 1];
              else if (f.get('features').length > min) color = [255, 165, 0, 1];
              else color = [0, 136, 0, 1];
              return [ new Style({ fill: new Fill({  color: color }) }) ];
            }
          }
        };
    
        const hexbin = new HexBin({
            source: vectorSource,
            size: size
        });

        const layer = new VectorLayer({ 
            source: hexbin, 
            opacity: .5, 
            style: styleFn
        });

        const features = hexbin.getFeatures();
        // Calculate min/ max value
        min = Infinity;
        max = 0;
        for (var i=0, f; f = features[i]; i++) {
          var n = f.get('features').length;
          if (n<min) min = n;
          if (n>max) max = n;
        }
        var dl = (max-min);
        maxi = max;
        min = Math.max(1,Math.round(dl/4));
        max = Math.round(max - dl/3);
    
        // Add layer
        mapObj.addLayer(layer);
        // mapObj.addLayer(tileLayer);

        return () => mapObj.setTarget('');
    }, []);

    return (
        <div ref={mapRef}  style={{ height: height+"px", width: width+"px" }} className="map"/>
    );
}
