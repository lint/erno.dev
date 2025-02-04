
import React, { ReactNode, useState } from 'react';
import styles from './sidebar.module.css';
import { Tooltip, UnstyledButton } from '@mantine/core';

export interface SideBarProps {
    items: { label: string, icon: any, content: ReactNode }[];
}

export default function SideBar({ items }: SideBarProps) {
    const [active, setActive] = useState(items[0].label);
    console.log("SideBar() called: active=", active);

    // searches the items prop entries for a label matching the provided string
    function contentForLabel(label: string) {

        for (let item of items) {
            if (item.label === label) return item.content;
        }

        return undefined;
    }

    return (
        <div className={styles.sidebar}>
            <div className={styles.nav}>
                {items.map(item => {
                    return (
                        <Tooltip
                            label={item.label}
                            withArrow
                            position="right"
                            transitionProps={{ duration: 0 }}
                            key={item.label}
                        >
                            <UnstyledButton
                                onClick={() => setActive(item.label)}
                                className={styles.item}
                                data-active={item.label === active || undefined}
                            >
                                <item.icon size={32} stroke={1} />
                            </UnstyledButton>
                        </Tooltip>
                    );
                })}
            </div>
            <div className={styles.content}>
                {contentForLabel(active)}
            </div>
        </div>
    );
}