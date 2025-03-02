import {
    IconStackFront,
    IconTableFilled
} from "@tabler/icons-react";
import "ol-ext/dist/ol-ext.css";
import Feature from "ol/Feature.js";
import GeoJSON from "ol/format/GeoJSON";
import Geometry from "ol/geom/Geometry";
import "ol/ol.css";
import { Projection } from "ol/proj";
import { Vector } from "ol/source";
import { VectorSourceEvent } from "ol/source/Vector";
import React, { useEffect, useState } from "react";
import SideBar from "../../layout/sidebar";
import stateRegions, { stateList } from "../StateRegions";
import styles from "./BinMap.module.css";
import {
    BaseLayerOptions,
    BinLayerOptions,
    createBinOptions,
    createHeatmapOptions,
    createTileOptions,
    DataOptions,
    LayerDisplayInfo,
    LayerDisplayInfoSet
} from "./BinMapOptions";
import { BinMapView } from "./BinMapView";
import DataTab from "./Sidebar/Tabs/DataTab";
import LayersTab from "./Sidebar/Tabs/LayersTab";

export function BinMap() {
    // console.log("BinMap function called ...");

    const defaultExpandedLayerControls = ["bin_test"];
    const [dataConfigs, setDataConfigs] = useState<DataOptions[]>([
        {
            id: 'default',
            title: 'default',
            dataResolution: '0.5',
            selectedStates: stateList,
            selectedCities: []
        }
    ]);
    const [selectedDataConfigId, _] = useState('default');
    const dataConfig = dataConfigs[0];

    const [cachedFeatures, setCachedFeatures] = useState({});
    const [cachedRegions, setCachedRegions] = useState({});
    const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
    const defaultLayerConfigs = [
        createTileOptions('Tile Layer', 'tile_test', 1),
        createBinOptions('Bin Layer', 'bin_test', 2),
        createHeatmapOptions('Heatmap Layer', 'heatmap_test', 3, false),
    ];
    const [newLayerConfig, setNewLayerConfig] = useState<BaseLayerOptions>({
        title: '',
        layerType: 'tile',
        id: 'add_new_layer',
        visible: true,
        opacity: 100,
        zIndex: 1
    });
    const [layerConfigs, setLayerConfigs] = useState<BaseLayerOptions[]>(defaultLayerConfigs);
    const [layerInfos, setLayerInfos] = useState<LayerDisplayInfoSet>(() => {
        let displaySet: LayerDisplayInfoSet = {};
        for (let config of layerConfigs) {
            let displayInfo: LayerDisplayInfo = {
                controlExpanded:
                    defaultExpandedLayerControls.indexOf(config.id) > -1,
                binRanges: undefined,
            };
            displaySet[config.id] = displayInfo;
        }
        return displaySet;
    });

    // load features from preset data file
    function addPresetFeatures() {
        let baseUrl = 'https://lint.github.io/AggregatedAddresses/data/aggregate/{dataset}/us/{state}/data.geojson';
        let urls = dataConfig.selectedStates.map(state => baseUrl.replace('{dataset}', dataConfig.dataResolution).replace('{state}', state.toLowerCase()));
        let proj = new Projection({ code: "EPSG:3857" });

        let promises = urls.map((url) =>
            new Promise((resolve, reject) => {
                if (url in cachedFeatures) {
                    // console.log("found cached features for: ", url)
                    resolve(
                        cachedFeatures[url as keyof typeof cachedFeatures]
                    );
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

                binSource.on("featuresloadend", (e: VectorSourceEvent) => {
                    if (e.features) {
                        setCachedFeatures((oldFeatures) => {
                            return { ...oldFeatures, [url]: e.features };
                        });
                        resolve(e.features);
                    } else {
                        reject(`No features loaded for url: ${url}`);
                    }
                });
            })
        );

        Promise.all(promises).then((featureSets) => {
            // setFeatures((oldFeatures) => { return [...oldFeatures, ...featureSets.flat() as Feature[]] });
            setFeatures(featureSets.flat() as Feature[]);
        });
    }

    // download region / feature bin sources from a given url
    function addRegionSourceUrl(url: string) {
        console.log("addRegionSourceUrl:", url);

        // TODO: ensure this is done async?
        let proj = new Projection({ code: "EPSG:3857" });

        if (url in cachedRegions) {
            // console.log("found cached features for: ", url)
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

        binSource.on("featuresloadend", () => {
            setCachedRegions((oldRegions) => {
                return { ...oldRegions, [url]: binSource };
            });
        });
    }

    function handleRangesCallback(displaySet: LayerDisplayInfoSet) {
        for (let id in displaySet) {
            if (!(id in layerInfos)) continue;
            layerInfos[id].binRanges = displaySet[id].binRanges;
        }
        setLayerInfos((oldLayerInfos) => ({ ...oldLayerInfos }));
    }

    // function handleLayerExpandedChanged(ids: string[]) {
    function handleLayerExpandedChanged(updatedId: string | null) {
        for (let id in layerInfos) {
            // layerInfos[id].controlExpanded = ids.indexOf(id) > -1;
            layerInfos[id].controlExpanded = updatedId === id;
        }
        setLayerInfos((oldLayerInfos) => ({ ...oldLayerInfos }));
    }

    function handleLayerControlChange(id: string, key: string, value: any) {
        if (id === newLayerConfig.id) {
            setNewLayerConfig(oldConfig => ({
                ...oldConfig,
                [key]: value
            }));
        } else {
            setLayerConfigs(oldConfigs => {
                for (let i = 0; i < oldConfigs.length; i++) {
                    let layerConfig = oldConfigs[i];
                    if (layerConfig.id === id) {
                        let newConfig = {
                            ...layerConfig,
                            [key]: value,
                        };

                        let newConfigs = [...oldConfigs];
                        newConfigs[i] = newConfig;
                        return newConfigs;
                    }
                }

                return oldConfigs;
            });
        }
    }

    function handleDataControlChange(key: string, value: any) {
        setDataConfigs(oldConfigs => {
            for (let i = 0; i < oldConfigs.length; i++) {
                let layerConfig = oldConfigs[i];
                if (layerConfig.id === selectedDataConfigId) {
                    let newConfig = {
                        ...layerConfig,
                        [key]: value,
                    };

                    let newConfigs = [...oldConfigs];
                    newConfigs[i] = newConfig;
                    return newConfigs;
                }
            }

            return oldConfigs;
        });
    }

    function handleAddNewLayer() {
        console.log("creating new layer", newLayerConfig);
        let config;

        let title = newLayerConfig.title ? newLayerConfig.title : 'New Layer';
        let maxZIndex = 1;
        for (let layerConfig of layerConfigs) {
            if (layerConfig.zIndex > maxZIndex) maxZIndex = layerConfig.zIndex;
        }

        switch (newLayerConfig.layerType) {
            case 'bin':
                config = createBinOptions(title, undefined, maxZIndex + 1, true);
                break;
            case 'tile':
                config = createTileOptions(title, undefined, maxZIndex + 1, true);
                break;
            case 'heatmap':
                config = createHeatmapOptions(title, undefined, maxZIndex + 1, true);
                break;
        }

        if (!config) return;

        setLayerConfigs(oldConfigs => [...oldConfigs, config]);
        setLayerInfos(oldDisplaySet => ({
            ...oldDisplaySet, [config.id]: {
                controlExpanded: true,
                binRanges: undefined,
            }
        }));
    }

    function handleDeleteLayer(id: string) {

        let index = -1;
        for (let i = 0; i < layerConfigs.length; i++) {
            let config = layerConfigs[i];
            if (config.id === id) {
                index = i;
                break;
            }
        }
        if (index === -1) return;
        let newLayerConfigs = [...layerConfigs];
        newLayerConfigs.splice(index, 1);
        setLayerConfigs(newLayerConfigs);
    }

    useEffect(() => {

        // check if new feature source url should be downloaded
        for (let layerConfig of layerConfigs) {
            if (layerConfig.layerType !== 'bin') continue;
            addRegionSourceUrl((layerConfig as BinLayerOptions).featureSourceUrl);
        }
    }, [layerConfigs])

    useEffect(() => {
        // setFeatures([]);
        addPresetFeatures();
    }, [dataConfig.dataResolution, dataConfig.selectedStates]);

    const sidebarItems = [
        {
            label: "Layers",
            icon: IconStackFront,
            content: <LayersTab
                layerConfigs={layerConfigs}
                layerDisplayInfoSet={layerInfos}
                newLayerConfig={newLayerConfig}
                handleLayerExpandedChanged={handleLayerExpandedChanged}
                handleLayerControlChange={handleLayerControlChange}
                handleDeleteLayer={handleDeleteLayer}
                handleCreateLayer={handleAddNewLayer}
            />,
        },
        {
            label: "Data",
            icon: IconTableFilled,
            content: <DataTab
                items={stateRegions}
                updateCallback={handleDataControlChange}
                config={dataConfig}
            />,
        },
        // {
        //     label: "Charts",
        //     icon: IconChartDotsFilled,
        //     content: <ChartTab features={features} />,
        // }
    ];

    return (
        <div className={styles.page}>
            <SideBar items={sidebarItems} activeItem="" cookieKey="binmap" />
            <BinMapView
                features={features}
                layerConfigs={layerConfigs}
                regionSources={cachedRegions}
                rangesCallback={handleRangesCallback}
            />
        </div>
    );
}
