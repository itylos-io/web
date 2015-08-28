/**
 * Created by psmaster on 17/3/2015.
 */

'use strict';

app.controller('DashboardCtrl', ['$scope', '$localStorage', '$http', 'ModalService', 'ngAudio', function ($scope, $localStorage, $http, ModalService, ngAudio) {

    var TIMEOUT_FOR_RED_INDICATOR = 10000;
    var MAX_TIMELINE_EVENTS = 100;
    var KERBEROS_SENSOR_TYPE_ID = "5";

    var token = $localStorage.authed.token;
    $scope.zones = [];
    $scope.zoneOverview = {};
    $scope.sensorOverview = {};
    $scope.alarmIsActive = false;
    $scope.sensorsStatus = [];
    $scope.weatherConditions = [];
    $scope.eventsInZone = {};  // Use to change indicator next to zone when event happens
    $scope.timelineEvents = []; // (dateReceivedEvent, message, eventType, background)
    $scope.isAdmin = $localStorage.isAdmin;


    // Watch websocket
    $scope.$watch('socketEvent', function (newVal, oldVal) {

        if ($scope.socketEvent && !angular.equals(newVal, oldVal)) {
            var event = [new Date(), "", $scope.socketEvent.eventType, "success"];

            // When alarm status changes
            if ($scope.socketEvent.eventType == "updatedAlarmStatus") {
                var updatedAlarmStatusEvent = {};
                updatedAlarmStatusEvent.type = "updatedAlarmStatus";
                updatedAlarmStatusEvent.date = new Date();
                updatedAlarmStatusEvent.message = $scope.socketEvent.message.user.name + " changed status to " + $scope.socketEvent.message.currentStatus;
                if ($scope.socketEvent.message.currentStatus == "ARMED")   updatedAlarmStatusEvent.background = "success"; else updatedAlarmStatusEvent.background = "danger";
                updatedAlarmStatusEvent.isKerberosEvent = false;
                $scope.timelineEvents.unshift(updatedAlarmStatusEvent);
                if ($scope.socketEvent.message.currentStatus == 'DISARMED') $scope.alarmIsActive = false; else $scope.alarmIsActive = true;

                // When new environmental data is received
            } else if ($scope.socketEvent.eventType == "updatedWeatherConditions") {
                var addedToList = false;
                for (var i = 0; i < $scope.weatherConditions.length; i++) {
                    if ($scope.weatherConditions[i].location == $scope.socketEvent.message.location) {
                        $scope.weatherConditions[i] = $scope.socketEvent.message;
                        addedToList = true;
                    }
                }
                if (!addedToList)$scope.weatherConditions.push($scope.socketEvent.message);

                // When system stats data is received
            } else if ($scope.socketEvent.eventType == "systemStats") {
                $scope.freeDiskPercentage = 100 - $scope.socketEvent.message.freeDiskPercentage;
                $scope.freeMemoryPercentage = 100 - $scope.socketEvent.message.freeMemoryPercentage;
                $scope.cpuUsage = $scope.socketEvent.message.cpuUsage;

                // When new sensor event is received
            } else if ($scope.socketEvent.eventType == "newSensorEvent") {
                playSounds($scope.socketEvent);

                // Setup timeline event
                var timelineEvent = {};
                timelineEvent.type = "newSensorEvent";
                timelineEvent.date = new Date();
                timelineEvent.message = setupSensorEventTimelineMessage($scope.socketEvent.message);
                if ($scope.socketEvent.message.status == 0)  timelineEvent.background = "success"; else timelineEvent.background = "danger";
                // If it's an event from kerberos make images div
                if ($scope.socketEvent.message.sensorTypeId == KERBEROS_SENSOR_TYPE_ID) {
                    $scope.socketEvent.message.kerberosEventImages.reverse();
                    createKerberosImagesDiv(timelineEvent, $scope.socketEvent.message.kerberosEventImages);
                }
                $scope.timelineEvents.unshift(timelineEvent);

                // Update corresponding sensor status
                for (var i = 0; i < $scope.sensorsStatus.length; i++) {
                    if ($scope.sensorsStatus[i].sensorId == $scope.socketEvent.message.sensorId) {
                        $scope.sensorsStatus[i].status = $scope.socketEvent.message.status;
                    }
                }

                // Find in which zone the sensor belongs to
                for (var i = 0; i < $scope.zones.length; i++) {
                    for (var j = 0; j < $scope.zones[i].sensors.length; j++) {
                        // And change status of triggered zone to true
                        if ($scope.zones[i].sensors[j].sensorId == $scope.socketEvent.message.sensorId) {
                            $scope.eventsInZone[$scope.zones[i].oid] = true;
                            // Then after 3s change status to false
                            var changeStatusToGreen = function (triggeredZone) {
                                window.setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.eventsInZone[triggeredZone] = false;
                                    });
                                }, TIMEOUT_FOR_RED_INDICATOR);
                            };
                            changeStatusToGreen($scope.zones[i].oid)
                        }
                    }
                }
            }

            // Ensure timeline events has size < MAX_TIMELINE_EVENTS
            if ($scope.timelineEvents.length > MAX_TIMELINE_EVENTS) {
                $scope.timelineEvents.pop()
            }
        }
    });

    //get app user
    $http({
        method: 'GET',
        url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.myUser + '?token=' + token,
        headers: {
            'Content-Type': 'application/json'
        }
    }).success(function (data, status, headers, config) {
        $scope.appUser = data.response.user;
        $localStorage.isAdmin = data.response.user.isAdmin;
        $scope.isAdmin = $localStorage.isAdmin;
    }).error(function (data, status, headers, config) {
        console.log(status);
    });


    // get 20 latest sensors events
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensorEvents + '?limit=20&token=' + token)
        .success(function (data) {
            for (var i = 0; i < data.response.sensorsStatus.length; i++) {
                var timelineEvent = {};
                timelineEvent.type = "newSensorEvent";
                timelineEvent.date = new Date(data.response.sensorsStatus[i].dateOfEvent);
                timelineEvent.message = setupSensorEventTimelineMessage(data.response.sensorsStatus[i]);
                if (data.response.sensorsStatus[i].status == 0)   timelineEvent.background = "success"; else timelineEvent.background = "danger";
                // If it's an event from kerberos make images div
                if (data.response.sensorsStatus[i].sensorTypeId == KERBEROS_SENSOR_TYPE_ID) {
                    createKerberosImagesDiv(timelineEvent, data.response.sensorsStatus[i].kerberosEventImages);
                }
                $scope.timelineEvents.push(timelineEvent);
            }
        });

    // get 20 latest alarm status updates
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.alarmHistory + '?limit=20&token=' + token)
        .success(function (data) {
            for (var i = 0; i < data.response.alarmStatuses.length; i++) {
                var timelineEvent = {};
                timelineEvent.type = "updatedAlarmStatus";
                timelineEvent.date = new Date(data.response.alarmStatuses[i].timeOfStatusUpdate);
                timelineEvent.message = data.response.alarmStatuses[i].user.name + " changed status to " + data.response.alarmStatuses[i].status;
                if (data.response.alarmStatuses[i].status == "ARMED")   timelineEvent.background = "success"; else timelineEvent.background = "danger";
                timelineEvent.isKerberosEvent = false;
                $scope.timelineEvents.push(timelineEvent);
            }
        });


    // get sensors status
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.sensorsStatus + '?token=' + token)
        .success(function (data) {
            $scope.sensorsStatus = data.response.sensorsStatus;
        });

    //get zones
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.zones + '?token=' + token)
        .success(function (data) {
            $scope.zones = data.response.zones;
            $scope.zoneOverview.total = $scope.zones.length;
            $scope.zoneOverview.enabled = 0;
            for (var i = 0; i < $scope.zones.length; i++) {
                $scope.eventsInZone[$scope.zones[i].oid] = false;
                if ($scope.zones[i].status === "ENABLED")
                    $scope.zoneOverview.enabled++;
            }
        });

    //get sensors
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensors + '?token=' + token)
        .success(function (data) {
            var sensors = data.response.sensors;
            $scope.sensorOverview.total = sensors.length;
            $scope.sensorOverview.enabled = 0;
            for (var i = 0; i < sensors.length; i++) {
                if (sensors[i].isActive)
                    $scope.sensorOverview.enabled++;
            }
        });

    //get alarm status
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.alarm + '?token=' + token)
        .success(function (data) {
            if (data.response.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
            else $scope.alarmIsActive = true;
        });

    // watch for changes in system's status
    $scope.$watch('socketEvent', function () {
        if ($scope.socketEvent && $scope.socketEvent.eventType == "alarmStatusChanged") {
            if ($scope.socketEvent.message.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
            else $scope.alarmIsActive = true;
        }
    });

    //=========================================//
    //================ Methods ================//
    //=========================================//

    // Timeline popover requires a div which contains all images. So we have to setup it manually... :(
    function createKerberosImagesDiv(timelineEvent, kerberosImages) {
        timelineEvent.kerberosImages = kerberosImages;
        timelineEvent.isKerberosEvent = true;
        timelineEvent.kerberosImagesHtml = '<div id=\"kerberos-slideshow\">';
        timelineEvent.kerberosImagesHtml = timelineEvent.kerberosImagesHtml +
            '<div><img style="width: 300px; height: 200px;" src="' + timelineEvent.kerberosImages[0] + '"></div>';
        for (var z = 0; z < timelineEvent.kerberosImages.length; z++) {
            var imageUrl = timelineEvent.kerberosImages[z];
            timelineEvent.kerberosImagesHtml = timelineEvent.kerberosImagesHtml +
                '<div><img style="width: 300px; height: 200px;" src="' + imageUrl + '"></div>';
        }
        timelineEvent.kerberosImagesHtml = timelineEvent.kerberosImagesHtml + '</div>';
    }

    // Show keyboard
    $scope.launchDisarmKeyboard = function () {
        ModalService.showModal({
            templateUrl: "tpl/dashboard/disarm_system_dialog.html",
            controller: "ComplexController"
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
                $scope.complexResult = "Name: " + result.name + ", age: " + result.age;
            });
        });
    };

    // Change alarm status
    $scope.armSystem = function () {
        var data = {
            status: "ARMED"
        };

        $http({
            method: 'PUT',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.alarm + '?token=' + token,
            data: JSON.stringify(data),
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    };

    // Based on sensor event setup the appropriate timeline message. hardcoded values here :(
    function setupSensorEventTimelineMessage(receivedEvent) {
        var message = "";
        if (receivedEvent.status == 1 && (receivedEvent.sensorTypeId == 1 || receivedEvent.sensorTypeId == 2)) { // door sensor and OPEN
            message = receivedEvent.sensorName + " is now open";
        } else if (receivedEvent.status == 0 && (receivedEvent.sensorTypeId == 1 || receivedEvent.sensorTypeId == 2)) { // door sensor and CLOSED
            message = receivedEvent.sensorName + " is now closed";
        } else if (receivedEvent.status == 1 && (receivedEvent.sensorTypeId == 3 || receivedEvent.sensorTypeId == 4)) { // door sensor and OPEN
            message = "Motion detected at " + receivedEvent.sensorName;
        } else if (receivedEvent.status == 0 && (receivedEvent.sensorTypeId == 3 || receivedEvent.sensorTypeId == 4)) { // door sensor and CLOSED
            message = "Motion stopped at " + receivedEvent.sensorName;
        } else if (receivedEvent.status == 1 && (receivedEvent.sensorTypeId == 5)) { // kerberos AND motion detected
            message = "Motion detected from kerberos at " + receivedEvent.sensorName;
        } else if (receivedEvent.status == 0 && (receivedEvent.sensorTypeId == 5)) { // kerberos AND motion detected
            message = "Motion stopped at " + receivedEvent.sensorName;
        }
        return message;
    }

    // Play sounds depending on received event
    function playSounds(event) {
        //if (event.eventType == "updatedAlarmStatus" && event.message.currentStatus == 'DISARMED') {
        //    ngAudio.play("sounds/system_disarmed.wav");
        //} else if (event.eventType == "updatedAlarmStatus" && event.message.currentStatus == 'ARMED') {
        //    ngAudio.play("sounds/system_armed.wav");
        //} else if (event.eventType == "newSensorEvent" && event.message.status == 1) {
        //    ngAudio.play("sounds/sensor_event_1.wav");
        //} else if (event.eventType == "newSensorEvent" && event.message.status == 0) {
        //    ngAudio.play("sounds/sensor_event_0.wav");
        //}
    }

    // Change zone status
    $scope.changeZoneStatus = function (z) {
        $http({
            method: 'PUT',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.zoneStatus + '?token=' + token,
            data: JSON.stringify({zoneId: z.oid, status: z.status}),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            var newStatus = data.response.zonesStatus;
            if (z.status == "ENABLED")  $scope.zoneOverview.enabled++; else  $scope.zoneOverview.enabled--;
            for (var i = 0; i < $scope.zones.length; i++)
                for (var j = 0; j < newStatus.length; j++)
                    if ($scope.zones[i].oid == newStatus[i].zoneId)
                        $scope.zones[i].status = newStatus[i].status;
        }).error(function (data, status, headers, config) {
            (z.status == "DISABLED") ? z.status = "ENABLED" : z.status = "DISABLED";
        });
    };

}]);
