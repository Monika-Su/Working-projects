/// <reference types="angular" />
import { IFilterOrderBy, IFilterService, IServiceProvider } from 'angular';
import { IFilterFunc } from '../filtering';
import { NgTableParams } from '../ngTableParams';
import { NgTableEventsChannel } from '../ngTableEventsChannel';
/**
 * A default implementation of the getData function that will apply the `filter`, `orderBy` and
 * paging values from the {@link NgTableParams} instance supplied to the data array supplied.
 *
 * A call to this function will:
 * - return the resulting array
 * - assign the total item count after filtering to the `total` of the `NgTableParams` instance supplied
 */
export interface IDefaultGetData<T> {
    (data: T[], params: NgTableParams<T>): T[];
    /**
     * Convenience function that this service will use to apply paging to the data rows.
     *
     * Returns a slice of rows from the `data` array supplied and sets the `NgTableParams.total()`
     * on the `params` instance supplied to `data.length`
     */
    applyPaging(data: T[], params: NgTableParams<any>): T[];
    /**
     * Returns a reference to the function that this service will use to filter data rows
     */
    getFilterFn(params: NgTableParams<T>): IFilterFunc<T>;
    /**
     * Returns a reference to the function that this service will use to sort data rows
     */
    getOrderByFn(params?: NgTableParams<T>): IFilterOrderBy;
}
/**
 * Implementation of the {@link IDefaultGetDataProvider} interface
 */
export declare class NgTableDefaultGetDataProvider implements IServiceProvider {
    /**
     * The name of a angular filter that knows how to apply the values returned by
     * `NgTableParams.filter()` to restrict an array of data.
     * (defaults to the angular `filter` filter service)
     */
    filterFilterName: string;
    /**
     * The name of a angular filter that knows how to apply the values returned by
    * `NgTableParams.orderBy()` to sort an array of data.
    * (defaults to the angular `orderBy` filter service)
    */
    sortingFilterName: string;
    $get: ($filter: IFilterService, ngTableEventsChannel: NgTableEventsChannel) => IDefaultGetData<any>;
    constructor();
}
