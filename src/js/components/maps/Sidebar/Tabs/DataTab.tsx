import { Accordion, ActionIcon, Divider, InputBase, Pill, TextInput } from '@mantine/core';
import { IconCopy, IconCube, IconHome, IconPlus } from '@tabler/icons-react';
import React from 'react';
import { createNewDataOptions, DataOptions } from '../../MapOptions';
import AddressFieldset from '../Controls/DataFieldsets/AddressFieldset';
import WcaFieldset from '../Controls/DataFieldsets/WcaFieldset';
import styles from '../Controls/SidebarControls.module.css';

export interface DataTabProps {
    configs: DataOptions[];
    selectedConfigId: string;
    expandedItemId: string | undefined;
    handleSelectConfig: (configId: string) => void;
    handleUpdateConfig: (key: string, value: any) => void;
    handleCopyConfig: (configId: string) => void;
    handleRemoveConfig: (configId: string) => void;
    handleCreateConfig: () => void;
    handleSetExpandedDataItemId: (itemId: string | null) => void;
};

export default function DataTab({ configs, selectedConfigId, expandedItemId, handleSelectConfig, handleRemoveConfig, handleUpdateConfig, handleCreateConfig, handleCopyConfig, handleSetExpandedDataItemId }: DataTabProps) {

    let selectedConfig = findSelectedConfig();

    function findSelectedConfig() {
        for (let i = 0; i < configs.length; i++) {
            if (configs[i].id === selectedConfigId) {
                return configs[i];
            }
        }

        return createNewDataOptions();
    }

    return (<>
        <div>

            <InputBase
                component="div"
                multiline
                styles={{ input: { border: 'none', borderRadius: 0 } }}
            >
                <Pill.Group>{configs.map(config => (
                    <Pill
                        key={config.id}
                        withRemoveButton
                        onRemove={() => handleRemoveConfig(config.id)}
                        style={{ cursor: 'pointer', fontWeight: 500 }}
                        bg={config.id === selectedConfig.id ? 'blue' : 'gray'}
                        onClick={() => handleSelectConfig(config.id)}
                        size='md'
                    >
                        {config.title}
                    </Pill>
                ))}</Pill.Group>
            </InputBase>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', padding: 5 }}>
                <TextInput
                    placeholder='New Data Config ...'
                    styles={{ input: { cursor: 'pointer', width: '100%' } }}
                    inputSize='10'
                    onChange={e => handleUpdateConfig('title', e.currentTarget.value)}
                    value={selectedConfig.title}
                />
                <ActionIcon
                    onClick={() => { handleCopyConfig(selectedConfig.id) }}
                    title={'Copy Config'}
                >
                    <IconCopy />
                </ActionIcon>
                <ActionIcon
                    onClick={() => { handleCreateConfig() }}
                    title={'Create New Config'}
                >
                    <IconPlus />
                </ActionIcon>
            </div>
        </div>
        <Divider color='var(--color-highlight)' />
        <Accordion
            className={styles.layerConfigs}
            classNames={{
                label: styles.label,
                chevron: styles.chevron,
                control: styles.control,
                item: styles.item,
            }}
            value={expandedItemId}
            onChange={handleSetExpandedDataItemId}
        >
            <Accordion.Item value='addresses'>
                <Accordion.Control
                    classNames={{ icon: styles.title }}
                    icon={<IconHome />}
                >
                    <div className={styles.title}>Address Numbers</div>
                </Accordion.Control>
                <Accordion.Panel>
                    <AddressFieldset
                        updateCallback={handleUpdateConfig}
                        config={selectedConfig}
                    />
                </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value='wca'>
                <Accordion.Control
                    classNames={{ icon: styles.title }}
                    icon={<IconCube />}
                >
                    <div className={styles.title}>WCA Competitions</div>
                </Accordion.Control>
                <Accordion.Panel>
                    <WcaFieldset
                        updateCallback={handleUpdateConfig}
                        config={selectedConfig}
                    />
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    </>);
}
