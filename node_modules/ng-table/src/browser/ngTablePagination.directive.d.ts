/// <reference types="angular" />
/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
import * as ng1 from 'angular';
import { NgTableEventsChannel } from '../core';
/**
 * Directive that renders the table pagination controls
 * @ngdoc directive
 */
export declare function ngTablePagination<T>($compile: ng1.ICompileService, $document: ng1.IDocumentService, ngTableEventsChannel: NgTableEventsChannel): ng1.IDirective;
