import { ScatterChart } from '@mantine/charts';
import React, { useState } from 'react';
import styles from './SidebarControls.module.css';
import { Checkbox, SegmentedControl } from '@mantine/core';
import { capitalizeValues } from './SidebarControls';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

export interface BinMapChartControlProps {
    features: Feature<Geometry>[];
};

export default function BinMapChartControl({ features }: BinMapChartControlProps) {

    const [aggValue, setAggValue] = useState('avg');
    const [useLog, setUseLog] = useState(true);

    function chartDataForFeatures() {
        let data = [];
        let counts: { [key: number]: number } = {};
        for (let feature of features) {
            let value = feature.get(aggValue);
            if (counts[value] === undefined) counts[value] = 0;
            counts[value] += 1;
        }
        for (let num in counts) {
            let count = useLog ? Math.log10(counts[num]) : counts[num];
            data.push({ number: Number(num), count: count })
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
            <div className={styles.optionsItem}>
                <Checkbox
                    checked={useLog}
                    onClick={() => {
                        setUseLog(!useLog);
                    }}
                    style={{ cursor: 'pointer' }}
                />
                <div className={`${styles.label}`}>y-axis log scale</div>
            </div>
        </div>
    );
}