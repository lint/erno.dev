import React, { useEffect, useState } from "react";
import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import Feature from "ol/Feature.js";
import { Vector } from "ol/source";
import { VectorSourceEvent } from "ol/source/Vector";
import { Projection } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { BinMapView } from "./BinMapView";
import Geometry from "ol/geom/Geometry";
import {
    BaseLayerOptions,
    BinLayerOptions,
    createBinOptions,
    createHeatmapOptions,
    createTileOptions,
    DataOptions,
    LayerDisplayInfo,
    LayerDisplayInfoSet,
    NewLayerOptions,
} from "./BinMapOptions";
import LayerControl from "./Sidebar/Controls/LayerControl";
import styles from "./BinMap.module.css";
import { Accordion } from "@mantine/core";
import {
    IconFlame,
    IconHexagons,
    IconHome,
    IconMap,
    IconPlus,
    IconStackFront,
    IconTableFilled,
} from "@tabler/icons-react";
import SideBar from "../../layout/sidebar";
import DataControl from "./Sidebar/Tabs/DataTab";
import stateRegions, { stateList } from "../StateRegions";
import NewLayerFieldset from "./Sidebar/Controls/LayerFieldsets/NewLayerFieldset";

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
    const [newLayerConfig, setNewLayerConfig] = useState<NewLayerOptions>({
        title: '',
        placeholder: 'New Layer',
        layerType: 'tile'
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

    function getExpandedLayers() {
        let expandedLayers = [];

        for (let id in layerInfos) {
            if (layerInfos[id].controlExpanded) expandedLayers.push(id);
        }

        return expandedLayers;
    }

    function handleLayerControlChange(id: string, key: string, value: any) {
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

    function handleNewLayerChange(key: string, value: any) {
        setNewLayerConfig(oldConfig => ({
            ...oldConfig,
            [key]: value
        }));
    }

    // get the icon for a given layer type
    function iconForLayerType(layerType: string) {
        switch (layerType) {
            case "bin":
                return <IconHexagons title="Bin Layer" />;
            case "heatmap":
                return <IconFlame title="Heatmap Layer" />;
            case "tile":
                return <IconMap title="Tile Layer" />;
            case "new":
                return <IconPlus title="New Layer" />;
        }
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

    const layerConfigComponents = (<>
        <Accordion
            // multiple
            // defaultValue={getExpandedLayers()}
            defaultValue={getExpandedLayers()[0]}
            className={styles.layerConfigs}
            classNames={{
                label: styles.label,
                chevron: styles.chevron,
                control: styles.control,
                item: styles.item,
            }}
            onChange={handleLayerExpandedChanged}
        >
            {layerConfigs.map((layerConfig) => (
                <Accordion.Item value={layerConfig.id} key={layerConfig.id}>
                    <Accordion.Control
                        classNames={{ icon: layerConfig.visible ? styles.title : styles.titleDisabled }}
                        icon={iconForLayerType(layerConfig.layerType)}
                    >
                        <div className={layerConfig.visible ? styles.title : styles.titleDisabled} >
                            {layerConfig.title}
                        </div>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <LayerControl
                            config={layerConfig}
                            updateCallback={handleLayerControlChange}
                            binRange={layerInfos[layerConfig.id].binRanges}
                            key={layerConfig.id}
                            deleteLayerCallback={handleDeleteLayer}
                        />
                    </Accordion.Panel>
                </Accordion.Item>
            ))}
            <Accordion.Item value="new" >
                <Accordion.Control
                    classNames={{ icon: styles.title }}
                    icon={iconForLayerType("new")}
                >
                    <div className={styles.title} >
                        Add
                    </div>
                </Accordion.Control>
                <Accordion.Panel>
                    <NewLayerFieldset config={newLayerConfig} handleInputChange={handleNewLayerChange} handleCreateCallback={handleAddNewLayer} />
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    </>);
    const dataComponents = (<>
        <Accordion
            multiple
            defaultValue={['addresses']}
            className={styles.layerConfigs}
            classNames={{
                label: styles.label,
                chevron: styles.chevron,
                control: styles.control,
                item: styles.item,
            }}
        >
            <Accordion.Item value='addresses'>
                <Accordion.Control
                    classNames={{ icon: styles.title }}
                    icon={<IconHome />}
                >
                    <div className={styles.title}>Address Numbers</div>
                </Accordion.Control>
                <Accordion.Panel>
                    <DataControl
                        items={stateRegions}
                        updateCallback={handleDataControlChange}
                        config={dataConfig}
                    />
                </Accordion.Panel>
            </Accordion.Item>

        </Accordion>
    </>);
    // const chartComponents = (
    //     <div>
    //         <BinMapChartControl features={features} />
    //     </div>
    // );

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
        },
        // {
        //     label: "Charts",
        //     icon: IconChartDotsFilled,
        //     content: chartComponents,
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
