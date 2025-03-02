import React from 'react';
import { capitalizeValues, createFieldset, createOptionsItem } from '../SidebarControls';
import { SegmentedControl, Select } from '@mantine/core';
import { TileLayerOptions } from '../../../BinMapOptions';
import styles from '../SidebarControls.module.css';

export interface TileLayerFieldsetProps {
    config: TileLayerOptions;
    handleInputChange: (key: string, value: any) => void;
}

export default function TileLayerFieldset({ config, handleInputChange }: TileLayerFieldsetProps) {

    const baseTileSources = [
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
        // { value: 'https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png', label: 'MemoMaps'},
        // { value: 'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', label: 'Stamen Watercolor'},
        // { value: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png', label: 'OpenWeatherMap'},
        // { value: '', label: ''},
    ];
    const overlayTileSources = [
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
    ];

    return createFieldset('Tile', <>
        <div className={styles.optionsItem}>
            <div className={`${styles.optionsLabel} ${styles.label}`}>Source Type</div>
            <SegmentedControl
                data={capitalizeValues(['base', 'overlay'])}
                value={config.sourceType}
                onChange={value => {
                    handleInputChange('sourceType', value);
                }}
                color={"blue"}
            />
        </div>
        {createOptionsItem('Source',
            <Select
                data={config.sourceType === 'base' ? baseTileSources : overlayTileSources}
                value={config.sourceType === 'base' ? config.baseSourceUrl : config.overlaySourceUrl}
                onChange={value => {
                    handleInputChange(config.sourceType === 'base' ? 'baseSourceUrl' : 'overlaySourceUrl', value)
                }}
                searchable
            />
        )}
    </>);
}