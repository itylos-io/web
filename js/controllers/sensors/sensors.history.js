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
    $scope.$watch('socketEvent', function () {
        if ($scope.socketEvent) {
            if ($scope.socketEvent.eventType == "newSensorEvent") {
                var message = $scope.socketEvent.message
                message.status = setupSensorEventTimelineMessage(message);
                $scope.sensorEvents.push(message);
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
    }).success(function (data, status, headers, config) {
        $scope.sensorEvents = data.response.sensorsStatus;
        for (var i = 0; i < $scope.sensorEvents.length; i++) {
            $scope.sensorEvents[i].status = setupSensorEventTimelineMessage($scope.sensorEvents[i]);
        }
    });


    // Based on sensor event setup the appropriate timeline message. hardcoded values here :(
    function setupSensorEventTimelineMessage(receivedEvent) {
        var message = "";
        if (receivedEvent.status == 1 && (receivedEvent.sensorTypeId == 1 || receivedEvent.sensorTypeId == 2)) { // door sensor and OPEN
            message = "open";
        } else if (receivedEvent.status == 0 && (receivedEvent.sensorTypeId == 1 || receivedEvent.sensorTypeId == 2)) { // door sensor and CLOSED
            message = "closed";
        } else if (receivedEvent.status == 1 && (receivedEvent.sensorTypeId == 3 || receivedEvent.sensorTypeId == 4)) { // door sensor and OPEN
            message = "motion detected";
        } else if (receivedEvent.status == 0 && (receivedEvent.sensorTypeId == 3 || receivedEvent.sensorTypeId == 4)) { // door sensor and CLOSED
            message = "motion stopped";
        }
        return message;
    }


}]);
