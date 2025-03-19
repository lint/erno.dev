import { Checkbox, Fieldset, MultiSelect, Select } from '@mantine/core';
import React from 'react';
import { eventsSelectData } from '../../../Data/WCA';
import { DataOptions } from '../../../MapOptions';
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
            {createOptionsItem('Value', <>
                <div style={{ width: '75%' }}>
                    <Select
                        value={config.wca.valueMethod}
                        onChange={value => updateCallback('wca.valueMethod', value)}
                        data={[
                            {
                                label: 'Number of Events',
                                value: 'num_events',
                            },
                            {
                                label: 'Number of Days Long',
                                value: 'num_days',
                            },
                            {
                                label: 'Number of Delegates',
                                value: 'num_dels',
                            },
                            {
                                label: 'Number of Organizers',
                                value: 'num_orgs',
                            },
                        ]}
                    />
                </div>
            </>)}
            {createOptionsItem('Filter Events', <>
                <div style={{ width: '75%' }}>
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
                'Filter Event Method',
                ['AND', 'OR', 'NOT'],
                false,
                false,
                'segmented',
                updateCallback
            )}
            {createSingleSelectOptionsItem(config,
                'wca.includeCancelled',
                'Show Cancelled',
                ['yes', 'no', 'both'],
                true,
                false,
                'segmented',
                updateCallback
            )}
        </Fieldset>
    </>);
}
