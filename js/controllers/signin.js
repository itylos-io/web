'use strict';

app.controller('SigninFormController', ['$scope', '$http', '$state', '$localStorage', '$base64', function ($scope, $http, $state, $localStorage, $base64) {
    $scope.user = {};
    $scope.authError = null;


    if (angular.isDefined($localStorage.authed)) {
        $state.go('app.dashboard');
    }

    $scope.login = function () {
        $scope.authError = null;
        var authHeader = 'Basic ' + $base64.encode($scope.user.email + ':' + $scope.user.password);
        //console.log(authHeader);
        $http({
            method: 'POST',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.login,
            headers: {
                'Authorization': authHeader
            }
        })
            .success(function (data, status, headers, config) {
                $localStorage.authed = data.response.tokenData;
                $localStorage.email = $scope.user.email;
                $state.go('app.dashboard');
            })
            .error(function (data, status, headers, config) {
                if (status == 401) {
                    $scope.authError = 'Email or Password not right';
                } else {
                    $scope.authError = 'Server Error';
                }
            });
    };
}]);