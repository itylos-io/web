/**
 * Created by bober on 14/3/2015.
 */
app.controller('UsersCtrl', ['$scope', '$http', '$localStorage', '$modal', function ($scope, $http, $localStorage, $modal) {

    var token = $localStorage.authed.token;
    $scope.users = [];
    $scope.addUserModal = {};
    $scope.editUserModal = {};
    $scope.newUser = {};
    $scope.editUser = {};
    $scope.currentUser = $localStorage.email;
    $scope.alarmIsActive = false;

    //get alarm status
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.alarm + '?token=' + token)
        .success(function (data) {
            if (data.response.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
            else $scope.alarmIsActive = true;
        });

    //get users status
    $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.users + '?token=' + token)
        .success(function (data) {
            $scope.users = data.response.users;
        });
    //create user modal open
    $scope.createNewUser = function () {
        $scope.addUserModal = $modal.open(
            {templateUrl: 'add_user_modal', scope: $scope}
        );
    };
    //create user modal close
    $scope.cancel = function () {
        $scope.addUserModal.close();
    };

    //submit new user
    $scope.submit = function () {
        if ($scope.newUser.isAdmin == null) {
            $scope.newUser.isAdmin = false;
        }
        $http({
            method: 'PUT',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.users + '?token=' + token,
            data: JSON.stringify($scope.newUser),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            $scope.newUser = {};
            $scope.users = data.response.users;
            $scope.cancel();
        });
    };

    //change user status
    $scope.changeUserAdmin = function (u) {
        $http({
            method: 'POST',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.users + '?token=' + token,
            data: JSON.stringify(u),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            $scope.users = data.response.users;
        })
    };

    //edit user modal close
    $scope.cancelEdit = function () {
        $scope.editUserModal.close();
    };

    //edit user modal open
    $scope.editUserOpen = function (u) {
        $scope.editUser = {
            oid: u.oid,
            name: u.name,
            email: u.email,
            webPassword: u.webPassword,
            alarmPassword: u.alarmPassword,
            isAdmin: u.isAdmin
        };
        $scope.editUserModal = $modal.open({templateUrl: 'edit_user_modal', scope: $scope});
    };

    //submit edit user
    $scope.submitEdit = function () {
        $http({
            method: 'POST',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.users + '?token=' + token,
            data: JSON.stringify($scope.editUser),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data, status, headers, config) {
            $scope.editUser = {};
            $scope.users = data.response.users;
            $scope.cancelEdit();
        })
            .error(function (data) {
                $scope.cancelEdit();
            });
    };
    //delete user
    $scope.deleteUser = function (u) {
        $http({
            method: 'DELETE',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.users + '?token=' + token,
            data: JSON.stringify({oid: u.oid}),
            dataType: 'json',
            headers: {'Content-Type': 'application/json'}
        }).success(function (data) {
            $scope.users = data.response.users;
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