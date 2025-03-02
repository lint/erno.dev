import React from 'react';
import { capitalizeValues, createFieldset, createOptionsItem, createSingleSelectOptionsItem } from '../SidebarControls';
import { ColorInput, Divider, NumberInput, RangeSlider, SegmentedControl, Select } from '@mantine/core';
import { BinLayerOptions, getBackgroundColor } from '../../../BinMapOptions';
import chroma from 'chroma-js';
import styles from '../SidebarControls.module.css';

export interface BinLayerFieldsetProps {
    config: BinLayerOptions;
    intervalSliderValues: {
        min: number;
        max: number;
        values: number[];
    };
    handleInputChange: (key: string, value: any) => void;
    handleIntervalSliderChange: (old: any) => void;
}

export default function BinLayerFieldset({ config, handleInputChange, intervalSliderValues, handleIntervalSliderChange }: BinLayerFieldsetProps) {

    const featureBinSourceUrls = [
        { label: 'States (2.2mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_5m/cb_2023_us_state_5m.geojson' },
        { label: 'Counties (6.2mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_5m/cb_2023_us_county_5m.geojson' },
        { label: 'Congressional Districts (14.3mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_500k/cb_2023_us_cd118_500k.geojson' },
        { label: 'Counties within Congressional Districts (27.7mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_500k/cb_2023_us_county_within_cd118_500k.geojson' },
        { label: 'County Subdivisions (89.2mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_500k/cb_2023_us_cousub_500k.geojson' },
        // { label: 'Lower Chamber State Legislative Districts (35.2mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_500k/cb_2023_us_sldl_500k.geojson' },
        // { label: 'Upper Chamber State Legislative Districts (24.5mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_500k/cb_2023_us_sldu_500k.geojson' },
        // { label: 'Unified School Districts (51.9mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_500k/cb_2023_us_unsd_500k.geojson' },
        { label: 'Places (51.9mb)', value: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_500k/cb_2023_us_place_500k.geojson' },
    ];

    return (<>
        {createFieldset('Bins', (<>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ marginBottom: 0 }} className={styles.optionsItem}>
                    <div className={`${styles.optionsLabel} ${styles.label}`}>Bin Size</div>
                    <NumberInput
                        min={0}
                        max={config.binType === 'hex' ? 1000000 : 10}
                        step={config.binSizeStep}
                        value={config.binSize ? config.binSize : (config.binType === 'hex' ? 80000 : 1)}
                        onChange={value => handleInputChange('binSize', value)}
                        disabled={config.binType === 'feature'}
                        inputSize='8'
                    />
                </div>
                <div className={styles.optionsVertItem}>
                    <div className={`${styles.optionsVertLabel} ${styles.label}`}>Step</div>
                    <NumberInput
                        min={0}
                        step={config.binType === 'hex' ? 100 : 0.01}
                        value={config.binSizeStep ? config.binSizeStep : (config.binType === 'hex' ? 1000 : 0.1)}
                        onChange={value => handleInputChange('binSizeStep', value)}
                        disabled={config.binType === 'feature'}
                        inputSize='4'
                    />
                </div>
            </div>
            {createOptionsItem('Bin Type',
                <SegmentedControl
                    data={capitalizeValues(['hex', 'grid', 'feature'])}
                    value={config.binType}
                    onChange={value => {
                        handleInputChange('binType', value);
                        handleInputChange('binSize', 0); // reset bin size when bin type changes
                        handleInputChange('binSizeStep', 0);
                    }}
                    color="blue"
                />
            )}
            {createSingleSelectOptionsItem(config, 'hexStyle', 'Hex Style', ['pointy', 'flat'], true, config.binType !== 'hex', 'segmented', handleInputChange)}
            {createOptionsItem('Feature Source',
                <Select
                    data={featureBinSourceUrls}
                    defaultValue={config.featureSourceUrl}
                    onChange={value => handleInputChange('featureSourceUrl', value)}
                    searchable
                    disabled={config.binType !== 'feature'}
                />
            )}
            {createSingleSelectOptionsItem(config, 'layerClass', 'Layer Class', ['VectorImage', 'Vector'], false, false, 'segmented', handleInputChange)}
        </>))}
        {createFieldset('Data', (<>
            {createSingleSelectOptionsItem(config, 'aggFuncName', 'Agg Func', ['max', 'min', 'sum', 'len', 'avg'], true, false, 'segmented', handleInputChange)}
            {createSingleSelectOptionsItem(config, 'intervalMode', 'Interval Mode', ['full', 'IQR', 'custom'], true, false, 'segmented', handleInputChange)}
            {createOptionsItem('Interval', <>
                <div className={styles.intervalLabel}>
                    <span className={styles.intervalText}>
                        {intervalSliderValues.values[0].toFixed(3)}
                    </span>
                    <span>-</span>
                    <span className={styles.intervalText}>
                        {intervalSliderValues.values[1].toFixed(3)}
                    </span>
                </div>
            </>)}
            {createOptionsItem('', <>
                <div className={styles.intervalContainer}>
                    <NumberInput
                        value={intervalSliderValues.min}
                        onChange={value => {
                            if (Number(value) < intervalSliderValues.max) {
                                handleInputChange('customMinBound', value)
                            }
                        }}
                        allowDecimal={false}
                        inputSize={`${intervalSliderValues.min.toString().length}`}
                        variant="unstyled"
                        styles={{
                            input: { pointerEvents: 'none' },
                            controls: { pointerEvents: config.intervalMode === 'custom' ? 'auto' : 'none' }
                        }}
                        classNames={{ root: styles.intervalControl }}
                        size='xs'
                    />
                    <Divider size="xs" orientation="vertical" />
                    <div className={styles.intervalSlider}>
                        <RangeSlider
                            showLabelOnHover={false}
                            min={intervalSliderValues.min}
                            max={intervalSliderValues.max}
                            step={0.001}
                            minRange={0}
                            value={intervalSliderValues.values as [number, number]}
                            onChange={value => { handleIntervalSliderChange((old: any) => ({ ...old, values: value })) }}
                            onChangeEnd={value => {
                                handleInputChange('customMin', value[0]);
                                handleInputChange('customMax', value[1]);
                            }}
                            disabled={config.intervalMode !== 'custom'}
                            styles={{
                                label: { display: 'none' },
                            }}
                            size='lg'
                        />
                    </div>
                    <Divider size="xs" orientation="vertical" />
                    <NumberInput
                        value={intervalSliderValues.max}
                        onChange={value => {
                            if (Number(value) > intervalSliderValues.min) {
                                handleInputChange('customMaxBound', value)
                            }
                        }}
                        isAllowed={() => false}
                        allowDecimal={false}
                        inputSize={`${intervalSliderValues.max.toString().length}`}
                        variant="unstyled"
                        styles={{
                            input: { pointerEvents: 'none' },
                            controls: { pointerEvents: config.intervalMode === 'custom' ? 'auto' : 'none' }
                        }}
                        classNames={{ root: styles.intervalControl }}
                        size='xs'
                    />
                </div>
            </>)}
        </>))}
        {createFieldset('Colors', (<>
            {createSingleSelectOptionsItem(config, 'colorMode', 'Color Mode', ['gradient', 'step'], true, false, 'segmented', handleInputChange)}
            {createOptionsItem('Steps',
                <NumberInput
                    min={0}
                    max={16}
                    step={1}
                    defaultValue={config.numColorSteps}
                    allowDecimal={false}
                    onChange={value => handleInputChange('numColorSteps', value)}
                    disabled={config.colorMode !== 'step'}
                    inputSize='4'
                />
            )}
            {createOptionsItem('Color Scale',
                <Select
                    data={Object.keys(chroma.brewer)}
                    defaultValue={config.colorScaleName}
                    onChange={value => handleInputChange('colorScaleName', value)}
                    searchable
                />
            )}
            {createSingleSelectOptionsItem(config, 'backgroundColorMode', 'Background', ['auto', 'custom', 'none'], true, false, 'segmented', handleInputChange)}
            {createOptionsItem('',
                <ColorInput
                    defaultValue={config.customBackgroundColor}
                    value={config.backgroundColorMode !== 'custom' ? getBackgroundColor(config) : undefined}
                    disabled={config.backgroundColorMode !== 'custom'}
                    onChange={value => handleInputChange('customBackgroundColor', value)}
                    style={{ maxWidth: 200 }}
                />
            )}
        </>))}
    </>);
}