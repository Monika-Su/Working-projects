/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
/**
 * Controller for the {@link ngTableGroupRow ngTableGroupRow} directive
 */
export var NgTableGroupRowController = (function () {
    function NgTableGroupRowController($scope) {
        var _this = this;
        this.$scope = $scope;
        this.groupFns = [];
        $scope.$watch('params.group()', function (newGrouping) {
            _this.setGroup(newGrouping);
        }, true);
    }
    NgTableGroupRowController.prototype.getGroupables = function () {
        var _this = this;
        var groupableCols = this.$scope.$columns.filter(function ($column) { return !!$column.groupable(_this.$scope); });
        return this.groupFns.concat(groupableCols);
    };
    NgTableGroupRowController.prototype.getGroupTitle = function (group) {
        return this.isGroupingFunc(group) ? group.title : group.title(this.$scope);
    };
    NgTableGroupRowController.prototype.getVisibleColumns = function () {
        var _this = this;
        return this.$scope.$columns.filter(function ($column) { return $column.show(_this.$scope); });
    };
    NgTableGroupRowController.prototype.groupBy = function (group) {
        if (this.isSelectedGroup(group)) {
            this.changeSortDirection();
        }
        else {
            if (this.isGroupingFunc(group)) {
                this.$scope.params.group(group);
            }
            else {
                // it's OK, we know that groupable will return a string
                // this is guaranteed by getGroupables returning only
                // columns that return (truthy) strings
                this.$scope.params.group(group.groupable(this.$scope));
            }
        }
    };
    NgTableGroupRowController.prototype.isSelectedGroup = function (group) {
        if (this.isGroupingFunc(group)) {
            return group === this.$scope.$selGroup;
        }
        else {
            return group.groupable(this.$scope) === this.$scope.$selGroup;
        }
    };
    NgTableGroupRowController.prototype.toggleDetail = function () {
        this.$scope.params.settings().groupOptions.isExpanded = !this.$scope.params.settings().groupOptions.isExpanded;
        return this.$scope.params.reload();
    };
    NgTableGroupRowController.prototype.changeSortDirection = function () {
        var newDirection;
        if (this.$scope.params.hasGroup(this.$scope.$selGroup, 'asc')) {
            newDirection = 'desc';
        }
        else if (this.$scope.params.hasGroup(this.$scope.$selGroup, 'desc')) {
            newDirection = '';
        }
        else {
            newDirection = 'asc';
        }
        this.$scope.params.group(this.$scope.$selGroup, newDirection);
    };
    NgTableGroupRowController.prototype.findGroupColumn = function (groupKey) {
        var _this = this;
        return this.$scope.$columns.filter(function ($column) { return $column.groupable(_this.$scope) === groupKey; })[0];
    };
    NgTableGroupRowController.prototype.isGroupingFunc = function (val) {
        return typeof val === 'function';
    };
    NgTableGroupRowController.prototype.setGroup = function (grouping) {
        var existingGroupCol = this.findGroupColumn(this.$scope.$selGroup);
        if (existingGroupCol && existingGroupCol.show.assign) {
            existingGroupCol.show.assign(this.$scope, true);
        }
        if (this.isGroupingFunc(grouping)) {
            this.groupFns = [grouping];
            this.$scope.$selGroup = grouping;
            this.$scope.$selGroupTitle = grouping.title;
        }
        else {
            // note: currently only one group is implemented
            var groupKey = Object.keys(grouping || {})[0];
            var groupedColumn = this.findGroupColumn(groupKey);
            if (groupedColumn) {
                this.$scope.$selGroupTitle = groupedColumn.title(this.$scope);
                this.$scope.$selGroup = groupKey;
                if (groupedColumn.show.assign) {
                    groupedColumn.show.assign(this.$scope, false);
                }
            }
        }
    };
    NgTableGroupRowController.$inject = ['$scope'];
    return NgTableGroupRowController;
}());
//# sourceMappingURL=ngTableGroupRowController.js.map