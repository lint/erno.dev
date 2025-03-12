import { Checkbox, Fieldset, MultiSelect } from '@mantine/core';
import React from 'react';
import { DataOptions } from '../../../BinMapOptions';
import { eventsSelectData } from '../../../Data/WCA';
import { createOptionsItem, createSingleSelectOptionsItem } from '../SidebarControls';
import styles from '../SidebarControls.module.css';

export interface WcaFieldsetProps {
    config: DataOptions;
    updateCallback?: any;
};

export default function WcaFieldset({ config, updateCallback }: WcaFieldsetProps) {

    return (<>
        <Fieldset unstyled classNames={{ root: styles.fieldsetRoot }} legend={<div className={styles.title}>Competitions</div>}>
            {createOptionsItem('Enabled', <>
                <Checkbox
                    checked={config.wca.enabled}
                    onChange={e => updateCallback('wca.enabled', (e.target as HTMLInputElement).checked)}
                    style={{ cursor: 'pointer' }}
                />
            </>)}
            {createSingleSelectOptionsItem(config,
                'wca.includeCancelled',
                'Include Cancelled',
                ['yes', 'no', 'both'],
                true,
                false,
                'segmented',
                updateCallback
            )}
            {createOptionsItem('Filter Events', <>
                <div style={{ width: '80%' }}>
                    <MultiSelect
                        value={config.wca.filteredEvents}
                        onChange={value => updateCallback('wca.filteredEvents', value)}
                        multiple
                        data={eventsSelectData}
                    />
                </div>
            </>)}
            {createSingleSelectOptionsItem(config,
                'wca.eventFilterMethod',
                'Filter Method',
                ['AND', 'OR', 'NOT', 'XOR'],
                false,
                false,
                'segmented',
                updateCallback
            )}

        </Fieldset>
    </>);
}
