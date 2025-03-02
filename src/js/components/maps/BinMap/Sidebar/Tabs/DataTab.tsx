import { Accordion } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import React from 'react';
import { DataOptions } from '../../BinMapOptions';
import DataControl from '../Controls/DataControl';
import styles from '../Controls/SidebarControls.module.css';

export interface DataTabProps {
    items: any[];
    updateCallback?: any;
    config: DataOptions;
};

export default function DataTab({ items, updateCallback, config }: DataTabProps) {

    return (<>
        <Accordion
            multiple
            defaultValue={['addresses']}
            className={styles.layerConfigs}
            classNames={{
                label: styles.label,
                chevron: styles.chevron,
                control: styles.control,
                item: styles.item,
            }}
        >
            <Accordion.Item value='addresses'>
                <Accordion.Control
                    classNames={{ icon: styles.title }}
                    icon={<IconHome />}
                >
                    <div className={styles.title}>Address Numbers</div>
                </Accordion.Control>
                <Accordion.Panel>
                    <DataControl
                        items={items}
                        updateCallback={updateCallback}
                        config={config}
                    />
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    </>);
}
