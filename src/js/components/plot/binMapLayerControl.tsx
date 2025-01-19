
import React, { ChangeEvent } from 'react';
import { BaseLayerOptions, BinLayerOptions, TileLayerOptions } from './binMapLayerOptions';
import chroma from 'chroma-js';

export interface BinMapLayerControlProps {
    config: BaseLayerOptions;
    callback?: any;
};

export default function BinMapLayerControl({ config, callback }: BinMapLayerControlProps) {

    const binConfig = config as BinLayerOptions;
    const tileConfig = config as TileLayerOptions;

    // handle change in user checkbox input
    function handleCheckboxChange(e: ChangeEvent<HTMLInputElement>) {
        if (!e || !e.target) return;

        const {name, checked} = e.target;
        console.log("handle change: ", name, checked);

        let newConfig = {...config, [name]: checked};
        if (callback) callback(newConfig);
    }

    // handle change in user value input
    function handleValueChange(e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> ) {
        if (!e || !e.target) return;

        // TODO: check if number input field so that you can convert to Number
        
        const {name, value} = e.target;
        console.log("handle change: ", name, value);

        let newConfig = {...config, [name]: value};
        if (callback) callback(newConfig);
    }

    // reload map on enter press on input fields
    // function handleKeyDown(event: any) {
    //     if (event.key === 'Enter') {
    //     }
    // }

    function controlForType(layerType: string) {

        switch (layerType) {
        case "tile":
            return (
                <div>
                    <div>
                        <label htmlFor={config.id+"-tileSourceUrl"}>Tile Source:</label>
                        <select name="tileSourceUrl" id={config.id+"-tileSourceUrl"} onChange={handleValueChange} defaultValue={tileConfig.tileSourceUrl}>
                            {/* TODO: improve this system  */}
                            <option value="https://tile.openstreetmap.org/{z}/{x}/{y}.png">OSM Standard</option>
                            <option value="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png">OSM Humanitarian</option>
                            <option value="https://a.tile.opentopomap.org/{z}/{x}/{y}.png">OSM Topographic</option>
                            {/* <option value="https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png">MemoMaps</option> */}
                            {/* <option value="https://s.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png">CyclOSM</option> */}
                            {/* <option value="https://tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png">CyclOSM-lite</option> */}
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}">Esri World Imagery (satellite)</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}">Esri World Street Map</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}">Esri World Topographic</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}">Esri Shaded Relief</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}">Esri Physical Map</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}">Esri Terrain Base</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}">Esri NatGeo</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}">Esri Transportation</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}">Esri Light Gray Base</option>
                            <option value="https://server.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}">Esri Light Gray Reference</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}">Esri Dark Gray Base</option>
                            <option value="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}">Esri Dark Gray Reference</option>
                            <option value="https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}">Esri World Boundaries and Places</option>
                            <option value="https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}">Esri World Boundaries and Places (alt)</option>
                            <option value="https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}">Esri World Reference Overlay</option>
                            <option value="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png">Carto Positron</option>
                            <option value="https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png">Carto Positron - no labels</option>
                            <option value="https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png">Carto Dark Matter</option>
                            <option value="https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png">Carto Dark Matter - no labels</option>
                            <option value="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png">Carto Voyager</option>
                            <option value="https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png">Carto Voyager - no labels</option>
                            {/* <option value="http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg">Stamen Watercolor</option> */}
                            {/* <option value="https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png">OpenWeatherMap</option> */}
                        </select>
                    </div>
                </div>
            );
        case "bin":
            return (
                <div>
                    <div>
                        <input id={config.id+"-isVectorImage"} name="isVectorImage" type="checkbox" onChange={handleCheckboxChange} defaultChecked={binConfig.isVectorImage}/>
                        <label htmlFor={config.id+"-isVectorImage"}>layer as image</label>
                    </div>
                    <div>
                        <label htmlFor="binSize">Size:</label>
                        <input id="binSize" name="binSize" type="number" min={0} max={100000} defaultValue={binConfig.binSize} step={500} onChange={handleValueChange}  />
                        {/* onKeyDown={handleKeyDown} */}
                    </div>
                    <div>
                        <label htmlFor={config.id+"-intervalMin"}>Interval Min:</label>
                        <input id={config.id+"-intervalMin"} name="intervalMin" type="number" size={6} defaultValue={binConfig.intervalMin} step={1} onChange={handleValueChange}/>

                        <label htmlFor={config.id+"-intervalMax"}>Max:</label>
                        <input id={config.id+"-intervalMax"} name="intervalMax" type="number" size={6} defaultValue={binConfig.intervalMax} step={1} onChange={handleValueChange}/>
                    </div>
                    <div>
                        <input id={config.id+"-useManualInterval"} name="useManualInterval" type="checkbox" onChange={handleCheckboxChange} defaultChecked={binConfig.useManualInterval}/>
                        <label htmlFor={config.id+"-useManualInterval"}>use manual interval</label>
                    </div>
                    <div>
                        <input id={config.id+"-useIQRInterval"} name="useIQRInterval" type="checkbox" onChange={handleCheckboxChange} defaultChecked={binConfig.useIQRInterval}/>
                        <label htmlFor={config.id+"-useIQRInterval"}>use IQR interval</label>
                    </div>
                    <div>
                        <label htmlFor={config.id+"-aggFuncName"}>Agg Func:</label>
                        <select id={config.id+"-aggFuncName"} name="aggFuncName" defaultValue={binConfig.aggFuncName} onChange={handleValueChange}>
                            <option value="max">Max</option>
                            <option value="sum">Sum</option>
                            <option value="avg">Avg</option>
                            <option value="len">Count</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={config.id+"-binType"}>Bin Type:</label>
                        <select id={config.id+"-binType"} name="binType" defaultValue={binConfig.binType} onChange={handleValueChange}>
                            <option value="hex">Hex</option>
                            <option value="grid">Grid</option>
                            <option value="feature">Feature</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={config.id+"-hexStyle"}>Hex Style:</label>
                        <select id={config.id+"-hexStyle"} name="hexStyle" defaultValue={binConfig.hexStyle} onChange={handleValueChange}>
                            <option value="pointy">Pointy</option>
                            <option value="flat">Flat</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={config.id+"-binStyle"}>Style:</label>
                        <select id={config.id+"-binStyle"} name="binStyle" defaultValue={binConfig.binStyle} onChange={handleValueChange}>
                            <option value="gradient">Gradient</option>
                            <option value="color">Color</option>
                            <option value="point">Point</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor={config.id+"-colorScaleName"}>Color Scale:</label>
                        <select id={config.id+"-colorScaleName"} name="colorScaleName" onChange={handleValueChange} defaultValue={binConfig.colorScaleName}>
                            {Object.keys(chroma.brewer).map((key) => {
                                return (
                                    <option value={key} key={key}>{key}</option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label htmlFor={config.id+"-numColorSteps"}>Num Color Steps:</label>
                        <input id={config.id+"-numColorSteps"} name="numColorSteps" type="number" min={0} max={16} defaultValue={binConfig.numColorSteps} step={1} onChange={handleValueChange}/>

                    </div>
                </div>
            );
        }
    }

    let typeControls = controlForType(config.layerType);

    return (
        <div className='layer-options'>
            <div>
                id: {config.id}
            </div>
            <div>
                <label htmlFor={config.id+"-opacity"}>Opacity:</label>
                <input id={config.id+"-opacity"} name="opacity" type="range" min={0} max={100} defaultValue={config.opacity} step={1} onChange={handleValueChange}/>
                {config.opacity}
            </div>
            <div>
                <input id={config.id+"-visible"} name="visible" onChange={handleCheckboxChange} type="checkbox" defaultChecked={config.visible}/>
                <label htmlFor={config.id+"-visible"}>enabled</label>
            </div>
            {typeControls}
        </div>
    );
}