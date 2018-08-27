/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import * as ng1 from 'angular';
export var NgTableEventsChannel = (function () {
    function NgTableEventsChannel($rootScope) {
        this.$rootScope = $rootScope;
        var events = this;
        events = this.addTableParamsEvent('afterCreated', events);
        events = this.addTableParamsEvent('afterReloadData', events);
        events = this.addTableParamsEvent('datasetChanged', events);
        events = this.addTableParamsEvent('pagesChanged', events);
        events = this.addTableParamsEvent('afterDataFiltered', events);
        events = this.addTableParamsEvent('afterDataSorted', events);
    }
    NgTableEventsChannel.prototype.addTableParamsEvent = function (eventName, target) {
        var fnName = eventName.charAt(0).toUpperCase() + eventName.substring(1);
        var event = (_a = {},
            _a['on' + fnName] = this.createEventSubscriptionFn(eventName),
            _a['publish' + fnName] = this.createPublishEventFn(eventName),
            _a
        );
        return ng1.extend(target, event);
        var _a;
    };
    NgTableEventsChannel.prototype.createPublishEventFn = function (eventName) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            (_a = _this.$rootScope).$broadcast.apply(_a, ['ngTable:' + eventName].concat(args));
            var _a;
        };
    };
    NgTableEventsChannel.prototype.createEventSubscriptionFn = function (eventName) {
        var _this = this;
        return function (handler, eventSelectorOrScope, eventSelector) {
            var actualEvtSelector;
            var scope = _this.$rootScope;
            if (isScopeLike(eventSelectorOrScope)) {
                scope = eventSelectorOrScope;
                actualEvtSelector = createEventSelectorFn(eventSelector);
            }
            else {
                actualEvtSelector = createEventSelectorFn(eventSelectorOrScope);
            }
            return scope.$on('ngTable:' + eventName, function (event, params) {
                var eventArgs = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    eventArgs[_i - 2] = arguments[_i];
                }
                // don't send events published by the internal NgTableParams created by ngTableController
                if (params.isNullInstance)
                    return;
                var fnArgs = [params].concat(eventArgs);
                if (actualEvtSelector.apply(this, fnArgs)) {
                    handler.apply(this, fnArgs);
                }
            });
        };
        function createEventSelectorFn(eventSelector) {
            if (!eventSelector) {
                return function (publisher) { return true; };
            }
            else if (isEventSelectorFunc(eventSelector)) {
                return eventSelector;
            }
            else {
                // shorthand for subscriber to only receive events from a specific publisher instance
                return function (publisher) { return publisher === eventSelector; };
            }
        }
        function isEventSelectorFunc(val) {
            return typeof val === 'function';
        }
        function isScopeLike(val) {
            return val && typeof val.$new === 'function';
        }
    };
    NgTableEventsChannel.$inject = ['$rootScope'];
    return NgTableEventsChannel;
}());
//# sourceMappingURL=ngTableEventsChannel.js.map