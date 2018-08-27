/// <reference types="angular" />
import * as angular from 'angular';
import { NgTableController } from './ngTableController';
import { NgTableFilterConfigProvider, NgTableFilterConfig } from './ngTableFilterConfig';
import './filters/number.html';
import './filters/select.html';
import './filters/select-multiple.html';
import './filters/text.html';
import './pager.html';
import './header.html';
declare const ngTableBrowserModule: angular.IModule;
export * from './public-interfaces';
export { NgTableController, NgTableFilterConfigProvider, NgTableFilterConfig, ngTableBrowserModule };
