import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import Projection from "ol/proj/Projection";
import Vector, { VectorSourceEvent } from "ol/source/Vector";
import { BaseLayerOptions, BinLayerOptions, DataOptions } from "./BinMapOptions";
import { cityDataForValue } from "./Data/TopCities";

const stateBaseUrl = 'https://raw.githubusercontent.com/lint/AggregatedAddresses/master/data/aggregate/{dataset}/us/{state}/data.geojson';
const cityBaseUrl = 'https://raw.githubusercontent.com/lint/AggregatedAddresses/master/data/us_50_cities/{state}/{city}.geojson';

export default class DataManager {

    cachedSources: { [key: string]: Feature[] } = {};
    cachedRegionSources: { [key: string]: Vector } = {};
    features: { [key: string]: Vector } = {};

    constructor() { }

    // format selected states into urls
    getStateUrls(dataConfig: DataOptions) {
        return dataConfig.address.selectedStates.map(state => stateBaseUrl.replace('{dataset}', dataConfig.address.dataResolution).replace('{state}', state.toLowerCase()));
    }

    // format selected cities into urls
    getCityUrls(dataConfig: DataOptions) {
        let cityUrls = [];
        for (let city of dataConfig.address.selectedCities) {
            let cityData = cityDataForValue(city);
            if (!cityData) continue;

            for (let i = 1; i <= cityData.file_parts; i++) {
                cityUrls.push(cityBaseUrl.replace('{state}', cityData.state).replace('{city}', cityData.city));
            }
        }
        return cityUrls;
    }

    // download all features specified in all data configs
    loadFeatures(dataConfigs: DataOptions[], callback?: (value: any) => void) {
        this.features = {};
        for (let dataConfig of dataConfigs) {
            this.loadFeaturesForConfig(dataConfig, callback);
        }
    }

    // download features for a given config
    loadFeaturesForConfig(dataConfig: DataOptions, callback?: (value: any) => void) {

        let urls = [...this.getStateUrls(dataConfig), ...this.getCityUrls(dataConfig)];
        let proj = new Projection({ code: "EPSG:3857" });

        let promises = urls.map((url) =>
            new Promise((resolve, reject) => {
                if (url in this.cachedSources) {
                    resolve(this.cachedSources[url as keyof typeof this.cachedSources]);
                    return;
                }

                let binSource = new Vector({
                    url: url,
                    format: new GeoJSON(),
                    // loader: () => {
                    // }
                });
                binSource.loadFeatures([0, 0, 0, 0], 0, proj);

                binSource.on("featuresloadend", (e: VectorSourceEvent) => {
                    if (e.features) {
                        this.cachedSources[url] = e.features;
                        resolve(e.features);
                    } else {
                        reject(`No features loaded for url: ${url}`);
                    }
                });
            })
        );

        Promise.all(promises).then((featureSets) => {
            this.features = {
                ...this.features,
                [dataConfig.id]: new Vector({ features: featureSets.flat() as Feature[] })
            };
            if (callback) callback(this.features);
        });
    }

    // load selected regions for current layer configs
    loadRegions(layerConfigs: BaseLayerOptions[], callback?: (value: any) => void) {
        // check if new feature source url should be downloaded
        for (let layerConfig of layerConfigs) {
            if (layerConfig.layerType !== 'bin') continue;
            this.loadRegionSourceUrl((layerConfig as BinLayerOptions).featureSourceUrl, callback);
        }
    }

    // download region / feature bin sources from a given url
    loadRegionSourceUrl(url: string, callback?: (value: any) => void) {
        console.log("addRegionSourceUrl:", url);

        // TODO: ensure this is done async?
        let proj = new Projection({ code: "EPSG:3857" });
        if (url in this.cachedRegionSources) {
            return;
        }

        let binSource = new Vector({
            url: url,
            format: new GeoJSON(),
            // loader: () => {
            // }
        });
        binSource.loadFeatures([0, 0, 0, 0], 0, proj);
        binSource.on("featuresloadend", () => {
            this.cachedRegionSources = {
                ...this.cachedRegionSources,
                [url]: binSource
            };
            if (callback) callback(this.cachedRegionSources);
        });
    }
}

export const dataManager = new DataManager();