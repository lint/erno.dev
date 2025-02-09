import React, { } from 'react';
import stateRegions from './StateRegions';
import { Checkbox } from '@mantine/core';
import styles from './BinMap.module.css';

export interface BinMapDataControlProps {
    updateCallback?: any;
};



export default function BinMapDataControl({ }: BinMapDataControlProps) {

    function createCheckboxLevel(data: any[], level: number, compressChildren: boolean) {

        return (
            <div className={`${styles.checkboxSection} ${compressChildren ? styles.compressed : ''}`} style={{ paddingLeft: 10 * level }}>
                {data.map(item => {
                    let shouldCompressSection = (item.items && item.items.length > 0 && item.items[0].short !== undefined) === true;
                    console.log(item.label, shouldCompressSection, compressChildren)
                    let children = item.items ? createCheckboxLevel(item.items, level + 1, shouldCompressSection) : undefined;
                    return (
                        <div style={{ width: compressChildren ? 50 : undefined }}>
                            <Checkbox
                                label={item.short ? item.short : item.label}
                                classNames={{ root: styles.checkboxLabelWrapper }}
                            />

                            {children}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={styles.checkboxTree}>
            {createCheckboxLevel(stateRegions, 0, false)}
        </div>
    );
}