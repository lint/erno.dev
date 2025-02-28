import React from 'react';
import styles from './BinMap.module.css';
import { Divider } from '@mantine/core';
import { BaseLayerOptions, BinLayerOptions, getRangeValue, LayerDisplayInfoSet } from './BinMapOptions';
import chroma from 'chroma-js';

export interface BinMapLegendProps {
    layerConfigs: BaseLayerOptions[];
    layerDisplayInfo: LayerDisplayInfoSet;
    visible: boolean;
};

export default function BinMapLegend({ layerConfigs, layerDisplayInfo, visible }: BinMapLegendProps) {

    const legend = (
        <div className={styles.legend}>
            <div className={styles.legendTitle}>
                Legend
            </div>
            <Divider color={'var(--color-highlight)'} />
            <div style={{ paddingTop: '5px' }}>
                {layerConfigs.filter(config => config.layerType === 'bin').map(config => {
                    let binConfig = config as BinLayerOptions;
                    let layerInfo = layerDisplayInfo[config.id];
                    if (!layerInfo || !layerInfo.binRanges) return;

                    let scale = chroma.scale(binConfig.colorScaleName);
                    let steppedColors = scale.colors(binConfig.numColorSteps);
                    let colorSteps = [];

                    if (binConfig.colorMode == 'color') {
                        for (let i = 0; i < 100; i++) {
                            colorSteps.push(steppedColors[Math.floor(i / 100 * (binConfig.numColorSteps))]);
                        }
                    } else {
                        scale.colors(100).forEach((color) => colorSteps.push(color));
                    }

                    let min = getRangeValue(binConfig, layerInfo.binRanges, false);
                    let max = getRangeValue(binConfig, layerInfo.binRanges, true);

                    return (
                        <div key={config.id}>
                            <div>
                                {colorSteps.map(color => {
                                    return <span key={color} className={styles.gradStep} style={{ backgroundColor: color }} />;
                                })}
                            </div>
                            <div className={styles.legendMarks}>
                                <div>
                                    {min.toFixed(0)}
                                </div>
                                <div>
                                    {max.toFixed(0)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (<>
        {visible ? legend : <></>}
    </>);
}