'use strict';

app.controller('RedirectCtrl', ['$scope', '$http', '$state', '$localStorage', '$location', '$timeout', function ($scope, $http, $state, $localStorage, $location, $timeout) {
    if (!angular.isDefined($localStorage.authed)) {
        $location.path('/access/signin').replace();
    }

    //get the token from local storage
    var token = $localStorage.authed.token;

    //dynamic content for /app/*
    $scope.appUser = {};

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

    $scope.logout = function () {
        $localStorage.$reset();
        $state.go('access.signin');
    };
}]);