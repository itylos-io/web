app.controller('ComplexController', [
    '$scope', '$http', '$localStorage', '$element', 'close',
    function ($scope, $http, $localStorage, $element, close) {

        var token = $localStorage.authed.token;

        $scope.errorPasswordEntered = false;

        $scope.password = null;

        $scope.close = function () {
            close({
                password: $scope.password
            }, 200);
        };


        $scope.cancel = function () {
            $element.modal('hide');
            close({
                name: ""
            }, 500);
        };


        // Change alarm status
        $scope.disarmSystem = function () {
            var data = {
                status: 'DISARMED',
                password: $scope.password
            };
            $http({
                method: 'PUT',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.alarm + '?token=' + token,
                data: JSON.stringify(data),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $element.modal('hide');
            }).error(function (data, status, headers, config) {
                $scope.errorPasswordEntered = true;
            });
        };

    }]);