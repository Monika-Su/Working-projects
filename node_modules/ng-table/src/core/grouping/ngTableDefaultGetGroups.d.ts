/// <reference types="angular" />
import { IQService } from 'angular';
import { IDataRowGroup, IDefaultGetData } from '../data';
import { IGetGroupFunc } from './';
/**
 * Implementation of the {@link IDefaultGetData IDefaultGetData} interface
 *
 * @ngdoc service
 */
export declare function ngTableDefaultGetGroups<T>($q: IQService, ngTableDefaultGetData: IDefaultGetData<IDataRowGroup<T>>): IGetGroupFunc<T>;
