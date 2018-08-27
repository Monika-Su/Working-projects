/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import * as ng1 from 'angular';
/**
 * @private
 */
function isScopeLike(object) {
    return object != null && ng1.isFunction(object.$new);
}
/**
 * @private
 * Service to construct a $column definition used by {@link ngTable ngTable} directive
 */
export var NgTableColumn = (function () {
    function NgTableColumn() {
    }
    /**
     * Creates a $column for use within a header template
     *
     * @param column the initial definition for $column to build
     * @param defaultScope the $scope to supply to the $column getter methods when not supplied by caller
     * @param columns a reference to the $columns array to make available on the context supplied to the
     * $column getter methods
     */
    NgTableColumn.prototype.buildColumn = function (column, defaultScope, columns) {
        // note: we're not modifying the original column object. This helps to avoid unintended side affects
        var extendedCol = Object.create(column);
        var defaults = this.createDefaults();
        var _loop_1 = function(prop) {
            if (extendedCol[prop] === undefined) {
                extendedCol[prop] = defaults[prop];
            }
            if (!ng1.isFunction(extendedCol[prop])) {
                // wrap raw field values with "getter" functions
                // - this is to ensure consistency with how ngTable.compile builds columns
                // - note that the original column object is being "proxied"; this is important
                //   as it ensure that any changes to the original object will be returned by the "getter"
                var getterSetter = function getterSetter() {
                    if (arguments.length === 1 && !isScopeLike(arguments[0])) {
                        getterSetter.assign(null, arguments[0]);
                    }
                    else {
                        return column[prop];
                    }
                };
                getterSetter.assign = function ($scope, value) {
                    column[prop] = value;
                };
                extendedCol[prop] = getterSetter;
            }
            // satisfy the arguments expected by the function returned by parsedAttribute in the ngTable directive
            var getterFn = extendedCol[prop];
            extendedCol[prop] = function () {
                if (arguments.length === 1 && !isScopeLike(arguments[0])) {
                    getterFn.assign(defaultScope, arguments[0]);
                }
                else {
                    var scope = arguments[0] || defaultScope;
                    var context = Object.create(scope);
                    ng1.extend(context, {
                        $column: extendedCol,
                        $columns: columns
                    });
                    return getterFn.call(column, context);
                }
            };
            if (getterFn.assign) {
                extendedCol[prop].assign = getterFn.assign;
            }
            else {
                var wrappedGetterFn_1 = extendedCol[prop];
                var localValue_1;
                var getterSetter = function getterSetter() {
                    if (arguments.length === 1 && !isScopeLike(arguments[0])) {
                        getterSetter.assign(null, arguments[0]);
                    }
                    else {
                        return localValue_1 != undefined ? localValue_1 : wrappedGetterFn_1.apply(extendedCol, arguments);
                    }
                };
                getterSetter.assign = function ($scope, value) {
                    localValue_1 = value;
                };
                extendedCol[prop] = getterSetter;
            }
        };
        for (var prop in defaults) {
            _loop_1(prop);
        }
        return extendedCol;
    };
    NgTableColumn.prototype.createDefaults = function () {
        return {
            'class': this.createGetterSetter(''),
            filter: this.createGetterSetter(false),
            groupable: this.createGetterSetter(false),
            filterData: ng1.noop,
            headerTemplateURL: this.createGetterSetter(false),
            headerTitle: this.createGetterSetter(''),
            sortable: this.createGetterSetter(false),
            show: this.createGetterSetter(true),
            title: this.createGetterSetter(''),
            titleAlt: this.createGetterSetter('')
        };
    };
    NgTableColumn.prototype.createGetterSetter = function (initialValue) {
        var value = initialValue;
        var getterSetter = function getterSetter() {
            if (arguments.length === 1 && !isScopeLike(arguments[0])) {
                getterSetter.assign(null, arguments[0]);
            }
            else {
                return value;
            }
        };
        getterSetter.assign = function ($scope, newValue) {
            value = newValue;
        };
        return getterSetter;
    };
    NgTableColumn.$inject = [];
    return NgTableColumn;
}());
//# sourceMappingURL=ngTableColumn.js.map