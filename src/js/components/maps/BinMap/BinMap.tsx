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
import { stateList } from "../StateRegions";
import { cityDataForValue } from "../TopCities";
import styles from "./BinMap.module.css";
import {
    BaseLayerOptions,
    BinLayerOptions,
    createBinOptions,
    createHeatmapOptions,
    createNewDataOptions,
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

    const [dataConfigs, setDataConfigs] = useState<DataOptions[]>([
        {
            id: 'default',
            title: 'default',
            dataResolution: '0.5',
            selectedStates: stateList,
            selectedCities: []
        }
    ]);
    const [selectedDataConfigId, setSelectedDataConfigId] = useState(dataConfigs.length > 0 ? dataConfigs[0].id : '');
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
        zIndex: 1,
    });
    const [layerConfigs, setLayerConfigs] = useState<BaseLayerOptions[]>(defaultLayerConfigs);
    const [layerInfos, setLayerInfos] = useState<LayerDisplayInfoSet>(() => {
        let displaySet: LayerDisplayInfoSet = {};
        for (let config of layerConfigs) {
            let displayInfo: LayerDisplayInfo = {
                binRanges: undefined,
            };
            displaySet[config.id] = displayInfo;
        }
        return displaySet;
    });
    const [expandedLayerConfigId, setExpandedLayerConfigId] = useState<string>();

    function findSelectedDataConfig() {
        for (let i = 0; i < dataConfigs.length; i++) {
            if (dataConfigs[i].id === selectedDataConfigId) {
                return dataConfigs[i];
            }
        }

        return undefined;
    }

    // load features from preset data file
    function addPresetFeatures() {

        let selectedDataConfig = findSelectedDataConfig();
        if (!selectedDataConfig) return;

        let stateBaseUrl = 'https://raw.githubusercontent.com/lint/AggregatedAddresses/master/data/aggregate/{dataset}/us/{state}/data.geojson';
        let stateUrls = selectedDataConfig.selectedStates.map(state => stateBaseUrl.replace('{dataset}', selectedDataConfig.dataResolution).replace('{state}', state.toLowerCase()));

        let cityBaseUrl = 'https://raw.githubusercontent.com/lint/AggregatedAddresses/master/data/us_50_cities/{state}/{city}.geojson';
        let cityUrls = [];

        for (let city of selectedDataConfig.selectedCities) {
            let cityData = cityDataForValue(city);
            if (!cityData) continue;

            for (let i = 1; i <= cityData.file_parts; i++) {
                cityUrls.push(cityBaseUrl.replace('{state}', cityData.state).replace('{city}', cityData.city));
            }
        }

        let urls = [...stateUrls, ...cityUrls];
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
        console.log("handleDataControlChange", key, value)
        setDataConfigs(oldConfigs => {
            for (let i = 0; i < oldConfigs.length; i++) {
                let config = oldConfigs[i];
                if (config.id === selectedDataConfigId) {
                    let newConfig = {
                        ...config,
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

    function handleCopyDataConfig(configId: string) {
        console.log("handleCopyDataConfig", configId);
        setDataConfigs(oldConfigs => {
            let newConfig;
            for (let i = 0; i < oldConfigs.length; i++) {
                let config = oldConfigs[i];
                if (config.id === configId) {
                    newConfig = {
                        ...config,
                        id: crypto.randomUUID(),
                    };
                    break;
                }
            }
            if (!newConfig) {
                newConfig = createNewDataOptions(`config ${oldConfigs.length + 1}`);
            }
            newConfig.title += '*';
            return [...oldConfigs, newConfig];
        });
    }

    function handleRemoveDataConfig(configId: string) {
        console.log("handleRemoveDataConfig", configId);
        setDataConfigs(oldConfigs => {
            for (let i = 0; i < oldConfigs.length; i++) {
                let config = oldConfigs[i];
                if (config.id === configId) {

                    let newConfigs = [...oldConfigs];
                    newConfigs.splice(i, 1)
                    return newConfigs;
                }
            }
            return oldConfigs;
        });
    }

    function handleCreateDataConfig() {
        console.log("handleCreateDataConfig");
        setDataConfigs(oldConfigs => {
            let newConfig = createNewDataOptions(`config ${oldConfigs.length + 1}`);
            return [...oldConfigs, newConfig];
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
    }, [dataConfigs, selectedDataConfigId]);
    // }, [dataConfig.dataResolution, dataConfig.selectedStates]);

    const sidebarItems = [
        {
            label: "Layers",
            icon: IconStackFront,
            content: <LayersTab
                layerConfigs={layerConfigs}
                layerDisplayInfoSet={layerInfos}
                newLayerConfig={newLayerConfig}
                handleLayerControlChange={handleLayerControlChange}
                handleDeleteLayer={handleDeleteLayer}
                handleCreateLayer={handleAddNewLayer}
                handleSetExpandedLayerConfigId={setExpandedLayerConfigId as any}
                expandedLayerConfigId={expandedLayerConfigId}
                dataTags={dataConfigs.map(config => ({ label: config.title, value: config.id })).sort()}
            />,
        },
        {
            label: "Data",
            icon: IconTableFilled,
            content: <DataTab
                configs={dataConfigs}
                selectedConfigId={selectedDataConfigId}
                handleSelectConfig={setSelectedDataConfigId}
                handleUpdateConfig={handleDataControlChange}
                handleCopyConfig={handleCopyDataConfig}
                handleRemoveConfig={handleRemoveDataConfig}
                handleCreateConfig={handleCreateDataConfig}
            />,
        },
        // {
        //     label: "Charts",
        //     icon: IconChartDotsFilled,
        //     content: <ChartTab features={features} />,
        // },
        // {
        //     label: 'Settings',
        //     icon: IconSettings,
        //     content: <div></div>
        // },
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
