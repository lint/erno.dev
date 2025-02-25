import React, { useEffect } from 'react';
import { Button, Checkbox, Fieldset, getTreeExpandedState, Group, RenderTreeNodePayload, Select, Tree, useTree } from '@mantine/core';
import styles from './SidebarControls.module.css';
import { IconChevronDown } from '@tabler/icons-react';
import { stateList } from '../../StateRegions';
import { DataOptions } from '../BinMapOptions';
import arraysEqual from '../../../../util/arrays';

export interface BinMapDataControlProps {
    items: any[];
    updateCallback?: any;
    config: DataOptions;
};

export default function BinMapDataControl({ items, updateCallback, config }: BinMapDataControlProps) {

    const tree = useTree({
        initialExpandedState: getTreeExpandedState(items, getInitialExpandedValues(items, 1, 0)),
        initialCheckedState: config.selectedStates,
    });

    const renderTreeNode = ({
        node,
        expanded,
        hasChildren,
        elementProps,
        tree,
    }: RenderTreeNodePayload) => {
        const checked = tree.isNodeChecked(node.value);
        const indeterminate = tree.isNodeIndeterminate(node.value);

        return (
            <Group gap="xs" {...elementProps} classNames={{ root: styles.checkboxSection }}>
                <Checkbox.Indicator
                    checked={checked}
                    indeterminate={indeterminate}
                    onClick={() => {
                        !checked ? tree.checkNode(node.value) : tree.uncheckNode(node.value);
                    }}
                    style={{ cursor: 'pointer' }}
                />

                <Group gap={5} onClick={() => tree.toggleExpanded(node.value)} classNames={{ root: styles.checkboxLabelContainer }}>
                    <span className={styles.checkboxLabel}>{node.label}</span>

                    {hasChildren && (
                        <IconChevronDown
                            size={14}
                            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                    )}
                </Group>
            </Group>
        );
    };

    function getInitialExpandedValues(data: any[], levelMax: number, level: number) {

        let result: any[] = [];

        if (level >= levelMax || !data) {
            return [];
        }

        for (let item of data) {
            result = [item.value, ...result, ...getInitialExpandedValues(item.children, levelMax, level + 1)];
        }

        return result;
    }

    // general input change handler
    function handleInputChange(key: string, value: any) {
        console.log(`input change key=${key} value=${value}`)

        try {
            if (updateCallback) updateCallback(key, value);
        } catch {
            console.log(`failed to update key=${key} value=${value}`);
        }
    }

    useEffect(() => {
        let newSelectedStates = stateList.filter(value => tree.checkedState.indexOf(value) > -1);
        if (!arraysEqual(newSelectedStates, config.selectedStates)) {
            console.log("new selected states:", newSelectedStates)
            handleInputChange('selectedStates', newSelectedStates);
        }
    }, [tree.checkedState]);

    return (
        <Fieldset unstyled classNames={{ root: styles.fieldsetRoot }} legend={<div className={styles.title}>Aggregated Regions</div>}>
            <div className={styles.optionsItem}>
                <div className={`${styles.optionsLabel} ${styles.label}`}>Resolution</div>
                <div style={{ width: 100 }}>
                    <Select
                        data={[{ value: '0.01', label: '0.01°' }, { value: '0.05', label: '0.05°' }, { value: '0.1', label: '0.1°' }, { value: '0.5', label: '0.5°' }, { value: '1', label: '1°' }]}
                        defaultValue={config.dataResolution}
                        onChange={value => handleInputChange('dataResolution', value)}
                        searchable
                    />
                </div>
            </div>
            <div className={styles.checkboxTree}>
                <div className={styles.dataTitle}>
                    Select Loaded Regions
                </div>
                <div className={styles.checkboxTreeActions}>
                    <Button size="xs" onClick={() => tree.checkAllNodes()}>Select all</Button>
                    <Button size="xs" onClick={() => tree.uncheckAllNodes()}>Unselect all</Button>
                </div>
                <Tree
                    data={items}
                    tree={tree}
                    levelOffset={23}
                    expandOnClick={false}
                    renderNode={renderTreeNode}
                />
            </div>
        </Fieldset>
    );
}
