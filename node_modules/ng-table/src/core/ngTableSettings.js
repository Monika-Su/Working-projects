import * as ng1 from 'angular';
/**
 * @private
 */
export var NgTableSettings = (function () {
    function NgTableSettings(ngTableDefaults, ngTableDefaultGetData, ngTableDefaultGetGroups) {
        var _this = this;
        this.ngTableDefaults = ngTableDefaults;
        this.ngTableDefaultGetData = ngTableDefaultGetData;
        this.ngTableDefaultGetGroups = ngTableDefaultGetGroups;
        this.defaults = {
            $loading: false,
            dataset: null,
            total: 0,
            defaultSort: 'desc',
            counts: [10, 25, 50, 100],
            filterOptions: {
                filterComparator: undefined,
                filterDelay: 500,
                filterDelayThreshold: 10000,
                filterFilterName: undefined,
                filterFn: undefined,
                filterLayout: 'stack'
            },
            getData: function (params) {
                return _this.ngTableDefaultGetData(params.settings().dataset, params);
            },
            getGroups: this.ngTableDefaultGetGroups,
            groupOptions: {
                defaultSort: 'asc',
                isExpanded: true
            },
            interceptors: [],
            paginationMaxBlocks: 11,
            paginationMinBlocks: 5,
            sortingIndicator: 'span'
        };
    }
    NgTableSettings.prototype.createDefaults = function () {
        return this.merge(this.defaults, this.ngTableDefaults.settings);
    };
    NgTableSettings.prototype.merge = function (existing, newSettings) {
        newSettings = ng1.extend({}, newSettings);
        if (newSettings.filterOptions) {
            newSettings.filterOptions = ng1.extend({}, existing.filterOptions || {}, newSettings.filterOptions);
        }
        if (newSettings.groupOptions) {
            newSettings.groupOptions = ng1.extend({}, existing.groupOptions || {}, newSettings.groupOptions);
        }
        if (ng1.isArray(newSettings.dataset)) {
            //auto-set the total from passed in dataset
            newSettings.total = newSettings.dataset.length;
        }
        var results = ng1.extend({}, existing, newSettings);
        if (ng1.isArray(newSettings.dataset)) {
            this.optimizeFilterDelay(results);
        }
        return ng1.extend({}, existing, newSettings);
    };
    NgTableSettings.prototype.optimizeFilterDelay = function (settings) {
        // don't debounce by default filter input when working with small synchronous datasets
        if (settings.filterOptions.filterDelay === this.defaults.filterOptions.filterDelay &&
            settings.total <= settings.filterOptions.filterDelayThreshold &&
            settings.getData === this.defaults.getData) {
            settings.filterOptions.filterDelay = 0;
        }
    };
    NgTableSettings.$inject = ['ngTableDefaults', 'ngTableDefaultGetData', 'ngTableDefaultGetGroups'];
    return NgTableSettings;
}());
//# sourceMappingURL=ngTableSettings.js.map