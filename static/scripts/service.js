

let api = angular.module('api', []);

api.factory('socket', function($rootScope) {
    let socket = io();
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                let args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                let args = arguments;
                $rootScope.$apply(function() {
                    if(callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});

api.service('store', util.getParam(function ($http) {}));