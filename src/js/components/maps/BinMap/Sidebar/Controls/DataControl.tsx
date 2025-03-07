import { Button, Checkbox, Fieldset, getTreeExpandedState, Group, MultiSelect, RenderTreeNodePayload, Select, Tree, useTree } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import React, { useEffect } from 'react';
import arraysEqual from '../../../../../util/arrays';
import stateRegions, { stateList } from '../../../StateRegions';
import topCities from '../../../TopCities';
import { DataOptions } from '../../BinMapOptions';
import styles from '../Controls/SidebarControls.module.css';

export interface DataControlProps {
    config: DataOptions;
    updateCallback?: any;
};

export default function DataControl({ config, updateCallback }: DataControlProps) {

    const stateRegionTree = useTree({
        initialExpandedState: getTreeExpandedState(stateRegions, getInitialExpandedValues(stateRegions, 1, 0)),
        // initialCheckedState: config.selectedStates,
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

    useEffect(() => {
        let newSelectedStates = stateList.filter(value => stateRegionTree.isNodeChecked(value));
        if (!arraysEqual(newSelectedStates, config.selectedStates)) {
            console.log("new selected states:", newSelectedStates)
            updateCallback('selectedStates', newSelectedStates);
        }
    }, [stateRegionTree.checkedState]);

    useEffect(() => {
        stateRegionTree.setCheckedState(config.selectedStates);
    }, [config.id]);

    return (<>
        <Fieldset unstyled classNames={{ root: styles.fieldsetRoot }} legend={<div className={styles.title}>US Aggregated Regions</div>}>
            <div className={styles.optionsItem}>
                <div className={`${styles.optionsLabel} ${styles.label}`}>Resolution</div>
                <div style={{ width: 100 }}>
                    <Select
                        data={[{ value: '0.01', label: '0.01°' }, { value: '0.05', label: '0.05°' }, { value: '0.1', label: '0.1°' }, { value: '0.5', label: '0.5°' }, { value: '1', label: '1°' }]}
                        value={config.dataResolution}
                        onChange={value => updateCallback('dataResolution', value)}
                        searchable
                    />
                </div>
            </div>
            <div className={styles.checkboxTree}>
                <div className={styles.dataTitle}>
                    Select Loaded Regions
                </div>
                <div className={styles.checkboxTreeActions}>
                    <Button size="xs" onClick={() => stateRegionTree.checkAllNodes()}>Select all</Button>
                    <Button size="xs" onClick={() => stateRegionTree.uncheckAllNodes()}>Unselect all</Button>
                </div>
                <Tree
                    data={stateRegions}
                    tree={stateRegionTree}
                    levelOffset={23}
                    expandOnClick={false}
                    renderNode={renderTreeNode}
                />
            </div>
        </Fieldset>
        <Fieldset unstyled classNames={{ root: styles.fieldsetRoot }} legend={<div className={styles.title}>US Cities</div>}>
            <div style={{ padding: 5 }}>

                <div className={styles.dataTitle} style={{ paddingLeft: 2 }}>
                    Select Loaded Cities
                </div>
                <MultiSelect
                    checkIconPosition="right"
                    data={topCities.map(cityInfo => cityInfo.value)}
                    dropdownOpened
                    pb={200}
                    maxDropdownHeight={180}
                    placeholder="Search ..."
                    value={config.selectedCities}
                    onChange={value => updateCallback('selectedCities', value)}
                    searchable
                    comboboxProps={{ position: 'bottom', middlewares: { flip: false, shift: false } }}
                />
            </div>
        </Fieldset>
    </>);
}
