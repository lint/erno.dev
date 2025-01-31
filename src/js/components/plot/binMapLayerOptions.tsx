import chroma from "chroma-js";

export interface BaseLayerOptions {
    visible: boolean;
    opacity: number;
    id: string;
    layerType: string;
    zIndex: number;
};

export interface TileLayerOptions extends BaseLayerOptions {
    tileSourceUrl: string;
};

export interface BinLayerOptions extends BaseLayerOptions {
    hexStyle: string;
    colorMode: string;
    binType: string;
    binSize: number;
    aggFuncName: string;
    isVectorImage: boolean;
    numColorSteps: number;
    colorScaleName: string;
    customMin: number;
    customMax: number;
    intervalMode: string;
    backgroundColorMode: string;
    customBackgroundColor: string;
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