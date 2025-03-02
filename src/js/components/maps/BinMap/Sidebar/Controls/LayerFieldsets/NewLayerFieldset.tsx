import React from 'react';
import { capitalizeValues, createFieldset, createOptionsItem } from '../SidebarControls';
import { Button, Input, SegmentedControl } from '@mantine/core';
import { NewLayerOptions } from '../../../BinMapOptions';

export interface NewLayerFieldsetProps {
    config: NewLayerOptions;
    handleInputChange?: (key: string, value: any) => void;
    handleCreateCallback?: () => void;
}

export default function NewLayerFieldset({ config, handleInputChange, handleCreateCallback }: NewLayerFieldsetProps) {

    return createFieldset('Create', <>
        {createOptionsItem('Name',
            <Input
                value={config.title}
                placeholder={config.placeholder}
                onChange={event => handleInputChange!('title', event.currentTarget.value)}
            />
        )}
        {createOptionsItem('Layer Type',
            <SegmentedControl
                data={capitalizeValues(['tile', 'bin', 'heatmap'])}
                value={config.layerType}
                onChange={value => handleInputChange!('layerType', value)}
                color={"blue"}
            />)}
        {createOptionsItem('',
            <Button onClick={handleCreateCallback}>Submit</Button>
        )}
    </>);
}