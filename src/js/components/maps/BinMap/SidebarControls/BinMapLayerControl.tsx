
import React, { useEffect, useState } from 'react';
import { BaseLayerOptions, BinLayerOptions, HeatmapLayerOptions, TileLayerOptions } from '../BinMapOptions';
import styles from './SidebarControls.module.css';
import BinLayerFieldset from './LayerFieldsets/BinLayerFieldset';
import HeatmapLayerFieldset from './LayerFieldsets/HeatmapLayerFieldset';
import TileLayerFieldset from './LayerFieldsets/TileLayerFieldset';
import GeneralLayerFieldset from './LayerFieldsets/GeneralLayerFieldset';

export interface BinMapLayerControlProps {
    config: BaseLayerOptions;
    binRange?: any;
    updateCallback?: any;
    deleteLayerCallback: any;
};

export default function BinMapLayerControl({ config, binRange, updateCallback, deleteLayerCallback }: BinMapLayerControlProps) {

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

    // TODO: this is duplicated in binMapView, you should refactor so this is not the case
    function getRangeValue(binLayerConfig: BinLayerOptions, isMax: boolean, modeOverride?: string) {

        let value = 0;
        switch (modeOverride ? modeOverride : binLayerConfig.intervalMode) {
            case 'manual':
                value = isMax ? binLayerConfig.customMax : binLayerConfig.customMin;
                break;
            case 'IQR':
                value = isMax ? binRange.iqr_max : binRange.iqr_min;
                break
            case 'full':
            default:
                value = isMax ? binRange.full_max : binRange.full_min;
        }
        return value;
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
        if (!binRange) return;
        let interval;
        let min = 0;
        let max = 1;

        if (binConfig.intervalMode === 'full') {
            interval = [0, 1];
        } else if (binConfig.intervalMode === 'IQR') {
            let fullMin = getRangeValue(binConfig, false, 'full');
            let fullMax = getRangeValue(binConfig, true, 'full');
            let iqrMin = getRangeValue(binConfig, false, 'IQR');
            let iqrMax = getRangeValue(binConfig, true, 'IQR');
            interval = [(iqrMin - fullMin) / (fullMax - fullMin), (iqrMax - fullMin) / (fullMax - fullMin)];
        } else {
            interval = [binConfig.customMin, binConfig.customMax];
            // TODO: increase custom range values for more control
            // min = -1;
            // max = 2;
        }

        setIntervalSliderValues({
            min: min,
            max: max,
            values: interval
        });
    }, [binConfig.aggFuncName, binConfig.binType, binConfig.intervalMode, binRange]);

    return (
        <div className={styles.optionsGroup}>
            {controlForType('general')}
            {controlForType(config.layerType)}
        </div>
    );
}
