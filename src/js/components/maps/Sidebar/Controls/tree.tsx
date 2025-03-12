import { Checkbox, Group, RenderTreeNodePayload } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import React from 'react';
import styles from './SidebarControls.module.css';

export const renderTreeNode = ({
    node,
    expanded,
    hasChildren,
    elementProps,
    tree,
}: RenderTreeNodePayload) => {
    const checked = tree.isNodeChecked(node.value);
    const indeterminate = tree.isNodeIndeterminate(node.value);

    return (
        <Group gap="xs" {...elementProps} classNames={{ root: styles.checkboxSection }
        }>
            <Checkbox.Indicator
                checked={checked}
                indeterminate={indeterminate}
                onClick={() => {
                    !checked ? tree.checkNode(node.value) : tree.uncheckNode(node.value);
                }}
                style={{ cursor: 'pointer' }}
            />

            < Group gap={5} onClick={() => tree.toggleExpanded(node.value)} classNames={{ root: styles.checkboxLabelContainer }}>
                <span className={styles.checkboxLabel}> {node.label} </span>

                {
                    hasChildren && (
                        <IconChevronDown
                            size={14}
                            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }
                            }
                        />
                    )}
            </Group>
        </Group>
    );
};

export function getInitialExpandedValues(data: any[], levelMax: number, level: number) {

    let result: any[] = [];

    if (level >= levelMax || !data) {
        return [];
    }

    for (let item of data) {
        result = [item.value, ...result, ...getInitialExpandedValues(item.children, levelMax, level + 1)];
    }

    return result;
}