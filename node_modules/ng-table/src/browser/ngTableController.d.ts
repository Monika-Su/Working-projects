/// <reference types="angular" />
/// <reference types="angular-mocks" />
/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import { IAttributes, IAugmentedJQuery, ICompileService, IDocumentService, IParseService, IScope, ITimeoutService } from 'angular';
import { DataResults, GroupedDataResults, NgTableParams, NgTableEventsChannel, IPageButton } from '../core';
import { IColumnDef, IDynamicTableColDef, ITableInputAttributes } from './public-interfaces';
import { NgTableColumn } from './ngTableColumn';
/**
 * @private
 */
export interface ITableScope<T> extends IScope {
    $columns: IColumnDef[];
    $loading: boolean;
    $filterRow: {
        disabled: boolean;
    };
    $data?: DataResults<T>;
    $groups?: GroupedDataResults<T>;
    $groupRow: {
        show: boolean;
    };
    show_filter: boolean;
    pages: IPageButton[];
    templates: {
        header: string;
        pagination: string;
    };
    params: NgTableParams<T>;
}
/**
 * The controller for the {@link ngTable ngTable} and {@link ngTableDynamic ngTableDynamic} directives
 */
export declare class NgTableController<TParams, TCol extends IColumnDef | IDynamicTableColDef> {
    private $scope;
    private $parse;
    private $compile;
    private $attrs;
    private $element;
    private $document;
    private ngTableColumn;
    private ngTableEventsChannel;
    static $inject: string[];
    private delayFilter;
    private readonly hasVisibleFilterColumn;
    constructor($scope: ITableScope<TParams>, $timeout: ITimeoutService, $parse: IParseService, $compile: ICompileService, $attrs: IAttributes & ITableInputAttributes, $element: IAugmentedJQuery, $document: IDocumentService, ngTableColumn: NgTableColumn<TCol>, ngTableEventsChannel: NgTableEventsChannel);
    private onDataReloadStatusChange(newStatus);
    compileDirectiveTemplates(): void;
    loadFilterData($columns: IColumnDef[]): void;
    buildColumns(columns: TCol[]): IColumnDef[];
    parseNgTableDynamicExpr(attr: string): {
        tableParams: string;
        columns: string;
    };
    setupBindingsToInternalScope(tableParamsExpr: string): void;
    private setupFilterRowBindingsToInternalScope();
    private setupGroupRowBindingsToInternalScope();
    private getVisibleColumns();
    private subscribeToTableEvents();
    private some<T>(array, predicate);
}
