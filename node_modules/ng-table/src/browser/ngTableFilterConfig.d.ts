/// <reference types="angular" />
import { IServiceProvider, auto } from 'angular';
import { IFilterConfigValues, IFilterTemplateDef } from './public-interfaces';
/**
 * The angular provider used to configure the behaviour of the `NgTableFilterConfig` service.
 */
export declare class NgTableFilterConfigProvider implements IServiceProvider {
    static $inject: string[];
    $get: () => NgTableFilterConfig;
    private config;
    private defaultConfig;
    constructor($injector: auto.IInjectorService);
    /**
     * Reset back to factory defaults the config values that `NgTableFilterConfig` service will use
     */
    resetConfigs(): void;
    /**
     * Set the config values used by `NgTableFilterConfig` service
     */
    setConfig(customConfig: IFilterConfigValues): void;
}
/**
 * Exposes configuration values and methods used to return the location of the html
 * templates used to render the filter row of an ng-table directive
 */
export declare class NgTableFilterConfig {
    /**
     * Readonly copy of the final values used to configure the service.
     */
    readonly config: IFilterConfigValues;
    static $inject: string[];
    constructor(
        /**
         * Readonly copy of the final values used to configure the service.
         */
        config: IFilterConfigValues);
    /**
     * Return the url of the html filter template registered with the alias supplied
     */
    getUrlForAlias(aliasName: string, filterKey?: string): string;
    /**
     * Return the url of the html filter template for the supplied definition and key.
     * For more information see the documentation for {@link IFilterTemplateMap}
     */
    getTemplateUrl(filterDef: string | IFilterTemplateDef, filterKey?: string): string;
}
