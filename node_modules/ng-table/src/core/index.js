import * as angular from 'angular';
import { NgTableDefaultGetDataProvider } from './data';
import { ngTableDefaultGetGroups } from './grouping';
import { ngTableDefaults } from './ngTableDefaults';
import { NgTableSettings } from './ngTableSettings';
import { NgTableParams } from './ngTableParams';
import { NgTableEventsChannel } from './ngTableEventsChannel';
var ngTableCoreModule = angular.module('ngTable-core', [])
    .provider('ngTableDefaultGetData', NgTableDefaultGetDataProvider)
    .factory('ngTableDefaultGetGroups', ngTableDefaultGetGroups)
    .value('ngTableDefaults', ngTableDefaults)
    .service('ngTableEventsChannel', NgTableEventsChannel)
    .service('ngTableSettings', NgTableSettings)
    .run(NgTableParams.init);
// note: if you are using ES6 or typescript prefer:
// import { NgTableParams } from 'ng-table';
ngTableCoreModule.value('NgTableParams', NgTableParams);
export { ngTableCoreModule };
export * from './ngTableEventsChannel';
export * from './ngTableParams';
export * from './data';
export * from './filtering';
export * from './grouping/publicExports';
export * from './paging';
export * from './sorting';
//# sourceMappingURL=index.js.map