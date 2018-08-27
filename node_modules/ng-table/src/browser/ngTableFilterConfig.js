/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import * as ng1 from 'angular';
/**
 * The angular provider used to configure the behaviour of the `NgTableFilterConfig` service.
 */
export var NgTableFilterConfigProvider = (function () {
    function NgTableFilterConfigProvider($injector) {
        var _this = this;
        this.defaultConfig = {
            defaultBaseUrl: 'ng-table/filters/',
            defaultExt: '.html',
            aliasUrls: {}
        };
        this.$get = function () {
            return $injector.instantiate(NgTableFilterConfig, { config: ng1.copy(_this.config) });
        };
        this.$get.$inject = [];
        this.resetConfigs();
    }
    /**
     * Reset back to factory defaults the config values that `NgTableFilterConfig` service will use
     */
    NgTableFilterConfigProvider.prototype.resetConfigs = function () {
        this.config = this.defaultConfig;
    };
    /**
     * Set the config values used by `NgTableFilterConfig` service
     */
    NgTableFilterConfigProvider.prototype.setConfig = function (customConfig) {
        var mergeConfig = ng1.extend({}, this.config, customConfig);
        mergeConfig.aliasUrls = ng1.extend({}, this.config.aliasUrls, customConfig.aliasUrls);
        this.config = mergeConfig;
    };
    NgTableFilterConfigProvider.$inject = ['$injector'];
    return NgTableFilterConfigProvider;
}());
/**
 * Exposes configuration values and methods used to return the location of the html
 * templates used to render the filter row of an ng-table directive
 */
export var NgTableFilterConfig = (function () {
    function NgTableFilterConfig(
        /**
         * Readonly copy of the final values used to configure the service.
         */
        config) {
        this.config = config;
    }
    /**
     * Return the url of the html filter template registered with the alias supplied
     */
    NgTableFilterConfig.prototype.getUrlForAlias = function (aliasName, filterKey) {
        return this.config.aliasUrls[aliasName] || this.config.defaultBaseUrl + aliasName + this.config.defaultExt;
    };
    /**
     * Return the url of the html filter template for the supplied definition and key.
     * For more information see the documentation for {@link IFilterTemplateMap}
     */
    NgTableFilterConfig.prototype.getTemplateUrl = function (filterDef, filterKey) {
        var filterName;
        if (typeof filterDef !== 'string') {
            filterName = filterDef.id;
        }
        else {
            filterName = filterDef;
        }
        if (filterName.indexOf('/') !== -1) {
            return filterName;
        }
        return this.getUrlForAlias(filterName, filterKey);
    };
    NgTableFilterConfig.$inject = ['config'];
    return NgTableFilterConfig;
}());
//# sourceMappingURL=ngTableFilterConfig.js.map