/// <reference types="angular" />
/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import { IScope } from 'angular';
import { IFilterTemplateDef, IFilterTemplateDefMap } from './public-interfaces';
import { NgTableFilterConfig } from './ngTableFilterConfig';
/**
 * @private
 */
export interface IScopeExtensions {
    getFilterPlaceholderValue(filterDef: string | IFilterTemplateDef, filterKey?: string): string;
}
/**
 * Controller for the {@link ngTableFilterRow ngTableFilterRow} directive
 */
export declare class NgTableFilterRowController {
    static $inject: string[];
    config: NgTableFilterConfig;
    constructor($scope: IScope & IScopeExtensions, ngTableFilterConfig: NgTableFilterConfig);
    getFilterCellCss(filter: IFilterTemplateDefMap, layout: string): string;
    getFilterPlaceholderValue(filterDef: string | IFilterTemplateDef, filterKey?: string): string;
}
