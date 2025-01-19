export interface BaseLayerOptions {
    visible: boolean;
    opacity: number;
    id: string;
    layerType: string;
};

export interface TileLayerOptions extends BaseLayerOptions {
    tileSourceUrl: string;
};

export interface BinLayerOptions extends BaseLayerOptions {
    hexStyle: string;
    binStyle: string;
    binType: string;
    binSize: number;
    aggFuncName: string;
    isVectorImage: boolean;
    numColorSteps: number;
    colorScaleName: string;
    intervalMin: number;
    intervalMax: number;
    useManualInterval: boolean;
    useIQRInterval: boolean;
};