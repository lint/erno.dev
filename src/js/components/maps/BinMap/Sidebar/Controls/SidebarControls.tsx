import { Chip, Fieldset, Group, SegmentedControl } from "@mantine/core";
import React, { ReactNode } from "react";
import { BaseLayerOptions, DataOptions } from "../../BinMapOptions";
import styles from './SidebarControls.module.css';

// creates capatalized CombodivData for list of values
export function capitalizeValues(values: string[]) {
    return values.map(value => ({ value: value, label: String(value).charAt(0).toUpperCase() + String(value).slice(1) }))
}

// creates chips for list of values
export function chipsForValues(values: string[], capitalize: boolean, disabled: boolean = false) {
    if (capitalize) {
        let capValues = capitalizeValues(values);
        return capValues.map(val => (<Chip disabled={disabled} value={val.value} key={val.value}>{val.label}</Chip>))
    } else {
        return values.map(val => (<Chip disabled={disabled} value={val} key={val}>{val}</Chip>))
    }
}

// create chips options item
export function createSingleSelectOptionsItem(config: BaseLayerOptions | DataOptions, configKey: string, label: string, values: string[], capitalize: boolean, disabled: boolean, style: string, handleInputChange: (key: string, value: any) => void) {

    let keyParts = configKey.split('.');
    let mainKey = keyParts[0] as keyof typeof config;
    let subKey = keyParts[1];
    let value = keyParts.length === 1 ? config[configKey as keyof typeof config] : config[mainKey][subKey as any];
    let item;
    switch (style) {
        case 'chip':
            item = (
                <Chip.Group multiple={false} value={`${value}`} onChange={value => handleInputChange(configKey, value)} >
                    <Group gap="5px">{chipsForValues(values, capitalize, disabled)}</Group>
                </Chip.Group>
            );
            break;
        case 'segmented':
        default:
            item = (
                <SegmentedControl
                    data={capitalize ? capitalizeValues(values) : values}
                    value={`${value}`}
                    onChange={value => handleInputChange(configKey, value)}
                    color={disabled ? "gray" : "blue"}
                    disabled={disabled}
                />
            );
            break;

    }
    return createOptionsItem(label, item);
}

// create general options item
export function createOptionsItem(label: string, node: React.ReactNode) {
    return (
        <div className={styles.optionsItem}>
            <div className={`${styles.optionsLabel} ${styles.label}`}>{label}</div>
            {node}
        </div>
    );
}

// create Fieldset node
export function createFieldset(title: string, children: ReactNode) {
    return (
        <Fieldset unstyled classNames={{ root: styles.fieldsetRoot }} legend={<div className={styles.title}>{title}</div>}>
            {children}
        </Fieldset>
    );
}