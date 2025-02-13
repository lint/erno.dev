import React, { useEffect, useState } from 'react';
import 'ol/ol.css';
import "ol-ext/dist/ol-ext.css";
import Feature from 'ol/Feature.js';
import { Vector } from 'ol/source';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';
import { Projection } from 'ol/proj';
import chroma from 'chroma-js';
import GeoJSON from 'ol/format/GeoJSON';
import { BinMapView } from './BinMapView';
import Geometry from 'ol/geom/Geometry';
import { BaseLayerOptions, BinLayerOptions, HeatmapLayerOptions, LayerDisplayInfo, LayerDisplayInfoSet, TileLayerOptions } from './BinMapLayerOptions';
import BinMapLayerControl from './BinMapLayerControl';
import styles from './BinMap.module.css';
import { Accordion } from '@mantine/core';
import { IconFlame, IconHexagons, IconMap, IconStackFront, IconTableFilled } from '@tabler/icons-react';
import SideBar from '../layout/sidebar';
import BinMapDataControl from './BinMapDataControl';
import stateRegions, { stateList } from './StateRegions';

export function BinMap() {

    // console.log("BinMap function called ...");

    const defaultExpandedLayerControls = ['bin_test'];
    const [countyFeatureSource, setCountyFeatureSource] = useState<VectorSource>();
    const [dataSourceUrls, setDataSourceUrls] = useState<string[]>([]);
    // const legendContainerRef = useRef(null);

    const [cachedFeatures, setCachedFeatures] = useState({});
    const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
    const defaultLayerConfigs = [
        {
            id: "tile_test",
            title: "Tile Layer",
            layerType: "tile",
            visible: true,
            opacity: 100,
            tileSourceUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            zIndex: 1,
        } as TileLayerOptions,
        {
            id: "bin_test",
            title: "Bin Layer",
            layerType: "bin",
            visible: true,
            opacity: 100,
            hexStyle: "pointy",
            colorMode: "gradient",
            binType: "hex",
            binSize: 0,
            aggFuncName: "max",
            layerClass: 'VectorImage',
            numColorSteps: 5,
            colorScaleName: "Viridis",
            customMin: 0,
            customMax: 1,
            zIndex: 2,
            intervalMode: 'full',
            backgroundColorMode: 'none',
            customBackgroundColor: chroma.scale("Viridis")(0).darken().hex(),
        } as BinLayerOptions,
        {
            id: "heatmap_test",
            title: "Heatmap Layer",
            layerType: "heatmap",
            visible: false,
            opacity: 100,
            zIndex: 3,
            blur: 10,
            radius: 10,
            followsBinLayerId: 'bin_test'
        } as HeatmapLayerOptions,
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
    const [layerInfos, setLayerInfos] = useState<LayerDisplayInfoSet>(createLayerDisplaySet());

    function createLayerDisplaySet() {

        let displaySet: LayerDisplayInfoSet = {};

        for (let config of layerConfigs) {
            let displayInfo: LayerDisplayInfo = {
                controlExpanded: defaultExpandedLayerControls.indexOf(config.id) > -1,
                binRanges: undefined
            };
            displaySet[config.id] = displayInfo;
        }

        return displaySet;
    }

    // reset any randomly added features
    // function handleResetFeaturesButton() {
    //     // if (!dataSourceRef.current) return;
    //     setFeatures([]);
    //     addPresetFeatures();
    // }

    // load features from preset data file
    // function addPresetFeatures(vectorSource: Vector) {
    function addPresetFeatures() {

        let proj = new Projection({ code: "EPSG:3857" });

        let promises = dataSourceUrls.map(url => (
            new Promise((resolve, reject) => {

                if (url in cachedFeatures) {
                    // console.log("found cached features for: ", url)
                    resolve(cachedFeatures[url as keyof typeof cachedFeatures]);
                    return;
                }

                let binSource = new Vector({
                    url: url,
                    format: new GeoJSON(),
                    // loader: () => {
                    // }
                });
                // console.log("loading features for url:", url)
                // force source to load
                binSource.loadFeatures([0, 0, 0, 0], 0, proj);

                binSource.on('featuresloadend', (e: VectorSourceEvent) => {
                    if (e.features) {
                        setCachedFeatures(oldFeatures => { return { ...oldFeatures, [url]: e.features } })
                        resolve(e.features);
                    } else {
                        reject(`No features loaded for url: ${url}`);
                    }
                });
            })
        ));

        Promise.all(promises)
            .then((featureSets) => {
                setFeatures((oldFeatures) => { return [...oldFeatures, ...featureSets.flat() as Feature[]] });
            });
    }


    // returns the chroma js color scale for the currently selected input
    // function getColorScale() {
    //     // let scaleName = optionsRef.current.colorScaleName;
    //     // TODO: better legend system now that you can have multiple bin layers
    //     let scaleName = 'viridis';
    //     let scale = chroma.scale(scaleName);
    //     return scale
    // }

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

    function handleRangesCallback(displaySet: LayerDisplayInfoSet) {
        for (let id in displaySet) {
            if (!(id in layerInfos)) continue;
            layerInfos[id].binRanges = displaySet[id].binRanges;
        }
        setLayerInfos(oldLayerInfos => ({ ...oldLayerInfos }));
    }

    function handleLayerExpandedChanged(ids: string[]) {
        for (let id in layerInfos) {
            layerInfos[id].controlExpanded = ids.indexOf(id) > -1;
        }
        setLayerInfos(oldLayerInfos => ({ ...oldLayerInfos }));
    }

    function getExpandedLayers() {
        let expandedLayers = [];

        for (let id in layerInfos) {
            if (layerInfos[id].controlExpanded) expandedLayers.push(id);
        }

        return expandedLayers;
    }

    function handleLayerControlChange(layerId: string, key: string, value: any) {

        setLayerConfigs((oldLayerConfigs) => {

            for (let i = 0; i < oldLayerConfigs.length; i++) {
                let layerConfig = oldLayerConfigs[i];
                if (layerConfig.id === layerId) {
                    let newLayerConfig = {
                        ...layerConfig,
                        [key]: value
                    };

                    let newLayerConfigs = [...oldLayerConfigs];
                    newLayerConfigs[i] = newLayerConfig;
                    return newLayerConfigs;
                }
            }

            return oldLayerConfigs;
        });
    }

    // get the icon for a given layer type
    function iconForLayerType(layerType: string) {
        switch (layerType) {
            case 'bin':
                return <IconHexagons title='Bin Layer' />;
            case 'heatmap':
                return <IconFlame title='Heatmap Layer' />;
            case 'tile':
                return <IconMap title='Tile Layer' />;
        }
    }

    useEffect(() => {

        // load US county data source
        let binSource = new Vector({
            url: '/data/counties.geojson',
            format: new GeoJSON(),
            // loader: () => {
            // }
        });
        setCountyFeatureSource(binSource);

        // force source to load
        binSource.loadFeatures([0, 0, 0, 0], 0, new Projection({ code: "EPSG:3857" }));
        // console.log(binSource.getFeatures())
    }, []);

    useEffect(() => {
        setFeatures([]);
        addPresetFeatures();
    }, [dataSourceUrls]);

    // useEffect(() => {
    //     refreshLegend();
    // }, [options.colorScaleName, options.binStyle, options.numColorSteps]);

    const layerConfigComponents = (
        <Accordion
            multiple
            defaultValue={getExpandedLayers()}
            className={styles.layerConfigs}
            classNames={{ label: styles.label, chevron: styles.chevron, control: styles.control, item: styles.item }}
            onChange={handleLayerExpandedChanged}
        >
            {layerConfigs.map(layerConfig => (
                <Accordion.Item value={layerConfig.id} key={layerConfig.id}>
                    <Accordion.Control classNames={{ icon: layerConfig.visible ? styles.title : styles.titleDisabled }} icon={iconForLayerType(layerConfig.layerType)}>
                        <div className={layerConfig.visible ? styles.title : styles.titleDisabled}>
                            {layerConfig.title}
                        </div>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <BinMapLayerControl config={layerConfig} updateCallback={handleLayerControlChange} binRange={layerInfos[layerConfig.id].binRanges} key={layerConfig.id} />
                    </Accordion.Panel>
                </Accordion.Item>
            ))}
        </Accordion>
    );
    const dataComponents = (<>
        <BinMapDataControl 
            items={stateRegions} 
            initialCheckedValues={stateList}
            updateCallback={setDataSourceUrls}
        />
    </>);

    const sidebarItems = [
        {
            label: "Layers",
            icon: IconStackFront,
            content: layerConfigComponents,
        },
        {
            label: "Data",
            icon: IconTableFilled,
            content: dataComponents,
        }
    ];

    return (
        <div className={styles.page}>
            {/* <div ref={legendContainerRef} className="legend-container">
                    <div className="gradient">
                        {getColorScale().colors(100).map((color, index) => (
                            <span className="grad-step" key={index} style={{ backgroundColor: color }}></span>
                        ))}
                    </div>
            </div> */}

            <SideBar items={sidebarItems} activeItem='Data' />
            <BinMapView features={features} layerConfigs={layerConfigs} featureBinSource={countyFeatureSource} rangesCallback={handleRangesCallback} />
        </div >
    );
}
