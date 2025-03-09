import { Accordion } from '@mantine/core';
import { IconFlame, IconHexagons, IconMap, IconPlus } from '@tabler/icons-react';
import React from 'react';
import styles from '../../BinMap.module.css';
import { BaseLayerOptions, LayerDisplayInfoSet } from '../../BinMapOptions';
import LayerControl from '../Controls/LayerControl';
import NewLayerFieldset from '../Controls/LayerFieldsets/NewLayerFieldset';

export interface LayersTabProps {
    layerConfigs: BaseLayerOptions[];
    layerDisplayInfoSet: LayerDisplayInfoSet;
    newLayerConfig: BaseLayerOptions;
    expandedLayerConfigId: string | undefined;
    dataTags: any[];
    handleLayerControlChange?: (id: string, key: string, value: any) => void;
    handleDeleteLayer?: (id: string) => void;
    handleCreateLayer?: () => void;
    handleSetExpandedLayerConfigId?: () => void;
};

export default function LayersTab({ layerConfigs, expandedLayerConfigId, layerDisplayInfoSet, newLayerConfig, dataTags, handleLayerControlChange, handleDeleteLayer, handleCreateLayer, handleSetExpandedLayerConfigId }: LayersTabProps) {

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

    function handleNewLayerControlChange(key: string, value: any) {
        handleLayerControlChange!(newLayerConfig.id, key, value);
    }

    return (<>
        <Accordion
            // multiple
            value={expandedLayerConfigId}
            className={styles.layerConfigs}
            classNames={{
                label: styles.label,
                chevron: styles.chevron,
                control: styles.control,
                item: styles.item,
            }}
            onChange={handleSetExpandedLayerConfigId}
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
                            binRange={layerDisplayInfoSet[layerConfig.id].binRanges}
                            dataTags={dataTags}
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
                    <NewLayerFieldset config={newLayerConfig} handleInputChange={handleNewLayerControlChange} handleCreateCallback={handleCreateLayer} />
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    </>);
}
