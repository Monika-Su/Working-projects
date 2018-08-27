import * as ng1 from 'angular';
import { convertSortToOrderBy, isGroupingFun } from '../util';
ngTableDefaultGetGroups.$inject = ['$q', 'ngTableDefaultGetData'];
/**
 * Implementation of the {@link IDefaultGetData IDefaultGetData} interface
 *
 * @ngdoc service
 */
export function ngTableDefaultGetGroups($q, ngTableDefaultGetData) {
    return getGroups;
    function getGroups(params) {
        var group = params.group();
        var groupFn;
        var sortDirection = undefined;
        if (isGroupingFun(group)) {
            groupFn = group;
            sortDirection = group.sortDirection;
        }
        else {
            // currently support for only one group implemented
            var groupField_1 = Object.keys(group)[0];
            sortDirection = group[groupField_1];
            groupFn = function (item) {
                return getPath(item, groupField_1);
            };
        }
        var settings = params.settings();
        var originalDataOptions = settings.dataOptions;
        settings.dataOptions = { applyPaging: false };
        var getData = settings.getData;
        var gotData = $q.when(getData(params));
        return gotData.then(function (data) {
            var groups = {};
            ng1.forEach(data, function (item) {
                var groupName = groupFn(item);
                groups[groupName] = groups[groupName] || {
                    data: [],
                    $hideRows: !settings.groupOptions.isExpanded,
                    value: groupName
                };
                groups[groupName].data.push(item);
            });
            var result = [];
            for (var i in groups) {
                result.push(groups[i]);
            }
            if (sortDirection) {
                var orderByFn = ngTableDefaultGetData.getOrderByFn();
                var orderBy = convertSortToOrderBy({
                    value: sortDirection
                });
                result = orderByFn(result, orderBy);
            }
            return ngTableDefaultGetData.applyPaging(result, params);
        }).finally(function () {
            // restore the real options
            settings.dataOptions = originalDataOptions;
        });
    }
}
/**
 * @private
 */
function getPath(obj, ks) {
    // origianl source https://github.com/documentcloud/underscore-contrib
    var keys;
    if (typeof ks === "string") {
        keys = ks.split(".");
    }
    else {
        keys = ks;
    }
    // If we have reached an undefined property
    // then stop executing and return undefined
    if (obj === undefined)
        return void 0;
    // If the path array has no more elements, we've reached
    // the intended property and return its value
    if (keys.length === 0)
        return obj;
    // If we still have elements in the path array and the current
    // value is null, stop executing and return undefined
    if (obj === null)
        return void 0;
    return getPath(obj[keys[0]], keys.slice(1));
}
//# sourceMappingURL=ngTableDefaultGetGroups.js.map