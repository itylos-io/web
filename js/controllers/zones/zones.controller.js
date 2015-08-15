/**
 * Created by bober on 14/3/2015.
 */
app.controller('ZonesCtrl', ['$scope', '$http', '$localStorage', '$modal', function ($scope, $http, $localStorage, $modal) {

    var token = $localStorage.authed.token;
    $scope.zones = [];
    $scope.sensors = [];
    $scope.addZoneModal = {};
    $scope.editZoneModal = {};
    $scope.newZone = {};
    $scope.editZone = {};
    $scope.alarmIsActive = false;

    //get alarm status
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.alarm + '?token=' + token)
        .success(function (data) {
            if (data.response.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
            else $scope.alarmIsActive = true;
        });

    //get zones
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.zones + '?token=' + token)
        .success(function (data) {
            $scope.zones = data.response.zones;
        });

    //create zone modal open
    $scope.createNewZone = function () {
        //get sensors
        $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensors + '?token=' + token)
            .success(function (data) {
                $scope.sensors = data.response.sensors;
                $scope.addZoneModal = $modal.open({templateUrl: 'add_zone_modal', scope: $scope});
            });
    };

    //create zone modal close
    $scope.cancel = function () {
        $scope.addZoneModal.close();
    };

    //submit new zone
    $scope.submit = function () {
        $http({
            method: 'POST',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.zones + '?token=' + token,
            data: JSON.stringify($scope.newZone),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            $scope.newZone = {};
            $scope.zones = data.response.zones;
            $scope.cancel();
        });
    };

    //change zone status
    $scope.changeZoneStatus = function (z) {
        $http({
            method: 'PUT',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.zoneStatus + '?token=' + token,
            data: JSON.stringify({zoneId: z.oid, status: z.status}),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            var newStatus = data.response.zonesStatus;
            for (var i = 0; i < $scope.zones.length; i++)
                for (var j = 0; j < newStatus.length; j++)
                    if ($scope.zones[i].oid == newStatus[i].zoneId)
                        $scope.zones[i].status = newStatus[i].status;
        }).error(function (data, status, headers, config) {
            (z.status == "DISABLED") ? z.status = "ENABLED" : z.status = "DISABLED";
        });
    };

    //edit zone modal close
    $scope.cancelEdit = function () {
        $scope.editZoneModal.close();
    };

    //edit zone modal open
    $scope.editZoneOpen = function (z) {
        //get sensors
        $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensors + '?token=' + token)
            .success(function (data) {
                $scope.sensors = data.response.sensors;
                var sensorIds = [];
                for (var i = 0; i < z.sensors.length; i++) sensorIds.push(z.sensors[i].oid);
                $scope.editZone = {oid: z.oid, name: z.name, description: z.description, sensorOIds: sensorIds};
                $scope.editZoneModal = $modal.open({templateUrl: 'edit_zone_modal', scope: $scope});
            });
    };

    //submit edit zone
    $scope.submitEdit = function () {
        $http({
            method: 'PUT',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.zones + '?token=' + token,
            data: JSON.stringify($scope.editZone),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            $scope.editZone = {};
            $scope.zones = data.response.zones;
            $scope.cancelEdit();
        }).error(function (data) {
            $scope.cancelEdit();
        });
    };

    //delete zone
    $scope.deleteZone = function (z) {
        $http({
            method: 'DELETE',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.zones + '?token=' + token,
            data: JSON.stringify({oid: z.oid}),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data) {
            $scope.zones = data.response.zones;
        });
    };

    $scope.$watch('socketEvent', function () {
        if ($scope.socketEvent) {
            if ($scope.socketEvent.eventType == "alarmStatusChanged") {
                if ($scope.socketEvent.message.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
                else $scope.alarmIsActive = true;
            }
        }
    });
}]);