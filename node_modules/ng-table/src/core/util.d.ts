import { Grouping, IGroupingFunc } from './grouping';
import { ISortingValues } from './sorting';
/**
 * @private
 */
export declare function convertSortToOrderBy(sorting: ISortingValues): string[];
/**
 * @private
 */
export declare function isGroupingFun(val: string | Grouping<any>): val is IGroupingFunc<any>;
