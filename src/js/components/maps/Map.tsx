import {
    IconStackFront,
    IconTableFilled
} from "@tabler/icons-react";
import "ol-ext/dist/ol-ext.css";
import "ol/ol.css";
import { Vector } from "ol/source";
import React, { useEffect, useState } from "react";
import SideBar from "../layout/sidebar";
import { stateList } from "./Data/StateRegions";
import { dataManager } from "./DataManager";
import styles from "./Map.module.css";
import {
    BaseLayerOptions,
    createBinOptions,
    createHeatmapOptions,
    createNewDataOptions,
    createNewLayerOptions,
    createTileOptions,
    DataOptions,
    LayerDisplayInfo,
    LayerDisplayInfoSet
} from "./MapOptions";
import { MapView } from "./MapView";
import { capitalizeValue } from "./Sidebar/Controls/SidebarControls";
import DataTab from "./Sidebar/Tabs/DataTab";
import LayersTab from "./Sidebar/Tabs/LayersTab";

export function Map() {
    // console.log("BinMap function called ...");
    const [cachedRegionSources, setCachedRegionSources] = useState<{ [key: string]: Vector }>({});
    const [features, setFeatures] = useState<{ [key: string]: Vector }>({});

    const [dataConfigs, setDataConfigs] = useState<DataOptions[]>([
        createNewDataOptions('default', 'default', [...stateList]),
    ]);
    const [selectedDataConfigId, setSelectedDataConfigId] = useState(dataConfigs.length > 0 ? dataConfigs[0].id : '');
    const defaultLayerConfigs = [
        createTileOptions('Tile Layer', 'tile_test', 1),
        createBinOptions('Bin Layer', 'bin_test', 2),
        createHeatmapOptions('Heatmap Layer', 'heatmap_test', 3, false),
    ];
    const [newLayerConfig, setNewLayerConfig] = useState<BaseLayerOptions>(createNewLayerOptions());
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
    const [expandedDataItemId, handleSetExpandedDataItemId] = useState<string>();

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
                    let newConfig;
                    if (key.indexOf('.') === -1) {
                        newConfig = {
                            ...config,
                            [key]: value,
                        };
                    } else {
                        let keyParts = key.split('.');
                        let mainKey = keyParts[0] as keyof typeof config;
                        let newSubConfig = config[keyParts[0] as keyof typeof config];
                        let subKey = keyParts[1] as keyof typeof newSubConfig;
                        newSubConfig = {
                            ...newSubConfig as any,
                            [subKey]: value,
                        };
                        newConfig = {
                            ...config,
                            [mainKey]: newSubConfig
                        }
                    }

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

        let title = newLayerConfig.title ? newLayerConfig.title : `${capitalizeValue(newLayerConfig.layerType)} Layer`;
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
        setNewLayerConfig(oldConfig => ({ ...oldConfig, title: '' }));
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
        dataManager.loadRegions(layerConfigs, setCachedRegionSources);
    }, [layerConfigs])

    useEffect(() => {
        dataManager.loadFeatures(dataConfigs, setFeatures);
    }, [dataConfigs]);

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
                expandedItemId={expandedDataItemId}
                handleSelectConfig={setSelectedDataConfigId}
                handleUpdateConfig={handleDataControlChange}
                handleCopyConfig={handleCopyDataConfig}
                handleRemoveConfig={handleRemoveDataConfig}
                handleCreateConfig={handleCreateDataConfig}
                handleSetExpandedDataItemId={handleSetExpandedDataItemId as any}
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
            <MapView
                features={features}
                layerConfigs={layerConfigs}
                regionSources={cachedRegionSources}
                rangesCallback={handleRangesCallback}
            />
        </div>
    );
}
