
import React, { useEffect, useState } from 'react';
import { BaseLayerOptions, BinLayerOptions, getBackgroundColor, TileLayerOptions } from './binMapLayerOptions';
import chroma from 'chroma-js';
import { Checkbox, Chip, ColorInput, Fieldset, Group, NumberInput, RangeSlider, Select, Slider, Text } from '@mantine/core';

export interface BinMapLayerControlProps {
    config: BaseLayerOptions;
    binRange?: any;
    updateCallback?: any;
};

export default function BinMapLayerControl({ config, binRange, updateCallback }: BinMapLayerControlProps) {

    const binConfig = config as BinLayerOptions;
    const tileConfig = config as TileLayerOptions;
    const [intervalSliderValues, setIntervalSliderValues] = useState({
        min: 0,
        max: 1,
        values: [0, 1]
    });

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
        console.log(`input change key=${key} value=${value}`)

        try {
            let newConfig = { ...config, [key]: value };
            if (updateCallback) updateCallback(newConfig);
        } catch {
            console.log(`failed to update key=${key} value=${value}`);
        }
    }

    // creates capatalized ComboboxData for list of values
    function capatalizeValues(values: string[]) {
        return values.map(value => ({ value: value, label: String(value).charAt(0).toUpperCase() + String(value).slice(1) }))
    }

    // creates chips for list of values
    function chipsForValues(values: string[], capitalize: boolean, disabled: boolean = false) {
        if (capitalize) {
            let capValues = capatalizeValues(values);
            return capValues.map(val => (<Chip disabled={disabled} value={val.value} key={val.value}>{val.label}</Chip>))
        } else {
            return values.map(val => (<Chip disabled={disabled} value={val} key={val}>{val}</Chip>))
        }
    }

    // TODO: this is duplicated in binMapView, you should refactor so this is not the case
    function getRangeValue(binLayerConfig: BinLayerOptions, isMax: boolean, modeOverride?: string) {

        let value = 0;
        switch (modeOverride ? modeOverride : binLayerConfig.intervalMode) {
            case 'manual':
                value = isMax ? binLayerConfig.customMax : binLayerConfig.customMin;
                break;
            case 'IQR':
                value = isMax ? binRange.iqr_max : binRange.iqr_min;
                break
            case 'full':
            default:
                value = isMax ? binRange.full_max : binRange.full_min;
        }
        return value;
    }

    // create controls for a given layer type
    function controlForType(layerType: string) {
        switch (layerType) {
            case "tile":
                return (
                    <Fieldset legend="Tile Layer">
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
                    <Fieldset legend="Bin Layer">
                        <Fieldset legend="Bins">
                            <Checkbox
                                label='layer as image'
                                checked={binConfig.isVectorImage}
                                onChange={event => handleInputChange('isVectorImage', event.currentTarget.checked)}
                            />

                            <Text>Bin Type</Text>
                            <Chip.Group multiple={false} value={binConfig.binType} onChange={value => handleInputChange('binType', value)}>
                                <Group>{chipsForValues(['hex', 'grid', 'feature'], true)}</Group>
                            </Chip.Group>

                            <Text>Hex Style</Text>
                            <Chip.Group multiple={false} value={binConfig.hexStyle} onChange={value => handleInputChange('hexStyle', value)}>
                                <Group>{chipsForValues(['pointy', 'flat'], true, binConfig.binType !== 'hex')}</Group>
                            </Chip.Group>

                            <NumberInput
                                label='Bin Size'
                                min={0}
                                max={binConfig.binType === 'hex' ? 1000000 : 10}
                                step={binConfig.binType === 'hex' ? 1000 : 0.1}
                                value={binConfig.binSize ? binConfig.binSize : (binConfig.binType === 'hex' ? 80000 : 1)}
                                // allowDecimal={false}
                                onChange={value => handleInputChange('binSize', value)}
                                disabled={binConfig.binType === 'feature'}
                            />
                        </Fieldset>
                        <Fieldset legend="Data">

                            <Text>Agg Func</Text>
                            <Chip.Group multiple={false} value={binConfig.aggFuncName} onChange={value => handleInputChange('aggFuncName', value)}>
                                <Group>{chipsForValues(['max', 'min', 'sum', 'len', 'avg'], true)}</Group>
                            </Chip.Group>

                            <Text>Interval Mode</Text>
                            <Chip.Group multiple={false} value={binConfig.intervalMode} onChange={value => handleInputChange('intervalMode', value)} >
                                <Group>{chipsForValues(['full', 'IQR', 'custom'], true)}</Group>
                            </Chip.Group>

                            <Text>Interval</Text>
                            <RangeSlider
                                min={intervalSliderValues.min}
                                max={intervalSliderValues.max}
                                step={1}
                                value={intervalSliderValues.values as any}
                                onChange={value => { setIntervalSliderValues((old) => ({ ...old, values: value })) }}
                                // labelAlwaysOn
                                onChangeEnd={value => {
                                    binConfig.customMin = value[0];
                                    binConfig.customMax = value[1];
                                    updateCallback({ ...config });
                                }}
                                disabled={binConfig.intervalMode !== 'custom'}
                            />

                        </Fieldset>
                        <Fieldset legend="Colors">

                            <Text>Color Mode</Text>
                            <Chip.Group multiple={false} value={binConfig.colorMode} onChange={value => handleInputChange('colorMode', value)}>
                                <Group>{chipsForValues(['gradient', 'step'], true)}</Group>
                            </Chip.Group>

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
                                disabled={binConfig.colorMode !== 'step'}
                            />

                            <Text>Background Color</Text>
                            <ColorInput
                                defaultValue={binConfig.customBackgroundColor}
                                value={binConfig.backgroundColorMode !== 'custom' ? getBackgroundColor(binConfig) : undefined}
                                disabled={binConfig.backgroundColorMode !== 'custom'}
                                // fixOnBlur={false}
                                // onChangeEnd={value => handleInputChange('customBackgroundColor', value)} // TODO: would be preferrable but gets wrong value for some reason
                                onChange={value => handleInputChange('customBackgroundColor', value)}
                            />
                            <Chip.Group multiple={false} value={binConfig.backgroundColorMode} onChange={value => handleInputChange('backgroundColorMode', value)}>
                                <Group>{chipsForValues(['auto', 'custom', 'none'], true)}</Group>
                            </Chip.Group>

                        </Fieldset>
                    </Fieldset>
                );
        }
    }

    // update interval slider values when props change
    useEffect(() => {
        if (!binRange) return;
        let interval = [getRangeValue(binConfig, false), getRangeValue(binConfig, true)];
        setIntervalSliderValues({
            min: getRangeValue(binConfig, false, 'full'),
            max: getRangeValue(binConfig, true, 'full'),
            values: interval
        });
    }, [binConfig.aggFuncName, binConfig.binType, binConfig.intervalMode, binRange]);

    // reset bin size when bin type changes
    // TODO: should this be done here?
    useEffect(() => {
        handleInputChange('binSize', 0);
    }, [binConfig.binType]);

    return (
        <div className='layer-options'>
            <div>
                id: {config.id}
            </div>

            <Fieldset legend="General">
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