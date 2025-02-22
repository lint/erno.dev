import chroma from "chroma-js";

export interface BaseLayerOptions {
    title: string;
    visible: boolean;
    opacity: number;
    id: string;
    layerType: string;
    zIndex: number;
};

export interface TileLayerOptions extends BaseLayerOptions {
    tileSourceUrl: string;
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
    featureSourceUrl: string;
    aggFuncName: string;
    numColorSteps: number;
    colorScaleName: string;
    customMin: number;
    customMax: number;
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

export interface DataOptions {
    dataResolution: string;
    selectedStates: string[];
    expandedItems?: string[];
};
