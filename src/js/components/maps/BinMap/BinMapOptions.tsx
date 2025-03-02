import chroma from "chroma-js";

export interface BinValues {
    min: number;
    max: number;
    sum: number;
    avg: number;
    len: number;
};

export interface DataOptions {
    id: string;
    title: string;
    dataResolution: string;
    selectedStates: string[];
    selectedCities: string[];
    expandedItems?: string[];
};

export interface BaseLayerOptions {
    title: string;
    visible: boolean;
    opacity: number;
    id: string;
    layerType: string;
    zIndex: number;
};

export interface TileLayerOptions extends BaseLayerOptions {
    sourceType: string;
    baseSourceUrl: string;
    overlaySourceUrl: string;
};

export interface HeatmapLayerOptions extends BaseLayerOptions {
    blur: number;
    radius: number;
    aggFuncName: string;
    numColorSteps: number;
    colorScaleName: string;
};

export interface BinLayerOptions extends BaseLayerOptions {
    hexStyle: string;
    colorMode: string;
    binType: string;
    layerClass: string;
    binSize: number;
    binSizeStep: number;
    featureSourceUrl: string;
    aggFuncName: string;
    numColorSteps: number;
    colorScaleName: string;
    customMin: number;
    customMax: number;
    customMinBound: number;
    customMaxBound: number;
    intervalMode: string;
    backgroundColorMode: string;
    customBackgroundColor: string;
};

export interface BinRange {
    full_min: number,
    full_max: number,
    iqr_min: number,
    iqr_max: number
};

export interface LayerDisplayInfo {
    controlExpanded?: boolean;
    binRanges?: BinRange;
};

export interface LayerDisplayInfoSet {
    [key: string]: LayerDisplayInfo;
};

// returns the background color for a given bin config
export function getBackgroundColor(binLayerConfig: BinLayerOptions) {

    switch (binLayerConfig.backgroundColorMode) {
        case 'auto':
            let color = chroma.scale(binLayerConfig.colorScaleName)(0).darken().alpha(binLayerConfig.opacity / 100).hex();
            return color ? color : '';
        case 'custom':
            return binLayerConfig.customBackgroundColor;
        case 'none':
        default:
            return '';
    }
}

export function createTileOptions(title?: string, id?: string, zIndex?: number, visible?: boolean) {
    return {
        id: id ? id : crypto.randomUUID(),
        title: title ? title : "Tile Layer",
        layerType: "tile",
        visible: visible !== undefined ? visible : true,
        opacity: 100,
        baseSourceUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        overlaySourceUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        sourceType: 'base',
        zIndex: zIndex ? zIndex : 1,
    } as TileLayerOptions;
}

export function createBinOptions(title?: string, id?: string, zIndex?: number, visible?: boolean) {
    return {
        id: id ? id : crypto.randomUUID(),
        title: title ? title : "Bin Layer",
        layerType: "bin",
        visible: visible !== undefined ? visible : true,
        opacity: 100,
        hexStyle: "pointy",
        colorMode: "gradient",
        binType: "hex",
        binSize: 0,
        binSizeStep: 1000,
        featureSourceUrl: 'https://lint.github.io/CartoBoundaryGeoFiles/data/cb_2023_us_all_5m/cb_2023_us_county_5m.geojson',
        aggFuncName: "max",
        layerClass: "VectorImage",
        numColorSteps: 5,
        colorScaleName: "Viridis",
        customMin: 0,
        customMax: 1,
        customMinBound: 0,
        customMaxBound: 1,
        zIndex: zIndex ? zIndex : 1,
        intervalMode: "full",
        backgroundColorMode: "none",
        customBackgroundColor: chroma.scale("Viridis")(0).darken().hex(),
    } as BinLayerOptions;
}

export function createHeatmapOptions(title?: string, id?: string, zIndex?: number, visible?: boolean) {
    return {
        id: id ? id : crypto.randomUUID(),
        title: title ? title : "Heatmap Layer",
        layerType: "heatmap",
        visible: visible !== undefined ? visible : true,
        opacity: 100,
        zIndex: zIndex ? zIndex : 1,
        blur: 10,
        radius: 10,
        aggFuncName: 'max',
        numColorSteps: 5,
        colorScaleName: "Viridis",
    } as HeatmapLayerOptions;
}

export function getRangeValue(binLayerConfig: BinLayerOptions, binRange: BinRange, isMax: boolean, modeOverride?: string) {

    switch (modeOverride ? modeOverride : binLayerConfig.intervalMode) {
        // case 'manual':
        //     return isMax ? binLayerConfig.customMax : binLayerConfig.customMin;
        case 'custom':
            let normal = isMax ? binLayerConfig.customMax : binLayerConfig.customMin;
            return normal * (binRange.full_max - binRange.full_min) + binRange.full_min;
        case 'IQR':
            return isMax ? binRange.iqr_max : binRange.iqr_min;
        case 'full':
        default:
            return isMax ? binRange.full_max : binRange.full_min;
    }
}

