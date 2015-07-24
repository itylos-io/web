'use strict';

/* Controllers */
app.controller('SensorsCnfgCtrl', ['$scope', '$http', '$state', '$localStorage', '$location', '$timeout', '$modal', function ($scope, $http, $state, $localStorage, $location, $timeout, $modal) {

    //get the token from local storage
    var token = $localStorage.authed.token;
    $scope.alarmIsActive = false;
    $scope.sensors = [];

    $scope.$watch('socketEvent', function() {
        if($scope.socketEvent) {
            if ($scope.socketEvent.eventType == "alarmStatusChanged") {
                if ($scope.socketEvent.message.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
                else $scope.alarmIsActive = true;
            }
        }
    });

    //Get alarm status
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.alarm + '?token=' + token)
        .success(function (data) {
            if (data.response.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
            else $scope.alarmIsActive = true;
        });

    //Get sensors
    $http({
        method: 'GET',
        url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensors + '?token=' + token,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .success(function (data, status, headers, config) {
            $scope.sensors = data.response.sensors;
        });

    //Open PopUp for Create Sensor
    $scope.open = function (size) {
        var modalInstance = $modal.open({
            templateUrl: 'tpl/sensors/add_sensor.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                sensorTypes: function () {
                    return (token);
                }
            }
        });
        modalInstance.result.then(function (putdata) {
            $scope.sensors = putdata.response.sensors;
        });
    };

    //Controller for PopUp Create Sensor
    app.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', '$http', 'sensorTypes',
        function ($scope, $modalInstance, $http, sensorTypes) {

            $scope.error = false;
            $scope.sensorTypes = [];

            //Get sensor types
            $http({
                method: 'GET',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensorTypes + '?token=' + token,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .success(function (data, status, headers, config) {
                    $scope.sensorTypes = data.response.types;
                    //set default sensor type at select
                    $scope.newSensor = {
                        typeId: $scope.sensorTypes[0],
                        active: true
                    };
                })

            //Close 'Create Sensor' PopUp
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            //Form Submit for New Sensor
            $scope.submit = function () {
                var data = {
                    sensorId: $scope.newSensor.id,
                    name: $scope.newSensor.name,
                    description: $scope.newSensor.description,
                    location: $scope.newSensor.location,
                    sensorTypeId: $scope.newSensor.typeId.id,
                    isActive: $scope.newSensor.active
                };
                $http({
                    method: 'PUT',
                    url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.createSensor + '?token=' + token,
                    data: JSON.stringify(data),
                    dataType: 'json',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .success(function (data, status, headers, config) {
                        $modalInstance.close(data);
                    })
                    .error(function (data, status, headers, config) {
                        $scope.error = true;
                    });
            };
        }]);

    //Delete sensor
    $scope.deleteSensor = function (oidata) {
        var data = {
            oid: oidata
        }
        $http({
            method: 'DELETE',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.deleteSensor + '?token=' + token,
            data: JSON.stringify(data),
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .success(function (data, status, headers, config) {
                $scope.sensors = data.response.sensors;
            })
    };

    //Open PopUp for Edit Sensor
    $scope.editSensor = function (size, senId) {
        var modalInstance = $modal.open({
            templateUrl: 'tpl/sensors/edit_sensor.html',
            controller: 'ModalInstanceCtrlEdit',
            size: size,
            resolve: {
                sensor: function () {
                    return (senId);
                }
            }
        });
        modalInstance.result.then(function (putdata) {
            $scope.sensors = putdata.response.sensors;
        });
    };

    //Controller for PopUp Edit Sensor
    app.controller('ModalInstanceCtrlEdit', ['$scope', '$modalInstance', '$http', 'sensor',
        function ($scope, $modalInstance, $http, sensor) {
            $scope.error = false;
            $scope.sensorTypes = [];
            //Get sensor types
            $http({
                method: 'GET',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensorTypes + '?token=' + token,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .success(function (data, status, headers, config) {
                    $scope.sensorTypes = data.response.types;
                    for (var i = 0; i < $scope.sensorTypes.length; i++) {
                        if ($scope.sensorTypes[i].id === sensor.sensorTypeId) {
                            break;
                        }
                    }
                    $scope.editSensor = {
                        isActive: sensor.isActive,
                        typeId: $scope.sensorTypes[i],
                        oid: sensor.oid,
                        sensorId: sensor.sensorId,
                        name: sensor.name,
                        description: sensor.description,
                        location: sensor.location,
                        dateRegistered: sensor.dateRegistered,
                        zones: sensor.zones
                    };
                })

            //Close 'Edit Sensor' PopUp
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            //Form Submit for Edit Sensor
            $scope.submitEdit = function () {
                var data = {
                    oid: $scope.editSensor.oid,
                    sensorId: $scope.editSensor.sensorId,
                    name: $scope.editSensor.name,
                    description: $scope.editSensor.description,
                    location: $scope.editSensor.location,
                    sensorTypeId: $scope.editSensor.typeId.id,
                    isActive: $scope.editSensor.isActive
                };
                $http({
                    method: 'POST',
                    url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.editSensor + '?token=' + token,
                    data: JSON.stringify(data),
                    dataType: 'json',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .success(function (data, status, headers, config) {
                        $modalInstance.close(data);
                    })
                    .error(function (data, status, headers, config) {
                        $scope.error = true;
                    });
            };
        }]);

    //Change sensor state Enable/Disable
    $scope.changeSensorState = function (sensor) {
        $scope.error = false;
        var data = {
            oid: sensor.oid,
            sensorId: sensor.sensorId,
            name: sensor.name,
            description: sensor.description,
            location: sensor.location,
            sensorTypeId: sensor.sensorTypeId,
            isActive: !sensor.isActive
        };
        $http({
            method: 'POST',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.editSensor + '?token=' + token,
            data: JSON.stringify(data),
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .success(function (data, status, headers, config) {
                $scope.sensors = data.response.sensors;
            })
            .error(function (data, status, headers, config) {
                $scope.error = true;
            });
    };


}]);
