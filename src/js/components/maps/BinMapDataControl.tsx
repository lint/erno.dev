import React, { useEffect, useState } from 'react';
import { Checkbox, getTreeExpandedState, Group, RenderTreeNodePayload, Select, Tree, useTree } from '@mantine/core';
import styles from './BinMap.module.css';
import { IconChevronDown } from '@tabler/icons-react';
import { stateList } from './StateRegions';

export interface BinMapDataControlProps {
    items: any[];
    initialCheckedValues?: any;
    updateCallback?: any;
};

export default function BinMapDataControl({ items, initialCheckedValues, updateCallback }: BinMapDataControlProps) {

    const [dataResolution, setDataResolution] = useState('res-0.5');

    const tree = useTree({
        initialExpandedState: getTreeExpandedState(items, getInitialExpandedValues(items, 2, 0)),
        initialCheckedState: initialCheckedValues,
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
            <Group gap="xs" {...elementProps}>
                <Checkbox.Indicator
                    checked={checked}
                    indeterminate={indeterminate}
                    onClick={() => {
                        !checked ? tree.checkNode(node.value) : tree.uncheckNode(node.value);
                    }}
                    style={{cursor: 'pointer'}}
                />
    
                <Group gap={5} onClick={() => tree.toggleExpanded(node.value)}>
                    <span>{node.label}</span>
    
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

    function getUrls() {
        let baseUrl = 'https://lint.github.io/AggregatedAddresses/data/{dataset}/us/{state}/data.geojson';
        let urls = stateList.filter(value => tree.checkedState.indexOf(value) > -1).map(state => baseUrl.replace('{dataset}', dataResolution).replace('{state}', state.toLowerCase()));
        console.log(tree.checkedState)
        return urls;
    }

    function handleUpdate() {
        console.log("BinMapDataControl handleUpdate");
        let urls = getUrls();
        console.log(urls)
        if (updateCallback) updateCallback(urls);
    }

    useEffect(() => {
        // TODO: this causes way too many refreshes
        handleUpdate();
    }, [dataResolution, tree.checkedState]);

    return (
        <div>
            <div className={styles.checkboxTree}>
                <div className={styles.title}>
                    Load Source
                </div>
                <Tree
                    data={items} 
                    tree={tree} 
                    levelOffset={23} 
                    expandOnClick={false} 
                    renderNode={renderTreeNode} 
                />
            </div>
            <div className={styles.optionsItem}>
                <div className={`${styles.optionsLabel} ${styles.label}`}>Data Resolution</div>
                <Select
                    data={['res-0.01', 'res-0.05', 'res-0.1', 'res-0.5', 'res-1']}
                    defaultValue={dataResolution}
                    onChange={value => setDataResolution(value || dataResolution)}
                    searchable
                />
            </div>
        </div>
    );
}
