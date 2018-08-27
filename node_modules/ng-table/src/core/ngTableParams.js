/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import * as ng1 from 'angular';
import { convertSortToOrderBy, isGroupingFun } from './util';
/**
 * @private
 */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
/**
 * Parameters manager for an ngTable directive
 */
export var NgTableParams = (function () {
    function NgTableParams(baseParameters, baseSettings) {
        var _this = this;
        /**
         * The page of data rows currently being displayed in the table
         */
        this.data = [];
        this.defaultSettings = NgTableParams.ngTableSettings.createDefaults();
        this.isCommittedDataset = false;
        this.initialEvents = [];
        this._params = {
            page: 1,
            count: 10,
            filter: {},
            sorting: {},
            group: {}
        };
        this._settings = this.defaultSettings;
        // the ngTableController "needs" to create a dummy/null instance and it's important to know whether an instance
        // is one of these
        if (typeof baseParameters === "boolean") {
            this.isNullInstance = true;
        }
        this.reloadPages = (function () {
            var currentPages;
            return function () {
                var oldPages = currentPages;
                var newPages = _this.generatePagesArray(_this.page(), _this.total(), _this.count());
                if (!ng1.equals(oldPages, newPages)) {
                    currentPages = newPages;
                    NgTableParams.ngTableEventsChannel.publishPagesChanged(_this, newPages, oldPages);
                }
            };
        })();
        ng1.extend(this._params, NgTableParams.ngTableDefaults.params);
        this.settings(baseSettings);
        this.parameters(baseParameters, true);
        NgTableParams.ngTableEventsChannel.publishAfterCreated(this);
        // run events during construction after the initial create event. That way a consumer
        // can subscribe to all events for a table without "dropping" an event
        ng1.forEach(this.initialEvents, function (event) {
            event();
        });
        this.initialEvents = null;
    }
    NgTableParams.prototype.count = function (count) {
        // reset to first page because can be blank page
        return count !== undefined ? this.parameters({
            'count': count,
            'page': 1
        }) : this._params.count;
    };
    NgTableParams.prototype.filter = function (filter) {
        if (filter != null && typeof filter === 'object') {
            return this.parameters({
                'filter': filter,
                'page': 1
            });
        }
        else if (filter === true) {
            var keys = Object.keys(this._params.filter);
            var significantFilter = {};
            for (var i = 0; i < keys.length; i++) {
                var filterValue = this._params.filter[keys[i]];
                if (filterValue != null && filterValue !== '') {
                    significantFilter[keys[i]] = filterValue;
                }
            }
            return significantFilter;
        }
        else {
            return this._params.filter;
        }
    };
    /**
     * Generate array of pages.
     * When no arguments supplied, the current parameter state of this `NgTableParams` instance will be used
     * @param currentPage Which page must be active
     * @param totalItems  Total quantity of items
     * @param pageSize    Quantity of items on page
     * @param maxBlocks   Quantity of blocks for pagination
     * @returns Array of pages
     */
    NgTableParams.prototype.generatePagesArray = function (currentPage, totalItems, pageSize, maxBlocks) {
        if (!arguments.length) {
            currentPage = this.page();
            totalItems = this.total();
            pageSize = this.count();
        }
        var maxPage, maxPivotPages, minPage, numPages;
        maxBlocks = maxBlocks && maxBlocks < 6 ? 6 : maxBlocks;
        var pages = [];
        numPages = Math.ceil(totalItems / pageSize);
        if (numPages > 1) {
            pages.push({
                type: 'prev',
                number: Math.max(1, currentPage - 1),
                active: currentPage > 1
            });
            pages.push({
                type: 'first',
                number: 1,
                active: currentPage > 1,
                current: currentPage === 1
            });
            maxPivotPages = Math.round((this._settings.paginationMaxBlocks - this._settings.paginationMinBlocks) / 2);
            minPage = Math.max(2, currentPage - maxPivotPages);
            maxPage = Math.min(numPages - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
            minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
            var i = minPage;
            while (i <= maxPage) {
                if ((i === minPage && i !== 2) || (i === maxPage && i !== numPages - 1)) {
                    pages.push({
                        type: 'more',
                        active: false
                    });
                }
                else {
                    pages.push({
                        type: 'page',
                        number: i,
                        active: currentPage !== i,
                        current: currentPage === i
                    });
                }
                i++;
            }
            pages.push({
                type: 'last',
                number: numPages,
                active: currentPage !== numPages,
                current: currentPage === numPages
            });
            pages.push({
                type: 'next',
                number: Math.min(numPages, currentPage + 1),
                active: currentPage < numPages
            });
        }
        return pages;
    };
    NgTableParams.prototype.group = function (group, sortDirection) {
        if (group === undefined) {
            return this._params.group;
        }
        var newParameters = {
            page: 1
        };
        if (isGroupingFun(group) && sortDirection !== undefined) {
            group.sortDirection = sortDirection;
            newParameters.group = group;
        }
        else if (typeof group === 'string' && sortDirection !== undefined) {
            newParameters.group = (_a = {}, _a[group] = sortDirection, _a);
        }
        else {
            newParameters.group = group;
        }
        this.parameters(newParameters);
        return this;
        var _a;
    };
    /**
     * Returns true when an attempt to `reload` the current `parameter` values have resulted in a failure.
     * This method will continue to return true until the `reload` is successfully called or when the
     * `parameter` values have changed
     */
    NgTableParams.prototype.hasErrorState = function () {
        return !!(this.errParamsMemento && ng1.equals(this.errParamsMemento, this.createComparableParams()));
    };
    /**
     * Returns true if `filter` has significant filter value(s) (any value except null, undefined, or empty string),
     * otherwise false
     */
    NgTableParams.prototype.hasFilter = function () {
        return Object.keys(this.filter(true)).length > 0;
    };
    /**
     * Return true when a change to `filters` require the `reload` method
     * to be run so as to ensure the data presented to the user reflects these filters
     */
    NgTableParams.prototype.hasFilterChanges = function () {
        var previousFilter = (this.prevParamsMemento && this.prevParamsMemento.params.filter);
        return !ng1.equals((this._params.filter), previousFilter) || this.hasGlobalSearchFieldChanges();
    };
    NgTableParams.prototype.hasGroup = function (group, sortDirection) {
        if (group == null) {
            return isGroupingFun(this._params.group) || Object.keys(this._params.group).length > 0;
        }
        if (isGroupingFun(group)) {
            if (sortDirection == null) {
                return this._params.group === group;
            }
            else {
                return this._params.group === group && group.sortDirection === sortDirection;
            }
        }
        else {
            if (sortDirection == null) {
                return Object.keys(this._params.group).indexOf(group) !== -1;
            }
            else {
                return this._params.group[group] === sortDirection;
            }
        }
    };
    /**
     * Return true when a change to this instance should require the `reload` method
     * to be run so as to ensure the data rows presented to the user reflects the current state.
     *
     * Note that this method will return false when the `reload` method has run but fails. In this case
     * `hasErrorState` will return true.
     *
     * The built-in `ngTable` directives will watch for when this function returns true and will then call
     * the `reload` method to load its data rows
     */
    NgTableParams.prototype.isDataReloadRequired = function () {
        // note: using != as want to treat null and undefined the same
        return !this.isCommittedDataset || !ng1.equals(this.createComparableParams(), this.prevParamsMemento)
            || this.hasGlobalSearchFieldChanges();
    };
    /**
     * Returns true if sorting by the field supplied. Where direction supplied
     * the field must also be sorted by that direction to return true
     */
    NgTableParams.prototype.isSortBy = function (field, direction) {
        if (direction !== undefined) {
            return this._params.sorting[field] !== undefined && this._params.sorting[field] == direction;
        }
        else {
            return this._params.sorting[field] !== undefined;
        }
    };
    /**
     * Returns sorting values in a format that can be consumed by the angular `$orderBy` filter service
     */
    NgTableParams.prototype.orderBy = function () {
        return convertSortToOrderBy(this._params.sorting);
    };
    NgTableParams.prototype.page = function (page) {
        return page !== undefined ? this.parameters({
            'page': page
        }) : this._params.page;
    };
    NgTableParams.prototype.parameters = function (newParameters, parseParamsFromUrl) {
        parseParamsFromUrl = parseParamsFromUrl || false;
        if (typeof newParameters !== undefined) {
            for (var key in newParameters) {
                var value = newParameters[key];
                if (parseParamsFromUrl && key.indexOf('[') >= 0) {
                    var keys = key.split(/\[(.*)\]/).reverse();
                    var lastKey = '';
                    for (var i = 0, len = keys.length; i < len; i++) {
                        var name_1 = keys[i];
                        if (name_1 !== '') {
                            var v = value;
                            value = {};
                            value[lastKey = name_1] = (isNumber(v) ? parseFloat(v) : v);
                        }
                    }
                    if (lastKey === 'sorting') {
                        this._params[lastKey] = {};
                    }
                    this._params[lastKey] = ng1.extend(this._params[lastKey] || {}, value[lastKey]);
                }
                else {
                    if (key === 'group') {
                        this._params[key] = this.parseGroup(newParameters[key]);
                    }
                    else {
                        this._params[key] = (isNumber(newParameters[key]) ? parseFloat(newParameters[key]) : newParameters[key]);
                    }
                }
            }
            this.log('ngTable: set parameters', this._params);
            return this;
        }
        return this._params;
    };
    /**
     * Trigger a reload of the data rows
     */
    NgTableParams.prototype.reload = function () {
        var _this = this;
        var pData = null;
        this._settings.$loading = true;
        this.prevParamsMemento = ng1.copy(this.createComparableParams());
        this.isCommittedDataset = true;
        if (this.hasGroup()) {
            pData = this.runInterceptorPipeline(NgTableParams.$q.when(this._settings.getGroups(this)));
        }
        else {
            var fn = this._settings.getData;
            pData = this.runInterceptorPipeline(NgTableParams.$q.when(fn(this)));
        }
        this.log('ngTable: reload data');
        var oldData = this.data;
        return pData.then(function (data) {
            _this._settings.$loading = false;
            _this.errParamsMemento = null;
            _this.data = data;
            // note: I think it makes sense to publish this event even when data === oldData
            // subscribers can always set a filter to only receive the event when data !== oldData
            NgTableParams.ngTableEventsChannel.publishAfterReloadData(_this, data, oldData);
            _this.reloadPages();
            return data;
        }).catch(function (reason) {
            _this.errParamsMemento = _this.prevParamsMemento;
            // "rethrow"
            return NgTableParams.$q.reject(reason);
        });
    };
    NgTableParams.prototype.settings = function (newSettings) {
        var _this = this;
        if (ng1.isDefined(newSettings)) {
            var settings = NgTableParams.ngTableSettings.merge(this._settings, newSettings);
            var originalDataset_1 = this._settings.dataset;
            this._settings = settings;
            // note: using != as want null and undefined to be treated the same
            var hasDatasetChanged = newSettings.hasOwnProperty('dataset') && (newSettings.dataset != originalDataset_1);
            if (hasDatasetChanged) {
                if (this.isCommittedDataset) {
                    this.page(1); // reset page as a new dataset has been supplied
                }
                this.isCommittedDataset = false;
                var fireEvent = function () {
                    NgTableParams.ngTableEventsChannel.publishDatasetChanged(_this, newSettings.dataset, originalDataset_1);
                };
                if (this.initialEvents) {
                    this.initialEvents.push(fireEvent);
                }
                else {
                    fireEvent();
                }
            }
            this.log('ngTable: set settings', this._settings);
            return this;
        }
        return this._settings;
    };
    NgTableParams.prototype.sorting = function (sorting, direction) {
        if (typeof sorting === 'string') {
            this.parameters({
                'sorting': (_a = {}, _a[sorting] = direction, _a)
            });
            return this;
        }
        return sorting !== undefined ? this.parameters({
            'sorting': sorting
        }) : this._params.sorting;
        var _a;
    };
    NgTableParams.prototype.total = function (total) {
        return total !== undefined ? this.settings({
            'total': total
        }) : this._settings.total;
    };
    /**
     * Returns the current parameter values uri-encoded. Set `asString` to
     * true for the parameters to be returned as an array of strings of the form 'paramName=value'
     * otherwise parameters returned as a key-value object
     */
    NgTableParams.prototype.url = function (asString) {
        // this function is an example of Typescript gone bad!!
        asString = asString || false;
        var pairs = (asString ? [] : {});
        for (var key in this._params) {
            if (this._params.hasOwnProperty(key)) {
                var item = this._params[key], name_2 = encodeURIComponent(key);
                if (typeof item === "object") {
                    for (var subkey in item) {
                        if (isSignificantValue(item[subkey], key)) {
                            var pname = name_2 + "[" + encodeURIComponent(subkey) + "]";
                            collectValue(item[subkey], pname);
                        }
                    }
                }
                else if (!ng1.isFunction(item) && isSignificantValue(item, key)) {
                    collectValue(item, name_2);
                }
            }
        }
        return pairs;
        function collectValue(value, key) {
            if (isArray(pairs)) {
                pairs.push(key + "=" + encodeURIComponent(value));
            }
            else {
                pairs[key] = encodeURIComponent(value);
            }
        }
        function isArray(pairs) {
            return asString;
        }
        function isSignificantValue(value, key) {
            return key === "group" ? true : typeof value !== undefined && value !== "";
        }
    };
    NgTableParams.prototype.createComparableParams = function () {
        var group = this._params.group;
        return {
            params: this._params,
            groupSortDirection: isGroupingFun(group) ? group.sortDirection : undefined
        };
    };
    NgTableParams.prototype.hasGlobalSearchFieldChanges = function () {
        var currentVal = (this._params.filter && this._params.filter['$']);
        var previousVal = (this.prevParamsMemento && this.prevParamsMemento.params.filter && this.prevParamsMemento.params.filter['$']);
        return !ng1.equals(currentVal, previousVal);
    };
    NgTableParams.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (this._settings.debugMode && NgTableParams.$log.debug) {
            (_a = NgTableParams.$log).debug.apply(_a, args);
        }
        var _a;
    };
    NgTableParams.prototype.parseGroup = function (group) {
        var defaultSort = this._settings.groupOptions && this._settings.groupOptions.defaultSort;
        if (!group) {
            return group;
        }
        else if (isGroupingFun(group)) {
            if (group.sortDirection == null) {
                group.sortDirection = defaultSort;
            }
            return group;
        }
        else if (typeof group === 'object') {
            for (var key in group) {
                if (group[key] == null) {
                    group[key] = defaultSort;
                }
            }
            return group;
        }
        else {
            return (_a = {},
                _a[group] = defaultSort,
                _a
            );
        }
        var _a;
    };
    NgTableParams.prototype.runInterceptorPipeline = function (fetchedData) {
        var _this = this;
        var interceptors = this._settings.interceptors || [];
        return interceptors.reduce(function (result, interceptor) {
            var thenFn = (interceptor.response && interceptor.response.bind(interceptor)) || NgTableParams.$q.when;
            var rejectFn = (interceptor.responseError && interceptor.responseError.bind(interceptor)) || NgTableParams.$q.reject;
            return result.then(function (data) {
                return thenFn(data, _this);
            }, function (reason) {
                return rejectFn(reason, _this);
            });
        }, fetchedData);
    };
    NgTableParams.init = function ($q, $log, ngTableDefaults, ngTableEventsChannel, ngTableSettings) {
        NgTableParams.$q = $q;
        NgTableParams.$log = $log;
        NgTableParams.ngTableDefaults = ngTableDefaults;
        NgTableParams.ngTableEventsChannel = ngTableEventsChannel;
        NgTableParams.ngTableSettings = ngTableSettings;
    };
    return NgTableParams;
}());
NgTableParams.init.$inject = ['$q', '$log', 'ngTableDefaults', 'ngTableEventsChannel', 'ngTableSettings'];
//# sourceMappingURL=ngTableParams.js.map