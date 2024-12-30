import * as d3 from 'd3';
import { FeatureCollection } from 'geojson';
import React, { useState, useRef, useEffect } from 'react';
import './map.css';

type MapProps = {
    width: number;
    height: number;
};

const generateDataset = () => (
    Array(10).fill(0).map(() => ([
        Math.random() * 80 + 10,
        Math.random() * 35 + 10,
    ]))
)

export function MapTest({ width, height }: MapProps) {

    // let allSvgPaths: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined = [];

    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

    const projection = d3.geoMercator()
        .scale(1 / (2 * Math.PI))
        .translate([0, 0]);

    const render = d3.geoPath(projection);

    const tile = d3.tile()
        .extent([[0, 0], [width, height]])
        .tileSize(512);

    const zoom = d3.zoom()
        .scaleExtent([1 << 10, 1 << 15])
        .extent([[0, 0], [width, height]])
        .on("zoom", ({transform}) => zoomed(transform));

    let image = svg.append("g")
        .attr("pointer-events", "none")
        .selectAll("image");

    const path = svg.append("path")
        .attr("pointer-events", "none")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");

    svg
        .call(zoom)
        .call(zoom.transform, d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(-initialScale)
            .translate(...projection(initialCenter))
            .scale(-1));

    const ref = useRef(null);
    // useEffect(() => {
    //   const svgElement = d3.select(ref.current)
    //   svgElement.append("circle")
    //     .attr("cx", 150)
    //     .attr("cy", 70)
    //     .attr("r",  50)
    // }, []);

    const [dataset, setDataset] = useState(
        generateDataset()
    )

    function zoomed(transform) {
        const tiles = tile(transform);
    
        image = image.data(tiles, d => d).join("image")
            .attr("xlink:href", d => url(...d))
            .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
            .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
            .attr("width", tiles.scale)
            .attr("height", tiles.scale);
    
        projection
            .scale(transform.k / (2 * Math.PI))
            .translate([transform.x, transform.y]);
    
        path.attr("d", render(feature));
      }


    return (
        <div>
            <svg ref={ref} className="map" width={width} height={height}>
                {/* {allSvgPaths} */}
                {dataset.map(([x, y], i) => (
        <circle
          cx={x}
          cy={y}
          r="3"
          key={i}
        />
      ))}
            </svg>
        </div>
    );
}
