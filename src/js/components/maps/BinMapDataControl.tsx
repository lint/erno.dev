import React, { useState } from 'react';
import { Checkbox, getTreeExpandedState, Group, RenderTreeNodePayload, Tree, useTree } from '@mantine/core';
import styles from './BinMap.module.css';
import { IconChevronDown } from '@tabler/icons-react';

export interface BinMapDataControlProps {
    items: any[];
    updateCallback?: any;
};

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
                onClick={() => (!checked ? tree.checkNode(node.value) : tree.uncheckNode(node.value))}
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


export default function BinMapDataControl({ items }: BinMapDataControlProps) {

    const [active, setActive] = useState({});

    function getCheckboxStatus(id: string) {
        return active[id as keyof typeof active];
        if (!(id in active)) return undefined;

        let item = itemForId(id);
        if (!item) return undefined;


    }

    function setCheckboxStatus(id: string, status: string) {
        setActive(oldActive => ({ ...oldActive, [id]: status }));
    }

    function refreshCheckboxStatuses(rootId: string) {
        let rootItem = itemForId(rootId);
        if (!rootItem) {
            console.log("no root item found ...");
            return;
        }


    }

    function searchItem(item: any, forId: string): any {

        if (item.id === forId) return item;
        if (!item.items || item.items.length === 0) return undefined;
        for (let childItem of item.items) {
            let found = searchItem(childItem, forId);
            if (found) return found;
        }
        return undefined;
    }

    function itemForId(id: string) {

        for (let item of items) {
            let foundItem = searchItem(item, id);
            if (foundItem) return foundItem;
        }
        return undefined;
    }

    function createCheckboxLevel(data: any[], level: number, compressChildren: boolean) {

        return (
            <div className={`${styles.checkboxSection} ${compressChildren ? styles.compressed : ''}`} style={{ paddingLeft: 10 * level }}>
                {data.map(item => {
                    let shouldCompressSection = (item.items && item.items.length > 0 && item.items[0].short !== undefined) === true;
                    console.log(item.label, shouldCompressSection, compressChildren)
                    let children = item.items ? createCheckboxLevel(item.items, level + 1, shouldCompressSection) : undefined;
                    let status = getCheckboxStatus(item.id);
                    return (
                        <div style={{ width: compressChildren ? 55 : undefined }}>
                            <Checkbox
                                label={item.short ? item.short : item.label}
                                classNames={{ label: styles.checkboxLabel }}
                                title={item.label}
                                indeterminate={false}
                            />

                            {children}
                        </div>
                    );
                })}
            </div>
        );
    }

    function getExpandedData(data: any[], levelMax: number, level: number, path: string) {

        let result: any[] = [];

        if (level >= levelMax || !data) {
            return [];
        }

        for (let item of data) {
            result = [item.value, ...result, ...getExpandedData(item.children, levelMax, level + 1, item.value)];
        }

        return result;
    }

    function getStatesEnabled() {
        let values = {};


    }

    const tree = useTree({
        initialExpandedState: getTreeExpandedState(items, getExpandedData(items, 2, 0, '')),
        // initialExpandedState: getTreeExpandedState(items, ['usa', 'usa/west']),
    });

    return (
        <div className={styles.checkboxTree}>
            {/* {createCheckboxLevel(items, 0, false)} */}
            <Tree data={items} tree={tree} levelOffset={23} expandOnClick={false} renderNode={renderTreeNode} />
        </div>
    );
}