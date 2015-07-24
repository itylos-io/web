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
        });


}]);
