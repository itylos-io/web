/**
 * Created by psmaster on 15/3/2015.
 */
'use strict';

/* Controllers */
app.controller('SensorsHstrCtrl', ['$scope', '$http', '$state', '$localStorage', '$location', '$timeout', '$modal', '$log', function ($scope, $http, $state, $localStorage, $location, $timeout, $modal, $log) {

    //get the token from local storage
    var token = $localStorage.authed.token;
    $scope.sensorEvents = [];

    //Update Sensors History from WebSockets
    $scope.$watch('socketEvent', function() {
        if($scope.socketEvent) {
            if ($scope.socketEvent.eventType == "newSensorEvent") {
                $scope.sensorEvents.push($scope.socketEvent.message);
            }
        }
    });
    //Get sensors events
    $http({
        method: 'GET',
        url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensorEvents + '?token=' + token + "&limit=100&offset=0",
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .success(function (data, status, headers, config) {
            $scope.sensorEvents = data.response.sensorsStatus;
        });
}]);
