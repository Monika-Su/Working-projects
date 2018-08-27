/// <reference types="angular" />
/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import * as ng1 from 'angular';
import { IColumnDef, ISelectOption } from './public-interfaces';
/**
 * @private
 */
export interface IInputAttributes extends ng1.IAttributes {
    ngTableSelectFilterDs: string;
}
/**
 * @private
 */
export interface IScopeExtensions {
    $selectData: ISelectOption[];
}
/**
 * Takes the array returned by $column.filterData and makes it available as `$selectData` on the `$scope`.
 *
 * The resulting `$selectData` array will contain an extra item that is suitable to represent the user
 * "deselecting" an item from a `<select>` tag
 *
 * This directive is is focused on providing a datasource to an `ngOptions` directive
 */
declare function ngTableSelectFilterDs(): ng1.IDirective;
/**
 * @private
 */
export declare class NgTableSelectFilterDsController {
    private $scope;
    private $attrs;
    private $q;
    static $inject: string[];
    $column: IColumnDef;
    constructor($scope: ng1.IScope & IScopeExtensions, $parse: ng1.IParseService, $attrs: IInputAttributes, $q: ng1.IQService);
    private bindDataSource();
    private hasEmptyOption(data);
    private getSelectListData($column);
}
export { ngTableSelectFilterDs };
