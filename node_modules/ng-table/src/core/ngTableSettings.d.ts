import { IDefaults } from './ngTableDefaults';
import { IDataSettings, IDefaultGetData, IGetDataFunc, IInterceptor, IInterceptableGetDataFunc } from './data';
import { IFilterSettings } from './filtering';
import { IGetGroupFunc, IGroupSettings } from './grouping';
import { SortDirection } from './sorting';
/**
 * Configuration settings for {@link NgTableParams}
 */
export interface ISettings<T> {
    /**
     * Returns true whenever a call to `getData` is in progress
     */
    $loading?: boolean;
    /**
     * An array that contains all the data rows that table should manage.
     * The `gateData` function will be used to manage the data rows
     * that ultimately will be displayed.
     */
    dataset?: T[];
    dataOptions?: IDataSettings;
    debugMode?: boolean;
    /**
     * The total number of data rows before paging has been applied.
     * Typically you will not need to supply this yourself
     */
    total?: number;
    /**
     * The default sort direction that will be used whenever a sorting is supplied that
     * does not define its own sort direction
     */
    defaultSort?: SortDirection;
    filterOptions?: IFilterSettings<T>;
    groupOptions?: IGroupSettings;
    /**
     * The page size buttons that should be displayed. Each value defined in the array
     * determines the possible values that can be supplied to {@link NgTableParams} `page`
     */
    counts?: number[];
    /**
     * The collection of interceptors that should apply to the results of a call to
     * the `getData` function before the data rows are displayed in the table
     */
    interceptors?: IInterceptor<T>[];
    /**
     * Configuration for the template that will display the page size buttons
     */
    paginationMaxBlocks?: number;
    /**
     * Configuration for the template that will display the page size buttons
     */
    paginationMinBlocks?: number;
    /**
     * The html tag that will be used to display the sorting indicator in the table header
     */
    sortingIndicator?: string;
    /**
     * The function that will be used fetch data rows. Leave undefined to let the {@link IDefaultGetData}
     * service provide a default implementation that will work with the `dataset` array you supply.
     *
     * Typically you will supply a custom function when you need to execute filtering, paging and sorting
     * on the server
     */
    getData?: IGetDataFunc<T> | IInterceptableGetDataFunc<T>;
    /**
     * The function that will be used group data rows according to the groupings returned by {@link NgTableParams} `group`
    */
    getGroups?: IGetGroupFunc<T>;
}
/**
 * @private
 */
export declare class NgTableSettings {
    private ngTableDefaults;
    private ngTableDefaultGetData;
    private ngTableDefaultGetGroups;
    static $inject: string[];
    private defaults;
    constructor(ngTableDefaults: IDefaults, ngTableDefaultGetData: IDefaultGetData<any>, ngTableDefaultGetGroups: IGetGroupFunc<any>);
    createDefaults<T>(): ISettings<T>;
    merge<T>(existing: ISettings<T>, newSettings: ISettings<T>): ISettings<T>;
    private optimizeFilterDelay<T>(settings);
}
