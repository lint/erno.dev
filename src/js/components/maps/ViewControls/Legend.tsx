import { Divider, Text } from '@mantine/core';
import chroma from 'chroma-js';
import React from 'react';
import styles from '../Map.module.css';
import { BaseLayerOptions, BinLayerOptions, getRangeValue, LayerDisplayInfoSet } from '../MapOptions';

export interface LegendProps {
    layerConfigs: BaseLayerOptions[];
    layerDisplayInfo: LayerDisplayInfoSet;
    visible: boolean;
    scaleVisible: boolean;
};

export default function Legend({ layerConfigs, layerDisplayInfo, visible, scaleVisible }: LegendProps) {

    const legend = (
        <div className={styles.legend} style={{ bottom: scaleVisible ? 40 : 'var(--mantine-spacing-xs' }}>
            <div className={styles.legendTitle}>
                Legend
            </div>
            <Divider style={{ paddingBottom: 5 }} color={'var(--color-highlight)'} />
            <div style={{ paddingTop: '5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
                            <Text size='sm' style={{ paddingBottom: 5 }}>
                                {binConfig.title}
                            </Text>
                            <div>
                                {colorSteps.map(color => {
                                    return <span key={color} className={styles.gradStep} style={{ backgroundColor: color }} />;
                                })}
                            </div>
                            <div className={styles.legendMarks}>
                                <Text size='sm'>
                                    {min.toFixed(0)}
                                </Text>
                                <Text size='sm'>
                                    {max.toFixed(0)}
                                </Text>
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

