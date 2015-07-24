'use strict';

/* Controllers */
app.controller('SensorsStatusCtrl', ['$scope', '$http', '$state', '$localStorage', '$location', '$timeout', '$modal', '$log', function ($scope, $http, $state, $localStorage, $location, $timeout, $modal, $log) {

    //get the token from local storage
    var token = $localStorage.authed.token;
    $scope.sensorsStatus = [];

    // get sensors status
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.sensorsStatus + '?token=' + token)
        .success(function (data) {
            $scope.sensorsStatus = data.response.sensorsStatus;
            for (var i = 0; i < data.response.sensorsStatus.length; i++) {
                $scope.sensorsStatus[i].status = setupSensorEventTimelineMessage(data.response.sensorsStatus[i]);
            }
        });


    // Based on sensor event setup the appropriate message. hardcoded values here :(
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
