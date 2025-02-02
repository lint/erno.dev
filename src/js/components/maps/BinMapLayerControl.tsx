
import React, { useEffect, useState } from 'react';
import { BaseLayerOptions, BinLayerOptions, getBackgroundColor, HeatmapLayerOptions, TileLayerOptions } from './BinMapLayerOptions';
import chroma from 'chroma-js';
import { ActionIcon, Box, Chip, ColorInput, Fieldset, Group, NumberInput, RangeSlider, Select, Slider, Text } from '@mantine/core';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';

export interface BinMapLayerControlProps {
    config: BaseLayerOptions;
    binRange?: any;
    updateCallback?: any;
};

export default function BinMapLayerControl({ config, binRange, updateCallback }: BinMapLayerControlProps) {

    const binConfig = config as BinLayerOptions;
    const tileConfig = config as TileLayerOptions;
    const heatmapConfig = config as HeatmapLayerOptions;
    const [intervalSliderValues, setIntervalSliderValues] = useState({
        min: 0,
        max: 1,
        values: [0, 1]
    });

    const tileSources = [
        {
            group: 'OSM', items: [
                { value: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', label: 'Standard' },
                { value: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', label: 'Humanitarian' },
                { value: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png', label: 'Topographic' },
                // { value: 'https://s.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', label: 'CyclOSM'},
                // { value: 'https://tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png', label: 'CyclOSM-lite'},
            ]
        },
        {
            group: 'Carto', items: [
                { value: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', label: 'Positron' },
                { value: 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', label: 'Positron - no labels' },
                { value: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', label: 'Dark Matter' },
                { value: 'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', label: 'Dark Matter - no labels' },
                { value: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', label: 'Voyager' },
                { value: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', label: 'Voyager - no labels' },
            ]
        },
        {
            group: 'Esri Base', items: [
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', label: 'World Imagery (satellite)' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', label: 'World Street Map' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', label: 'World Topographic' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', label: 'Shaded Relief' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', label: 'Physical Map' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', label: 'Terrain Base' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', label: 'NatGeo' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', label: 'Light Gray Base' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', label: 'Dark Gray Base' },
            ]
        },
        {
            group: 'Esri Overlay', items: [
                { value: 'https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', label: 'World Boundaries and Places' },
                { value: 'https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}', label: 'World Boundaries and Places (alt)' },
                { value: 'https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}', label: 'World Reference Overlay' },
                { value: 'https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', label: 'Light Gray Reference' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', label: 'Dark Gray Reference' },
                { value: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', label: 'Transportation' },
            ]
        },
        // { value: 'https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png', label: 'MemoMaps'},
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
                    <Fieldset pb={10} pt={5} legend={<Text fw={500}>Tiles</Text>}>
                        <Box className='option-container'>
                            <Text size='sm' fw={500}>Source</Text>
                            <Select
                                data={tileSources}
                                defaultValue={tileConfig.tileSourceUrl}
                                onChange={value => handleInputChange('tileSourceUrl', value)}
                                searchable
                            />
                        </Box>
                    </Fieldset>
                );
            case 'heatmap':
                return (
                    <Fieldset pb={10} pt={5} legend={<Text fw={500}>Heatmap</Text>}>
                        <Box className='option-container'>
                            <Text size='sm' style={{ width: 50 }} fw={500}>Blur</Text>
                            <Text size='sm' style={{ width: 20 }} fw={500}>{heatmapConfig.blur}</Text>
                            <Slider
                                defaultValue={heatmapConfig.blur}
                                min={0}
                                max={100}
                                step={1}
                                onChange={value => handleInputChange('blur', value)}
                                style={{ flexGrow: 1, maxWidth: "200px" }}
                                label={null}
                            />
                        </Box>

                        <Box className='option-container'>
                            <Text size='sm' style={{ width: 50 }} fw={500}>Radius</Text>
                            <Text size='sm' style={{ width: 20 }} fw={500}>{heatmapConfig.radius}</Text>
                            <Slider
                                defaultValue={heatmapConfig.radius}
                                min={0}
                                max={50}
                                step={0.5}
                                onChange={value => handleInputChange('radius', value)}
                                style={{ flexGrow: 1, maxWidth: "200px" }}
                                label={null}
                            />
                        </Box>
                    </Fieldset>
                )
            case "bin":
                return (
                    <div>
                        <Fieldset pb={10} pt={5} legend={<Text fw={500}>Bins</Text>}>
                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Layer Type</Text>
                                <Chip.Group multiple={false} value={binConfig.isVectorImage ? 'VectorImage' : 'Vector'} onChange={value => handleInputChange('isVectorImage', value === 'VectorImage')}>
                                    <Group gap="5px">{chipsForValues(['VectorImage', 'Vector'], false)}</Group>
                                </Chip.Group>
                            </Box>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Bin Type</Text>
                                <Chip.Group multiple={false} value={binConfig.binType} onChange={value => handleInputChange('binType', value)}>
                                    <Group gap="5px">{chipsForValues(['hex', 'grid', 'feature'], true)}</Group>
                                </Chip.Group>
                            </Box>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Hex Style</Text>
                                <Chip.Group multiple={false} value={binConfig.hexStyle} onChange={value => handleInputChange('hexStyle', value)}>
                                    <Group gap="5px">{chipsForValues(['pointy', 'flat'], true, binConfig.binType !== 'hex')}</Group>
                                </Chip.Group>
                            </Box>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Bin Size</Text>
                                <NumberInput
                                    min={0}
                                    max={binConfig.binType === 'hex' ? 1000000 : 10}
                                    step={binConfig.binType === 'hex' ? 1000 : 0.1}
                                    value={binConfig.binSize ? binConfig.binSize : (binConfig.binType === 'hex' ? 80000 : 1)}
                                    // allowDecimal={false}
                                    onChange={value => handleInputChange('binSize', value)}
                                    disabled={binConfig.binType === 'feature'}
                                    inputSize='10'
                                />
                            </Box>

                        </Fieldset>
                        <Fieldset pb={10} pt={5} legend={<Text fw={500}>Data</Text>}>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Agg Func</Text>
                                <Chip.Group multiple={false} value={binConfig.aggFuncName} onChange={value => handleInputChange('aggFuncName', value)}>
                                    <Group gap="5px">{chipsForValues(['max', 'min', 'sum', 'len', 'avg'], true)}</Group>
                                </Chip.Group>
                            </Box>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Interval</Text>
                                <Chip.Group multiple={false} value={binConfig.intervalMode} onChange={value => handleInputChange('intervalMode', value)} >
                                    <Group gap="5px">{chipsForValues(['full', 'IQR', 'custom'], true)}</Group>
                                </Chip.Group>
                            </Box>

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
                        <Fieldset pb={10} pt={5} legend={<Text fw={500}>Colors</Text>}>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Color Mode</Text>
                                <Chip.Group multiple={false} value={binConfig.colorMode} onChange={value => handleInputChange('colorMode', value)}>
                                    <Group gap="5px">{chipsForValues(['gradient', 'step'], true)}</Group>
                                </Chip.Group>
                            </Box>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Color Scale</Text>
                                <Select
                                    data={Object.keys(chroma.brewer)}
                                    defaultValue={binConfig.colorScaleName}
                                    onChange={value => handleInputChange('colorScaleName', value)}
                                    searchable
                                />
                            </Box>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Num Color Steps</Text>
                                <NumberInput
                                    min={0}
                                    max={16}
                                    step={1}
                                    defaultValue={binConfig.numColorSteps}
                                    allowDecimal={false}
                                    onChange={value => handleInputChange('numColorSteps', value)}
                                    disabled={binConfig.colorMode !== 'step'}
                                    inputSize='4'
                                />
                            </Box>

                            <Box className='option-container'>
                                <Text size='sm' fw={500}>Background Color</Text>
                                <Chip.Group multiple={false} value={binConfig.backgroundColorMode} onChange={value => handleInputChange('backgroundColorMode', value)}>
                                    <Group gap="5px">{chipsForValues(['auto', 'custom', 'none'], true)}</Group>
                                </Chip.Group>
                            </Box>

                            <ColorInput
                                defaultValue={binConfig.customBackgroundColor}
                                value={binConfig.backgroundColorMode !== 'custom' ? getBackgroundColor(binConfig) : undefined}
                                disabled={binConfig.backgroundColorMode !== 'custom'}
                                // fixOnBlur={false}
                                // onChangeEnd={value => handleInputChange('customBackgroundColor', value)} // TODO: would be preferrable but gets wrong value for some reason
                                onChange={value => handleInputChange('customBackgroundColor', value)}
                                style={{ maxWidth: 200, paddingLeft: 5 }}
                            />

                        </Fieldset>
                    </div>
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

            <Text size='md' fw={700} ml={25}>{config.id}</Text>
            <Fieldset pb={10} pt={5} legend={<Text fw={500}>General</Text>}>
                <Box className='option-container'>

                    <Text size='sm' fw={500}>Visibility</Text>
                    <Box className='option-container' style={{ flexGrow: 1 }}>

                        <ActionIcon
                            onClick={() => handleInputChange('visible', !config.visible)}
                            title={'Enable/Disable Layer'}
                            variant={config.visible ? 'filled' : 'outline'}
                        >
                            {config.visible ? <IconEye /> : <IconEyeClosed />}
                        </ActionIcon>

                        <Text style={{ width: 40 }}>{config.opacity + '%'}</Text>
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
                    </Box>
                </Box>
                <Box className='option-container'>
                    <Text size='sm' fw={500}>z-index</Text>
                    <NumberInput
                        defaultValue={`${config.zIndex || 0}`}
                        allowDecimal={false}
                        onChange={value => handleInputChange('zIndex', value)}
                        inputSize='2'
                    />
                </Box>

            </Fieldset>
            {controlForType(config.layerType)}
        </div>
    );
}