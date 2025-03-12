import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Point } from "ol/geom";
import Projection from "ol/proj/Projection";
import Vector, { VectorSourceEvent } from "ol/source/Vector";
import { BaseLayerOptions, BinLayerOptions, DataOptions } from "./BinMapOptions";
import { cityDataForValue } from "./Data/TopCities";

const stateBaseUrl = 'https://raw.githubusercontent.com/lint/AggregatedAddresses/master/data/aggregate/{dataset}/us/{state}/data.geojson';
const cityBaseUrl = 'https://raw.githubusercontent.com/lint/AggregatedAddresses/master/data/us_50_cities/{state}/{city}.geojson';
const competitionBaseUrl = 'https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/competitions-page-{page}.json';
const proj = new Projection({ code: "EPSG:3857" });

export default class DataManager {

    cachedSources: { [key: string]: Feature[] } = {};
    cachedRegionSources: { [key: string]: Vector } = {};
    cachedCompetitionData: { [key: string]: any } = {};
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

    loadCompetitionsPromise(dataConfig: DataOptions) {
        if (!dataConfig.wca.enabled) {
            return [];
        }
        return this.loadCompetitionPromise(1)
            .then(data => {
                let numPages = Math.ceil(data.total / data.pagination.size);
                let promises = [];
                for (let i = 1; i <= numPages; i++) {
                    promises.push(this.loadCompetitionPromise(i));
                }

                return Promise.all(promises);
            })
            .then(data => {
                let compFeatures = data.map(pageData => pageData.items.filter((comp: any) => {
                    let pass = true;

                    if (dataConfig.wca.includeCancelled !== 'both') {
                        pass &&= (comp.isCanceled && dataConfig.wca.includeCancelled === 'yes') || (!comp.isCanceled && dataConfig.wca.includeCancelled === 'no');
                    }

                    if (dataConfig.wca.filteredEvents.length > 0) {
                        switch (dataConfig.wca.eventFilterMethod) {
                            case 'AND':
                                pass &&= dataConfig.wca.filteredEvents.every((event: any) => comp.events.includes(event));
                                break;
                            case 'OR':
                                pass &&= dataConfig.wca.filteredEvents.some((event: any) => comp.events.includes(event));
                                break;
                            case 'NOT':
                                pass &&= !dataConfig.wca.filteredEvents.some((event: any) => comp.events.includes(event));
                                break;
                        }
                    }

                    return pass;
                }).map((comp: any) => {
                    let point = new Point([comp.venue.coordinates.longitude, comp.venue.coordinates.latitude]);
                    point.transform('EPSG:4326', 'EPSG:3857');

                    let feature = new Feature(point);
                    feature.set('num_events', comp.events.length);
                    feature.set('num_delegates', comp.wcaDelegates.length);
                    feature.set('num_organizers', comp.organisers.length);
                    feature.set('num_days', comp.date.numberOfDays);
                    feature.set('cancelled', comp.isCanceled);
                    feature.set('name', comp.name);

                    return feature;
                }));
                return compFeatures.flat();
            })
    }

    loadCompetitionPromise(pageNum: number) {
        let pageUrl = competitionBaseUrl.replace('{page}', String(pageNum));
        if (pageUrl in this.cachedCompetitionData) {
            return new Promise((resolve) => resolve(this.cachedCompetitionData[pageUrl]));
        } else {
            return fetch(pageUrl)
                .then(res => res.json())
                .then(data => {
                    this.cachedCompetitionData[pageUrl] = data;
                    return data;
                });
        }
    }

    loadAddressesPromises(dataConfig: DataOptions) {
        let addressUrls = [...this.getStateUrls(dataConfig), ...this.getCityUrls(dataConfig)];
        let addressPromises = addressUrls.map(url => new Promise((resolve, reject) => {

            if (url in this.cachedSources) {
                resolve(this.cachedSources[url]);
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
        }));

        return addressPromises;
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

        let addressPromises = this.loadAddressesPromises(dataConfig);
        let competitionPromise = this.loadCompetitionsPromise(dataConfig);

        let promises = [...addressPromises, competitionPromise];

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