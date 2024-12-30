
import React, { useState, useEffect, Component } from 'react';
import * as d3 from "d3";
import * as d3_hex from 'd3-hexbin';
import { Map } from '../../components/plot/map';
import { data } from '../../components/plot/data2';
import { FeatureCollection } from 'geojson';
import { Hexbin } from '../../components/plot/Hexbin';
import { MapTest } from '../../components/plot/map_test';

// function HexBinMap(dispatch: any, world: any, data: any, nestedData: any, dateFormat: any) {

//     var formatDate = d3.timeFormat(dateFormat);

//     var keyedTweets = {};
//     nestedData.entries(data).forEach(function(nestedTweet) {
//       keyedTweets[nestedTweet.key] = nestedTweet.values;
//     });

//     init();

//     function init() {
//       createHexbinChart();
//     }

//     function createHexbinChart() {
//       var svg = d3.select("#map");
//       var width = svg.attr("width"),
//           height = svg.attr("height");

//       var projection = d3.geoMercator()
//         .scale(150)
//         .translate([width / 2, height / 2]);

//       var path = d3.geoPath()
//         .projection(projection);

//       data.forEach(function(tweet) {
//         tweet.projection = projection([tweet.Longitude, tweet.Latitude]);
//       });

//       var points = data.map(function(tweet) {
//         return tweet.projection;
//       });

//       var hexbinsGroup;
//       var hexbin = d3.hexbin()
//         .radius(5);
//       var color = d3.scaleSequential(d3.interpolateMagma);

//       addMap();
//       createHexbins(points);

//       dispatch.on("selectDateRange", selectDateRange);

//       function selectDateRange(dateRange) {
//         var filteredTweets = filterTweetsByDateRange(dateRange);
//         var filteredPoints = filteredTweets.map(function(tweet) {
//           return tweet.projection;
//         });
//         updateHexbins(filteredPoints);

//         dispatch.call("updateSelection", this, {
//           total: points.length,
//           selected: filteredPoints.length
//         });
//       }

//       function filterTweetsByDateRange(dateRange) {
//         var dayDifference = d3.timeDay.count(dateRange.from, dateRange.to);
//         if (dayDifference === 0 ) return [];

//         var keys = d3.range(0, dayDifference + 1)
//           .map(function(n) {
//             var d = d3.timeDay.offset(dateRange.from, n);
//             return formatDate(d);
//           });

//         var arraysToConcat = [];
//         keys.forEach(function(key) {
//           if (key in keyedTweets) {
//             arraysToConcat.push(keyedTweets[key]);
//           }
//         });
//         var filteredTweets = [].concat.apply([], arraysToConcat);
//         return filteredTweets;
//       }

//       function removeSelection() {
//         updateHexbins(points);
//       }

//       function addMap() {
//         svg = d3.select("#map")
//           .attr("width", width)
//           .attr("height", height)
//           .on("click", function() {
//             dispatch.call("removeSelection", this);
//             removeSelection();
//           });

//         svg.append("path")
//          .datum(topojson.feature(world, world.objects.land))
//          .attr("class", "land")
//          .attr("d", path);

//         svg.append("path")
//          .datum(topojson.mesh(world, world.objects.countries))
//          .attr("class", "boundary")
//          .attr("d", path);

//          hexbinsGroup = svg.append("g")
//            .attr("clip-path", "url(#clip)");
//       }

//       function createHexbins(points) {
//         var bins = hexbin(points);

//         color
//           .domain([d3.max(bins, function(d) { return d.length; }), 0]);

//         hexbinsGroup
//           .selectAll(".hexagon")
//             .data(bins, function(d) { return d.x + "," + d.y; })
//           .enter().append("path")
//             .attr("class", "hexagon")
//             .attr("d", hexbin.hexagon())
//             .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
//             .style("fill", function(d) { return color(d.length); });
//       }

//       function updateHexbins(points) {
//         var bins = hexbin(points);

//         color
//           .domain([d3.max(bins, function(d) { return d.length; }), 0]);

//         var hexagon = hexbinsGroup.selectAll(".hexagon")
//           .data(bins, function(d) { return d.x + "," + d.y; });

//         hexagon.exit().remove();

//         hexagon
//           .enter().append("path")
//             .attr("class", "hexagon")
//             .attr("d", hexbin.hexagon())
//             .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
//           .merge(hexagon)
//             .style("fill", function(d) { return color(d.length); });
//       }
//     }

// };


export default function MapsDashboardPage() {

    // useEffect(() => { drawChart() }, []);

    // function drawChart() {
    //     let mapContainer = document.getElementById("map-container");
    //     if (mapContainer) {
    //         mapContainer.innerHTML = "";
    //     }
    //     const data = [12, 5, 6, 6, 9, 10];

    //     const svg = d3.select("#map-container")
    //                 .append("svg")
    //                 .attr("width", 700)
    //                 .attr("height", 300);

    //     // Specify the map’s dimensions and projection.
    //     const width = 928;
    //     const height = 581;
    //     const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);

    //     // Create the container SVG.
    //     // const svg = d3.create("svg")
    //     //     .attr("viewBox", [0, 0, width, height])
    //     //     .attr("width", width)
    //     //     .attr("height", height)
    //     //     .attr("style", "max-width: 100%; height: auto;");

    //     // Create the bins.
    //     // const hexbin = d3_hex.hexbin()
    //     //     .extent([[0, 0], [width, height]])
    //     //     .radius(10)
    //     //     .x(d => d[0])
    //     //     .y(d => d[1]);
    //     // const bins = hexbin(walmarts.map(d => ({xy: projection([d.longitude, d.latitude]), date: d.date})))
    //     //     .map(d => (d.date = new Date(d3.median(d, d => d.date)), d))
    //     //     .sort((a, b) => b.length - a.length)

    //     // Create the color and radius scales.
    //     // const color = d3.scaleSequential(d3.extent(bins, d => d.date), d3.interpolateSpectral);
    //     // const radius = d3.scaleSqrt([0, d3.max(bins, d => d.length)], [0, hexbin.radius() * Math.SQRT2]);

    //     // // Append the color legend.
    //     // svg.append("g")
    //     //     .attr("transform", "translate(580,20)")
    //     //     .append(() => legend({
    //     //     color, 
    //     //     title: "Median opening year", 
    //     //     width: 260, 
    //     //     tickValues: d3.utcYear.every(5).range(...color.domain()),
    //     //     tickFormat: d3.utcFormat("%Y")
    //     //     }));

    //     // Append the state mesh.
    //     // svg.append("path")
    //     //     .datum(stateMesh)
    //     //     .attr("fill", "none")
    //     //     .attr("stroke", "#777")
    //     //     .attr("stroke-width", 0.5)
    //     //     .attr("stroke-linejoin", "round")
    //     //     .attr("d", d3.geoPath(projection));

    //     // // Append the hexagons.
    //     // svg.append("g")
    //     // .selectAll("path")
    //     // .data(bins)
    //     // .join("path")
    //     //     .attr("transform", d => `translate(${d.x},${d.y})`)
    //     //     .attr("d", d => hexbin.hexagon(radius(d.length)))
    //     //     .attr("fill", d => "#000")
    // }


    return (
        // <div id="map-container"></div>
        // <Map width={1000} height={600} data={data as FeatureCollection}></Map>
        // <MapTest width={1000} height={600} ></MapTest>
        <Hexbin data={data} width={400} height={400} />
    );
}
