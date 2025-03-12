import { ActionIcon, Button, Input, NumberInput, Slider } from '@mantine/core';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';
import React from 'react';
import { BaseLayerOptions } from '../../../MapOptions';
import { createFieldset, createOptionsItem } from '../SidebarControls';

export interface GeneralLayerFieldsetProps {
    config: BaseLayerOptions;
    handleInputChange: (key: string, value: any) => void;
    deleteLayerCallback: any;
}

export default function GeneralLayerFieldset({ config, handleInputChange, deleteLayerCallback }: GeneralLayerFieldsetProps) {

    return createFieldset('General', <>
        {createOptionsItem('Name',
            <Input
                defaultValue={config.title}
                onChange={event => handleInputChange('title', event.currentTarget.value)}
            />
        )}
        {createOptionsItem('Visibility', <>
            <ActionIcon
                onClick={() => handleInputChange('visible', !config.visible)}
                title={'Enable/Disable Layer'}
                variant={config.visible ? 'filled' : 'outline'}
            >
                {config.visible ? <IconEye /> : <IconEyeClosed />}
            </ActionIcon>

            <div style={{ width: 42 }}>{config.opacity + '%'}</div>
            <Slider
                defaultValue={config.opacity}
                min={0}
                max={100}
                step={1}
                onChange={value => handleInputChange('opacity', value)}
                style={{ flexGrow: 1, maxWidth: "200px" }}
                disabled={!config.visible}
                label={null}
            />
        </>)}
        {createOptionsItem('z-index',
            <NumberInput
                defaultValue={`${config.zIndex || 0}`}
                allowDecimal={false}
                onChange={value => handleInputChange('zIndex', value)}
                inputSize='2'
            />
        )}
        {createOptionsItem('',
            <Button onClick={() => { deleteLayerCallback(config.id) }} size='xs' variant="outline" color='red.9'>Delete</Button>
        )}
    </>);
}