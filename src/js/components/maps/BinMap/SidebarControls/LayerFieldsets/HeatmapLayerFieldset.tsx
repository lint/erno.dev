import React from 'react';
import { createFieldset, createOptionsItem, createSingleSelectOptionsItem } from '../SidebarControls';
import { NumberInput, Select, Slider } from '@mantine/core';
import { HeatmapLayerOptions } from '../../BinMapOptions';
import chroma from 'chroma-js';
import styles from '../SidebarControls.module.css';

export interface HeatmapLayerFieldsetProps {
    config: HeatmapLayerOptions;
    handleInputChange: (key: string, value: any) => void;
}

export default function HeatmapLayerFieldset({ config, handleInputChange }: HeatmapLayerFieldsetProps) {

    return (<>
        {createFieldset('Heatmap', <>
            {createOptionsItem('Blur', <>
                <div className={styles.label} style={{ width: 30 }} >{config.blur}</div>
                <Slider
                    defaultValue={config.blur}
                    min={0}
                    max={100}
                    step={1}
                    onChange={value => handleInputChange('blur', value)}
                    style={{ flexGrow: 1, maxWidth: "200px" }}
                    label={null}
                />
            </>)}
            {createOptionsItem('Radius', <>
                <div className={styles.label} style={{ width: 30 }} >{config.radius}</div>
                <Slider
                    defaultValue={config.radius}
                    min={0}
                    max={50}
                    step={0.5}
                    onChange={value => handleInputChange('radius', value)}
                    style={{ flexGrow: 1, maxWidth: "200px" }}
                    label={null}
                />
            </>)}
            {createSingleSelectOptionsItem(config, 'aggFuncName', 'Agg Func', ['max', 'min', 'sum', 'len', 'avg'], true, false, 'segmented', handleInputChange)}
        </>)}
        {createFieldset('Colors', (<>
            {createOptionsItem('Color Scale',
                <Select
                    data={Object.keys(chroma.brewer)}
                    defaultValue={config.colorScaleName}
                    onChange={value => handleInputChange('colorScaleName', value)}
                    searchable
                />
            )}
            {createOptionsItem('Steps',
                <NumberInput
                    min={0}
                    max={16}
                    step={1}
                    defaultValue={config.numColorSteps}
                    allowDecimal={false}
                    onChange={value => handleInputChange('numColorSteps', value)}
                    inputSize='4'
                />
            )}
        </>))}
    </>);
}