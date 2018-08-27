/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
ngTableSelectFilterDs.$inject = [];
/**
 * Takes the array returned by $column.filterData and makes it available as `$selectData` on the `$scope`.
 *
 * The resulting `$selectData` array will contain an extra item that is suitable to represent the user
 * "deselecting" an item from a `<select>` tag
 *
 * This directive is is focused on providing a datasource to an `ngOptions` directive
 */
function ngTableSelectFilterDs() {
    // note: not using isolated or child scope "by design"
    // this is to allow this directive to be combined with other directives that do
    var directive = {
        restrict: 'A',
        controller: NgTableSelectFilterDsController
    };
    return directive;
}
/**
 * @private
 */
export var NgTableSelectFilterDsController = (function () {
    function NgTableSelectFilterDsController($scope, $parse, $attrs, $q) {
        var _this = this;
        this.$scope = $scope;
        this.$attrs = $attrs;
        this.$q = $q;
        this.$column = $parse($attrs.ngTableSelectFilterDs)($scope);
        $scope.$watch(function () { return _this.$column && _this.$column.data; }, function () { _this.bindDataSource(); });
    }
    NgTableSelectFilterDsController.prototype.bindDataSource = function () {
        var _this = this;
        this.getSelectListData(this.$column).then(function (data) {
            if (data && !_this.hasEmptyOption(data)) {
                data.unshift({ id: '', title: '' });
            }
            data = data || [];
            _this.$scope.$selectData = data;
        });
    };
    NgTableSelectFilterDsController.prototype.hasEmptyOption = function (data) {
        var isMatch;
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (item && item.id === '') {
                isMatch = true;
                break;
            }
        }
        return isMatch;
    };
    NgTableSelectFilterDsController.prototype.getSelectListData = function ($column) {
        var dataInput = $column.data;
        if (dataInput instanceof Array) {
            return this.$q.when(dataInput);
        }
        else {
            return this.$q.when(dataInput && dataInput());
        }
    };
    NgTableSelectFilterDsController.$inject = ['$scope', '$parse', '$attrs', '$q'];
    return NgTableSelectFilterDsController;
}());
export { ngTableSelectFilterDs };
//# sourceMappingURL=ngTableSelectFilterDs.directive.js.map