/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import * as ng1 from 'angular';
import { NgTableParams } from '../core';
/**
 * The controller for the {@link ngTable ngTable} and {@link ngTableDynamic ngTableDynamic} directives
 */
export var NgTableController = (function () {
    function NgTableController($scope, $timeout, $parse, $compile, $attrs, $element, $document, ngTableColumn, ngTableEventsChannel) {
        this.$scope = $scope;
        this.$parse = $parse;
        this.$compile = $compile;
        this.$attrs = $attrs;
        this.$element = $element;
        this.$document = $document;
        this.ngTableColumn = ngTableColumn;
        this.ngTableEventsChannel = ngTableEventsChannel;
        var isFirstTimeLoad = true;
        $scope.$filterRow = { disabled: false };
        $scope.$loading = false;
        // until such times as the directive uses an isolated scope, we need to ensure that the check for
        // the params field only consults the "own properties" of the $scope. This is to avoid seeing the params
        // field on a $scope higher up in the prototype chain
        if (!$scope.hasOwnProperty("params")) {
            $scope.params = new NgTableParams(true);
        }
        this.delayFilter = (function () {
            var timer;
            return function (callback, ms) {
                $timeout.cancel(timer);
                timer = $timeout(callback, ms);
            };
        })();
        // watch for when a new NgTableParams is bound to the scope
        // CRITICAL: the watch must be for reference and NOT value equality; this is because NgTableParams maintains
        // the current data page as a field. Checking this for value equality would be terrible for performance
        // and potentially cause an error if the items in that array has circular references
        this.$scope.$watch('params', function (newParams, oldParams) {
            if (newParams === oldParams || !newParams) {
                return;
            }
            newParams.reload();
        }, false);
        this.subscribeToTableEvents();
    }
    Object.defineProperty(NgTableController.prototype, "hasVisibleFilterColumn", {
        get: function () {
            var _this = this;
            if (!this.$scope.$columns)
                return false;
            return this.some(this.$scope.$columns, function ($column) {
                return $column.show(_this.$scope) && !!$column.filter(_this.$scope);
            });
        },
        enumerable: true,
        configurable: true
    });
    NgTableController.prototype.onDataReloadStatusChange = function (newStatus /*, oldStatus*/) {
        if (!newStatus || this.$scope.params.hasErrorState()) {
            return;
        }
        var currentParams = this.$scope.params;
        var filterOptions = currentParams.settings().filterOptions;
        if (currentParams.hasFilterChanges()) {
            var applyFilter = function () {
                currentParams.page(1);
                currentParams.reload();
            };
            if (filterOptions.filterDelay) {
                this.delayFilter(applyFilter, filterOptions.filterDelay);
            }
            else {
                applyFilter();
            }
        }
        else {
            currentParams.reload();
        }
    };
    NgTableController.prototype.compileDirectiveTemplates = function () {
        if (!this.$element.hasClass('ng-table')) {
            this.$scope.templates = {
                header: (this.$attrs.templateHeader ? this.$attrs.templateHeader : 'ng-table/header.html'),
                pagination: (this.$attrs.templatePagination ? this.$attrs.templatePagination : 'ng-table/pager.html')
            };
            this.$element.addClass('ng-table');
            var headerTemplate = null;
            // $element.find('> thead').length === 0 doesn't work on jqlite
            var theadFound_1 = false;
            ng1.forEach(this.$element.children(), function (e) {
                if (e.tagName === 'THEAD') {
                    theadFound_1 = true;
                }
            });
            if (!theadFound_1) {
                headerTemplate = ng1.element('<thead ng-include="templates.header"></thead>', this.$document);
                this.$element.prepend(headerTemplate);
            }
            var paginationTemplate = ng1.element('<div ng-table-pagination="params" template-url="templates.pagination"></div>', this.$document);
            this.$element.after(paginationTemplate);
            if (headerTemplate) {
                this.$compile(headerTemplate)(this.$scope);
            }
            this.$compile(paginationTemplate)(this.$scope);
        }
    };
    NgTableController.prototype.loadFilterData = function ($columns) {
        var _this = this;
        ng1.forEach($columns, function ($column) {
            var result = $column.filterData(_this.$scope);
            if (!result) {
                delete $column.filterData;
                return undefined;
            }
            if (isPromiseLike(result)) {
                delete $column.filterData;
                return result.then(function (data) {
                    // our deferred can eventually return arrays, functions and objects
                    if (!ng1.isArray(data) && !ng1.isFunction(data) && !ng1.isObject(data)) {
                        // if none of the above was found - we just want an empty array
                        data = [];
                    }
                    $column.data = data;
                });
            }
            else {
                return $column.data = result;
            }
        });
        function isPromiseLike(val) {
            return val && typeof val === 'object' && typeof val.then === 'function';
        }
    };
    NgTableController.prototype.buildColumns = function (columns) {
        var _this = this;
        // todo: use strictNullChecks and remove guard clause
        var result = [];
        (columns || []).forEach(function (col) {
            result.push(_this.ngTableColumn.buildColumn(col, _this.$scope, result));
        });
        return result;
    };
    NgTableController.prototype.parseNgTableDynamicExpr = function (attr) {
        if (!attr || attr.indexOf(" with ") > -1) {
            var parts = attr.split(/\s+with\s+/);
            return {
                tableParams: parts[0],
                columns: parts[1]
            };
        }
        else {
            throw new Error('Parse error (expected example: ng-table-dynamic=\'tableParams with cols\')');
        }
    };
    NgTableController.prototype.setupBindingsToInternalScope = function (tableParamsExpr) {
        // note: this we're setting up watches to simulate angular's isolated scope bindings
        var _this = this;
        // note: is REALLY important to watch for a change to the ngTableParams *reference* rather than
        // $watch for value equivalence. This is because ngTableParams references the current page of data as
        // a field and it's important not to watch this
        this.$scope.$watch(tableParamsExpr, function (params) {
            if (params === undefined) {
                return;
            }
            _this.$scope.params = params;
        }, false);
        this.setupFilterRowBindingsToInternalScope();
        this.setupGroupRowBindingsToInternalScope();
    };
    NgTableController.prototype.setupFilterRowBindingsToInternalScope = function () {
        var _this = this;
        if (this.$attrs.showFilter) {
            this.$scope.$parent.$watch(this.$attrs.showFilter, function (value) {
                _this.$scope.show_filter = value;
            });
        }
        else {
            this.$scope.$watch(function () { return _this.hasVisibleFilterColumn; }, function (value) {
                _this.$scope.show_filter = value;
            });
        }
        if (this.$attrs.disableFilter) {
            this.$scope.$parent.$watch(this.$attrs.disableFilter, function (value) {
                _this.$scope.$filterRow.disabled = value;
            });
        }
    };
    NgTableController.prototype.setupGroupRowBindingsToInternalScope = function () {
        var _this = this;
        this.$scope.$groupRow = { show: false };
        if (this.$attrs.showGroup) {
            var showGroupGetter_1 = this.$parse(this.$attrs.showGroup);
            this.$scope.$parent.$watch(showGroupGetter_1, function (value) {
                _this.$scope.$groupRow.show = value;
            });
            if (showGroupGetter_1.assign) {
                // setup two-way databinding thus allowing ngTableGrowRow to assign to the showGroup expression
                this.$scope.$watch('$groupRow.show', function (value) {
                    showGroupGetter_1.assign(_this.$scope.$parent, value);
                });
            }
        }
        else {
            this.$scope.$watch('params.hasGroup()', function (newValue) {
                _this.$scope.$groupRow.show = newValue;
            });
        }
    };
    NgTableController.prototype.getVisibleColumns = function () {
        var _this = this;
        return (this.$scope.$columns || []).filter(function (c) {
            return c.show(_this.$scope);
        });
    };
    NgTableController.prototype.subscribeToTableEvents = function () {
        var _this = this;
        this.$scope.$watch('params.isDataReloadRequired()', function (newStatus /*, oldStatus*/) {
            _this.onDataReloadStatusChange(newStatus);
        });
        this.ngTableEventsChannel.onAfterReloadData(function (params, newDatapage) {
            var visibleColumns = _this.getVisibleColumns();
            if (params.hasGroup()) {
                _this.$scope.$groups = (newDatapage || []);
                _this.$scope.$groups.visibleColumnCount = visibleColumns.length;
            }
            else {
                _this.$scope.$data = (newDatapage || []);
                _this.$scope.$data.visibleColumnCount = visibleColumns.length;
            }
        }, this.$scope, function (publisher) { return _this.$scope.params === publisher; });
        this.ngTableEventsChannel.onPagesChanged(function (params, newPages) {
            _this.$scope.pages = newPages;
        }, this.$scope, function (publisher) { return _this.$scope.params === publisher; });
    };
    NgTableController.prototype.some = function (array, predicate) {
        var found = false;
        for (var i = 0; i < array.length; i++) {
            var obj = array[i];
            if (predicate(obj)) {
                found = true;
                break;
            }
        }
        return found;
    };
    NgTableController.$inject = [
        '$scope', '$timeout', '$parse', '$compile', '$attrs', '$element', '$document', 'ngTableColumn', 'ngTableEventsChannel'
    ];
    return NgTableController;
}());
//# sourceMappingURL=ngTableController.js.map