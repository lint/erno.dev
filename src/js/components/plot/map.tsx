import * as d3 from "d3";
import { FeatureCollection } from "geojson";
import React, { useState } from 'react';
import './map.css';


type MapProps = {
  width: number;
  height: number;
  data: FeatureCollection;
};

export function Map({ width, height, data }: MapProps) {

    const projection = d3
    .geoMercator()
    .scale(width / 2 / Math.PI - 40)
    .center([10, 35]);

  const geoPathGenerator = d3.geoPath().projection(projection);

  const allSvgPaths = data.features
    .filter((shape) => shape.id !== 'ATA')
    .map((shape) => {
        let path = geoPathGenerator(shape);

        if (path == null) {
            return;
        }

        return (
            <path
            key={shape.id}
            d={path}
            stroke="lightGrey"
            // strokeWidth={0.5}
            fill="grey"
            // fillOpacity={0.7}
            />
        );
    });

  return (
    <div >
      <svg className="map" width={width} height={height}>
        {allSvgPaths}
      </svg>
    </div>
  );
}