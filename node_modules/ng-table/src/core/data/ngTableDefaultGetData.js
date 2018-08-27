/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import * as ng1 from 'angular';
/**
 * Implementation of the {@link IDefaultGetDataProvider} interface
 */
export var NgTableDefaultGetDataProvider = (function () {
    function NgTableDefaultGetDataProvider() {
        /**
         * The name of a angular filter that knows how to apply the values returned by
         * `NgTableParams.filter()` to restrict an array of data.
         * (defaults to the angular `filter` filter service)
         */
        this.filterFilterName = 'filter';
        /**
         * The name of a angular filter that knows how to apply the values returned by
        * `NgTableParams.orderBy()` to sort an array of data.
        * (defaults to the angular `orderBy` filter service)
        */
        this.sortingFilterName = 'orderBy';
        var provider = this;
        this.$get = ngTableDefaultGetData;
        ngTableDefaultGetData.$inject = ['$filter', 'ngTableEventsChannel'];
        function ngTableDefaultGetData($filter, ngTableEventsChannel) {
            var defaultDataOptions = { applyFilter: true, applySort: true, applyPaging: true };
            getData.applyPaging = applyPaging;
            getData.getFilterFn = getFilterFn;
            getData.getOrderByFn = getOrderByFn;
            return getData;
            function getFilterFn(params) {
                var filterOptions = params.settings().filterOptions;
                if (ng1.isFunction(filterOptions.filterFn)) {
                    return filterOptions.filterFn;
                }
                else {
                    return $filter(filterOptions.filterFilterName || provider.filterFilterName);
                }
            }
            function getOrderByFn(params) {
                return $filter(provider.sortingFilterName);
            }
            function applyFilter(data, params) {
                if (!params.hasFilter()) {
                    return data;
                }
                var filter = params.filter(true);
                var filterKeys = Object.keys(filter);
                var parsedFilter = filterKeys.reduce(function (result, key) {
                    result = setPath(result, filter[key], key);
                    return result;
                }, {});
                var filterFn = getFilterFn(params);
                return filterFn.call(params, data, parsedFilter, params.settings().filterOptions.filterComparator);
            }
            function applyPaging(data, params) {
                var pagedData = data.slice((params.page() - 1) * params.count(), params.page() * params.count());
                params.total(data.length); // set total for recalc pagination
                return pagedData;
            }
            function applySort(data, params) {
                var orderBy = params.orderBy();
                var orderByFn = getOrderByFn(params);
                return orderBy.length ? orderByFn(data, orderBy) : data;
            }
            function getData(data, params) {
                if (data == null) {
                    return [];
                }
                var options = ng1.extend({}, defaultDataOptions, params.settings().dataOptions);
                var fData = options.applyFilter ? applyFilter(data, params) : data;
                ngTableEventsChannel.publishAfterDataFiltered(params, fData);
                var orderedData = options.applySort ? applySort(fData, params) : fData;
                ngTableEventsChannel.publishAfterDataSorted(params, orderedData);
                return options.applyPaging ? applyPaging(orderedData, params) : orderedData;
            }
            // Sets the value at any depth in a nested object based on the path
            // note: adapted from: underscore-contrib#setPath
            function setPath(obj, value, path) {
                var keys = path.split('.');
                var ret = obj;
                var lastKey = keys[keys.length - 1];
                var target = ret;
                var parentPathKeys = keys.slice(0, keys.length - 1);
                parentPathKeys.forEach(function (key) {
                    if (!target.hasOwnProperty(key)) {
                        target[key] = {};
                    }
                    target = target[key];
                });
                target[lastKey] = value;
                return ret;
            }
        }
    }
    return NgTableDefaultGetDataProvider;
}());
//# sourceMappingURL=ngTableDefaultGetData.js.map