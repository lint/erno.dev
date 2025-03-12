import { Button, Fieldset, getTreeExpandedState, MultiSelect, Select, Tree, useTree } from '@mantine/core';
import React, { useEffect } from 'react';
import arraysEqual from '../../../../../../util/arrays';
import { DataOptions } from '../../../BinMapOptions';
import stateRegions, { stateList } from '../../../Data/StateRegions';
import topCities from '../../../Data/TopCities';
import styles from '../SidebarControls.module.css';
import { getInitialExpandedValues, renderTreeNode } from '../tree';

export interface AddressFieldsetProps {
    config: DataOptions;
    updateCallback?: any;
};

export default function AddressFieldset({ config, updateCallback }: AddressFieldsetProps) {

    const stateRegionTree = useTree({
        initialExpandedState: getTreeExpandedState(stateRegions, getInitialExpandedValues(stateRegions, 1, 0)),
    });

    useEffect(() => {
        let newSelectedStates = stateList.filter(value => stateRegionTree.isNodeChecked(value));
        if (!arraysEqual(newSelectedStates, config.address.selectedStates)) {
            console.log("new selected states:", newSelectedStates)
            updateCallback('address.selectedStates', newSelectedStates);
        }
    }, [stateRegionTree.checkedState]);

    useEffect(() => {
        stateRegionTree.setCheckedState(config.address.selectedStates);
    }, [config.id]);

    return (<>
        <Fieldset unstyled classNames={{ root: styles.fieldsetRoot }} legend={<div className={styles.title}>US Aggregated Regions</div>}>
            <div className={styles.optionsItem}>
                <div className={`${styles.optionsLabel} ${styles.label}`}>Resolution</div>
                <div style={{ width: 100 }}>
                    <Select
                        data={[{ value: '0.01', label: '0.01°' }, { value: '0.05', label: '0.05°' }, { value: '0.1', label: '0.1°' }, { value: '0.5', label: '0.5°' }, { value: '1', label: '1°' }]}
                        value={config.address.dataResolution}
                        onChange={value => updateCallback('address.dataResolution', value)}
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
                    value={config.address.selectedCities}
                    onChange={value => updateCallback('address.selectedCities', value)}
                    searchable
                    comboboxProps={{ position: 'bottom', middlewares: { flip: false, shift: false } }}
                />
            </div>
        </Fieldset>
    </>);
}
