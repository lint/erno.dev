
import React, { useEffect, useState } from 'react';
import { BaseLayerOptions, BinLayerOptions, getRangeValue, HeatmapLayerOptions, TileLayerOptions } from '../../BinMapOptions';
import styles from './SidebarControls.module.css';
import BinLayerFieldset from './LayerFieldsets/BinLayerFieldset';
import HeatmapLayerFieldset from './LayerFieldsets/HeatmapLayerFieldset';
import TileLayerFieldset from './LayerFieldsets/TileLayerFieldset';
import GeneralLayerFieldset from './LayerFieldsets/GeneralLayerFieldset';

export interface LayerControlProps {
    config: BaseLayerOptions;
    binRange?: any;
    updateCallback?: any;
    deleteLayerCallback: any;
};

export default function LayerControl({ config, binRange, updateCallback, deleteLayerCallback }: LayerControlProps) {

    const binConfig = config as BinLayerOptions;
    const tileConfig = config as TileLayerOptions;
    const heatmapConfig = config as HeatmapLayerOptions;
    const [intervalSliderValues, setIntervalSliderValues] = useState({
        min: 0,
        max: 1,
        values: [0, 1]
    });

    // general input change handler
    function handleInputChange(key: string, value: any) {
        console.log(`input change key=${key} value=${value}`)

        try {
            if (updateCallback) updateCallback(config.id, key, value);
        } catch {
            console.log(`failed to update key=${key} value=${value}`);
        }
    }

    // create controls for a given layer type
    function controlForType(layerType: string) {
        switch (layerType) {
            case 'general':
                return <GeneralLayerFieldset
                    config={config}
                    handleInputChange={handleInputChange}
                    deleteLayerCallback={deleteLayerCallback}
                />;
            case 'tile':
                return <TileLayerFieldset
                    config={tileConfig}
                    handleInputChange={handleInputChange}
                />;
            case 'heatmap':
                return <HeatmapLayerFieldset
                    config={heatmapConfig}
                    handleInputChange={handleInputChange}
                />;
            case 'bin':
                return <BinLayerFieldset
                    config={binConfig}
                    intervalSliderValues={intervalSliderValues}
                    handleInputChange={handleInputChange}
                    handleIntervalSliderChange={setIntervalSliderValues}
                />;
        }
    }

    // update interval slider values when props change
    useEffect(() => {
        if (!binRange || config.layerType !== 'bin') return;
        let interval;
        let min = 0;
        let max = 1;

        if (binConfig.intervalMode === 'full') {
            interval = [0, 1];
        } else if (binConfig.intervalMode === 'IQR') {
            let fullMin = getRangeValue(binConfig, binRange, false, 'full');
            let fullMax = getRangeValue(binConfig, binRange, true, 'full');
            let iqrMin = getRangeValue(binConfig, binRange, false, 'IQR');
            let iqrMax = getRangeValue(binConfig, binRange, true, 'IQR');
            interval = [(iqrMin - fullMin) / (fullMax - fullMin), (iqrMax - fullMin) / (fullMax - fullMin)];
        } else {
            interval = [binConfig.customMin, binConfig.customMax];
            min = binConfig.customMinBound;
            max = binConfig.customMaxBound;
        }

        setIntervalSliderValues({
            min: min,
            max: max,
            values: interval
        });
    }, [binConfig.aggFuncName, binConfig.binType, binConfig.intervalMode, binRange, binConfig.customMaxBound, binConfig.customMinBound]);

    return (
        <div className={styles.optionsGroup}>
            {controlForType('general')}
            {controlForType(config.layerType)}
        </div>
    );
}
