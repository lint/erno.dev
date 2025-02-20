import { ScatterChart } from '@mantine/charts';
import React, { useState } from 'react';
import styles from './BinMap.module.css';
import { SegmentedControl } from '@mantine/core';
import { capitalizeValues } from './BinMapLayerControl';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';


export interface BinMapChartControlProps {
    features: Feature<Geometry>[];
}

export default function BinMapChartControl({ features }: BinMapChartControlProps) {

    const [aggValue, setAggValue] = useState('avg');

    function chartDataForFeatures() {
        let data = [];
        let counts: { [key: number]: number } = {};
        for (let feature of features) {
            let value = feature.get(aggValue);
            if (counts[value] === undefined) counts[value] = 0;
            counts[value] += 1;
        }
        for (let num in counts) {
            data.push({ number: Number(num), count: counts[num] })
        }

        return [
            {
                color: 'blue.5',
                name: 'Group 1',
                data: data,
            },
        ];
    }


    return (
        <div>
            <ScatterChart
                h={250}
                data={chartDataForFeatures()}
                dataKey={{ x: 'number', y: 'count' }}
                xAxisLabel="number"
                yAxisLabel="count"
                scatterProps={{ shape: <circle r={2} /> }}
            />
            <div className={styles.optionsItem}>
                <div className={`${styles.optionsLabel} ${styles.label}`}>Field</div>
                <SegmentedControl
                    data={capitalizeValues(['max', 'min', 'sum', 'len', 'avg', 'mod', 'std'])}
                    value={aggValue}
                    onChange={value => setAggValue(value)}
                    color={"blue"}
                />
            </div>
        </div>
    );
}