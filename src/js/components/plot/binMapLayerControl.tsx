
import React from 'react';
import { BaseLayerOptions, BinLayerOptions, TileLayerOptions } from './binMapLayerOptions';
import chroma from 'chroma-js';
import { Checkbox, Fieldset, NumberInput, RangeSlider, Select, Slider, Text } from '@mantine/core';

export interface BinMapLayerControlProps {
    config: BaseLayerOptions;
    callback?: any;
};

export default function BinMapLayerControl({ config, callback }: BinMapLayerControlProps) {

    const binConfig = config as BinLayerOptions;
    const tileConfig = config as TileLayerOptions;

    const tileSources = [
        { value: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', label: 'OSM Standard' },
        { value: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', label: 'OSM Humanitarian' },
        { value: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png', label: 'OSM Topographic' },
        // { value: 'https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png', label: 'MemoMaps'},
        // { value: 'https://s.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', label: 'CyclOSM'},
        // { value: 'https://tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png', label: 'CyclOSM-lite'},
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', label: 'Esri World Imagery (satellite)' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', label: 'Esri World Street Map' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', label: 'Esri World Topographic' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', label: 'Esri Shaded Relief' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', label: 'Esri Physical Map' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', label: 'Esri Terrain Base' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', label: 'Esri NatGeo' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', label: 'Esri Transportation' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', label: 'Esri Light Gray Base' },
        { value: 'https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', label: 'Esri Light Gray Reference' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', label: 'Esri Dark Gray Base' },
        { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', label: 'Esri Dark Gray Reference' },
        { value: 'https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', label: 'Esri World Boundaries and Places' },
        { value: 'https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}', label: 'Esri World Boundaries and Places (alt)' },
        { value: 'https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}', label: 'Esri World Reference Overlay' },
        { value: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', label: 'Carto Positron' },
        { value: 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', label: 'Carto Positron - no labels' },
        { value: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', label: 'Carto Dark Matter' },
        { value: 'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', label: 'Carto Dark Matter - no labels' },
        { value: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', label: 'Carto Voyager' },
        { value: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', label: 'Carto Voyager - no labels' },
        // { value: 'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', label: 'Stamen Watercolor'},
        // { value: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png', label: 'OpenWeatherMap'},
        // { value: '', label: ''},
    ];

    // general input change handler
    function handleInputChange(key: string, value: any) {

        try {
            let newConfig = { ...config, [key]: value };
            if (callback) callback(newConfig);
        } catch {
            console.log(`failed to update key=${key} value=${value}`);
        }
    }

    // creates capatalized ComboboxData for list of values
    function capatalizeSelectValues(values: string[]) {
        return values.map(value => ({ value: value, label: String(value).charAt(0).toUpperCase() + String(value).slice(1) }))
    }

    // create controls for a given layer type
    function controlForType(layerType: string) {
        switch (layerType) {
            case "tile":
                return (
                    <Fieldset legend="Tile">
                        <Select
                            label="Source"
                            data={tileSources}
                            defaultValue={tileConfig.tileSourceUrl}
                            onChange={value => handleInputChange('tileSourceUrl', value)}
                            searchable
                        />
                    </Fieldset>
                );
            case "bin":
                return (
                    <Fieldset legend="Bin">
                        <Checkbox
                            label='layer as image'
                            checked={binConfig.isVectorImage}
                            onChange={event => handleInputChange('isVectorImage', event.currentTarget.checked)}
                        />
                        <NumberInput
                            label='Bin Size'
                            min={0}
                            max={100000}
                            step={1000}
                            defaultValue={binConfig.binSize}
                            // allowDecimal={false}
                            onChange={value => handleInputChange('binSize', value)}
                        />
                        <Text>Interval</Text>
                        <RangeSlider
                            min={0}
                            max={100000}
                            step={1}
                            labelAlwaysOn
                            defaultValue={[binConfig.intervalMin, binConfig.intervalMax]}
                            onChangeEnd={value => {
                                handleInputChange('intervalMin', value[0]);
                                handleInputChange('intervalMax', value[1]);
                            }}
                        />
                        <Checkbox
                            label='use manual interval'
                            checked={binConfig.useManualInterval}
                            onChange={event => handleInputChange('useManualInterval', event.currentTarget.checked)}
                        />
                        <Checkbox
                            label='use IQR interval'
                            checked={binConfig.useIQRInterval}
                            onChange={event => handleInputChange('useIQRInterval', event.currentTarget.checked)}
                        />
                        <Select
                            label="Agg Func"
                            data={capatalizeSelectValues(['max', 'min', 'sum', 'len', 'avg'])}
                            defaultValue={binConfig.aggFuncName}
                            onChange={value => handleInputChange('aggFuncName', value)}
                        />
                        <Select
                            label="Bin Type"
                            data={capatalizeSelectValues(['hex', 'grid', 'feature'])}
                            defaultValue={binConfig.binType}
                            onChange={value => handleInputChange('binType', value)}
                        />
                        <Select
                            label="Hex Style"
                            data={capatalizeSelectValues(['pointy', 'flat'])}
                            defaultValue={binConfig.hexStyle}
                            onChange={value => handleInputChange('hexStyle', value)}
                        />
                        <Select
                            label="Bin Style"
                            data={capatalizeSelectValues(['gradient', 'color', 'point'])}
                            defaultValue={binConfig.binStyle}
                            onChange={value => handleInputChange('binStyle', value)}
                        />
                        <Select
                            label="Color Scale"
                            data={Object.keys(chroma.brewer)}
                            defaultValue={binConfig.colorScaleName}
                            onChange={value => handleInputChange('colorScaleName', value)}
                            searchable
                        />
                        <NumberInput
                            label='Num Color Steps'
                            min={0}
                            max={16}
                            step={1}
                            defaultValue={binConfig.numColorSteps}
                            allowDecimal={false}
                            onChange={value => handleInputChange('numColorSteps', value)}
                        />
                    </Fieldset>
                );
        }
    }

    return (
        <div className='layer-options'>
            <div>
                id: {config.id}
            </div>

            <Fieldset legend="Layer">
                <Checkbox
                    checked={config.visible}
                    onChange={(event) => handleInputChange('visible', event.currentTarget.checked)}
                    label='Enabled'
                />

                <NumberInput
                    label='z-index'
                    defaultValue={`${config.zIndex || 0}`}
                    allowDecimal={false}
                    onChange={value => handleInputChange('zIndex', value)}
                />

                <Text>Opacity</Text>
                {/* <Text>{config.opacity}</Text> */}
                <Slider
                    defaultValue={config.opacity}
                    min={0}
                    max={100}
                    step={1}
                    onChange={value => handleInputChange('opacity', value)}
                />

            </Fieldset>
            {controlForType(config.layerType)}
        </div>
    );
}