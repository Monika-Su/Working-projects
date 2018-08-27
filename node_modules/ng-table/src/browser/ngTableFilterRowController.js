/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
/**
 * Controller for the {@link ngTableFilterRow ngTableFilterRow} directive
 */
export var NgTableFilterRowController = (function () {
    function NgTableFilterRowController($scope, ngTableFilterConfig) {
        this.config = ngTableFilterConfig;
        // todo: stop doing this. Why?
        // * scope inheritance makes it hard to know how supplies functions
        // * scope is not a concept in angular 2
        // make function available to filter templates
        $scope.getFilterPlaceholderValue = this.getFilterPlaceholderValue.bind(this);
    }
    NgTableFilterRowController.prototype.getFilterCellCss = function (filter, layout) {
        if (layout !== 'horizontal') {
            return 's12';
        }
        var size = Object.keys(filter).length;
        var width = parseInt((12 / size).toString(), 10);
        return 's' + width;
    };
    NgTableFilterRowController.prototype.getFilterPlaceholderValue = function (filterDef, filterKey) {
        if (typeof filterDef === 'string') {
            return '';
        }
        else {
            return filterDef.placeholder;
        }
    };
    NgTableFilterRowController.$inject = ['$scope', 'ngTableFilterConfig'];
    return NgTableFilterRowController;
}());
//# sourceMappingURL=ngTableFilterRowController.js.map