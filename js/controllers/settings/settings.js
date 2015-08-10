app.controller('SettingsCtrl', ['$scope', '$http', '$state', '$localStorage', '$filter', 'editableOptions',
    'editableThemes', '$modal',
    function ($scope, $http, $state, $localStorage, $filter, editableOptions, editableThemes, $modal) {

        var WEB_UI_GITHUB_RELEASES= "https://api.github.com/repos/kerberos-io/machinery/releases/latest";

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        // Alert messages in kerberos settings
        $scope.showItylosIsTryingToCommunicateWithKerberos = false;
        $scope.showItylosFailedToCommunicateWithKerberos = false;
        $scope.showItylosSuccessfullyCommunicatedWithKerberos = false;
        $scope.showItylosSuccessfullyUpdatedKerberosSettings = false;
        $scope.showItylosFailedToUpdatKerberosSettings = false;
        $scope.showItylosIsTryingToUpdatKerberosSettings = false;

        // Alert messages in pushbullet settings
        $scope.showItylosCouldNotRetrievePushbulletDevices = false;
        $scope.showItylosCouldRetrievePushbulletDevices = false;
        $scope.showItylosIsRetrievingPushbulletDevices = false;

        // For version statistics
        $scope.showNotUpToDateAlert = false;
        $scope.showUpToDateAlert = false;
        $scope.module = "";
        $scope.updatedVersion = "";
        $scope.updatedVersionUrl = "";
        $scope.checkCoreApiVersionButtonText = 'Check';
        $scope.checkWebUIVersionButtonText = 'Check';
        $scope.webUiVersion = "v1.0.3";


        //get the token from local storage
        var token = $localStorage.authed.token;
        $scope.alarmIsActive = false;


        //Get alarm status
        $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.alarm + '?token=' + token)
            .success(function (data) {
                if (data.response.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
                else $scope.alarmIsActive = true;
            });

        //Get settings
        $http({
            method: 'GET',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSettings + '?token=' + token,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data, status, headers, config) {
            $scope.settings = data.response.settings;
        });

        //Get current version
        $http({
            method: 'GET',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.currentVersion + '?token=' + token,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function (data, status, headers, config) {
            $scope.currentVersion = data.response;
        });


        //=========================================//
        //================ Methods ================//
        //=========================================//

        // Get latest Core API version
        $scope.getLatestCoreApiRelease = function () {
            $scope.checkCoreApiVersionButtonText = "Checking...";
            //Get current version
            $http({
                method: 'GET',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.latestVersion + '?token=' + token,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.checkCoreApiVersionButtonText = "Check";
                $scope.updatedVersion = data.response.tag_name;
                $scope.updatedVersionUrl =data.response.html_url;
                $scope.module = "Core API";

                if (data.response.tag_name != $scope.currentVersion) {
                    $scope.showNotUpToDateAlert = true;
                    $scope.showUpToDateAlert = false;
                }else{
                    $scope.showNotUpToDateAlert = false;
                    $scope.showUpToDateAlert = true;
                }
            });
        };

        // Get latest WebUI version
        $scope.getLatestWebUIRelease = function () {
            $scope.checkWebUIVersionButtonText = "Checking...";
            //Get current version
            $http({
                method: 'GET',
                url:WEB_UI_GITHUB_RELEASES,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.checkWebUIVersionButtonText = "Check";
                $scope.updatedVersion = data.tag_name;
                $scope.updatedVersionUrl =data.html_url;
                $scope.module = "Web UI";

                if (data.tag_name != $scope.webUiVersion) {
                    $scope.showNotUpToDateAlert = true;
                    $scope.showUpToDateAlert = false;
                }else{
                    $scope.showNotUpToDateAlert = false;
                    $scope.showUpToDateAlert = true;
                }
            });
        };

        //Update email settings
        $scope.updateEmailSettings = function () {
            var data = {
                isEnabled: $scope.settings.emailSettings.isEnabled,
                smtpStartTLSEnabled: $scope.settings.emailSettings.smtpStartTLSEnabled,
                smtpHost: $scope.settings.emailSettings.smtpHost,
                smtpUser: $scope.settings.emailSettings.smtpUser,
                smtpPassword: $scope.settings.emailSettings.smtpPassword,
                smtpPort: parseInt($scope.settings.emailSettings.smtpPort),
                smtpAuth: $scope.settings.emailSettings.smtpAuth,
                emailsToNotify: $scope.settings.emailSettings.emailsToNotify
            };

            $http({
                method: 'PUT',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.emailSettings + '?token=' + token,
                data: JSON.stringify(data),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            }).error(function (data, status, headers, config) {
                $scope.error = true;
            });
        };

        // update nexmo settings
        $scope.updateNexmoSettings = function () {
            var data = {
                isEnabled: $scope.settings.nexmoSettings.isEnabled,
                nexmoKey: $scope.settings.nexmoSettings.nexmoKey,
                nexmoSecret: $scope.settings.nexmoSettings.nexmoSecret,
                mobilesToNotify: $scope.settings.nexmoSettings.mobilesToNotify
            };

            $http({
                method: 'PUT',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.nexmoSettings + '?token=' + token,
                data: JSON.stringify(data),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            }).error(function (data, status, headers, config) {
                $scope.error = true;
            });
        };


        // update webhooks settings
        $scope.updateWebhooksSettings = function () {
            var data = {
                isEnabled: $scope.settings.webHookSettings.isEnabled,
                uris: $scope.settings.webHookSettings.uris
            };

            $http({
                method: 'PUT',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.webhooksSettings + '?token=' + token,
                data: JSON.stringify(data),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            }).error(function (data, status, headers, config) {
                $scope.error = true;
            });
        };

        // Update system settings only
        $scope.updateSystemSettings = function () {
            var data = {
                maxAlarmPasswordRetries: $scope.settings.systemSettings.maxAlarmPasswordRetries,
                maxSecondsToDisarm: $scope.settings.systemSettings.maxSecondsToDisarm,
                delayToArm: $scope.settings.systemSettings.delayToArm,
                playSoundsForSensorEvents: $scope.settings.systemSettings.playSoundsForSensorEvents,
                playSoundsForTriggeredAlarm: $scope.settings.systemSettings.playSoundsForTriggeredAlarm,
                playSoundsForAlarmStatusUpdates: $scope.settings.systemSettings.playSoundsForAlarmStatusUpdates,
                accessToken: $scope.settings.systemSettings.accessToken
            };

            $http({
                method: 'PUT',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.systemSettings + '?token=' + token,
                data: JSON.stringify(data),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            }).error(function (data, status, headers, config) {
                $scope.error = true;
            });
        };

        // Update pushbullet settings only
        $scope.updatePushbulletSettings = function () {
            var data = {
                isEnabled: $scope.settings.pushBulletSettings.isEnabled,
                accessToken: $scope.settings.pushBulletSettings.accessToken,
                notifyForSensorEvents: $scope.settings.pushBulletSettings.notifyForSensorEvents,
                notifyForAlarms: $scope.settings.pushBulletSettings.notifyForAlarms,
                notifyForAlarmsStatusUpdates: $scope.settings.pushBulletSettings.notifyForAlarmsStatusUpdates,
                devices: $scope.settings.pushBulletSettings.devices
            };

            $http({
                method: 'PUT',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.pushbulletSettings + '?token=' + token,
                data: JSON.stringify(data),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            }).error(function (data, status, headers, config) {
                $scope.error = true;
            });
        };

        // Update kerberos settings only
        $scope.updateKerberosSettings = function () {
            $scope.closeAllAlerts();
            $scope.showItylosIsTryingToUpdatKerberosSettings = true;

            var data = {
                isEnabled: $scope.settings.kerberosSettings.isEnabled,
                instances: $scope.settings.kerberosSettings.instances
            };
            $http({
                method: 'PUT',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.kerberosSettings + '?token=' + token,
                data: JSON.stringify(data),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
                $scope.showItylosSuccessfullyUpdatedKerberosSettings = true;
                $scope.showItylosIsTryingToUpdatKerberosSettings = false;
            }).error(function (data, status, headers, config) {
                $scope.error = true;
                $scope.showItylosFailedToUpdatKerberosSettings = true;
                $scope.showItylosIsTryingToUpdatKerberosSettings = false;
            });
        };

        // Ask core API for pushbullet devices associated to given access token
        $scope.getPusbhbulletDevices = function () {
            $scope.closeAllAlerts();
            $scope.showItylosIsRetrievingPushbulletDevices = true;
            $http({
                method: 'GET',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.pushbulletDevices + '/'
                + $scope.settings.pushBulletSettings.accessToken + '?token=' + token,
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.showItylosCouldRetrievePushbulletDevices = true;
                $scope.showItylosIsRetrievingPushbulletDevices = false;
                $scope.settings.pushBulletSettings.devices = data.response.devices;
            }).error(function (data, status, headers, config) {
                $scope.showItylosCouldNotRetrievePushbulletDevices = true;
                $scope.showItylosIsRetrievingPushbulletDevices = false;
                $scope.settings.pushBulletSettings.devices = [];
            });
        };

        $scope.closeAllAlerts = function(){
            $scope.showItylosIsTryingToCommunicateWithKerberos = false;
            $scope.showItylosFailedToCommunicateWithKerberos = false;
            $scope.showItylosSuccessfullyCommunicatedWithKerberos = false;
            $scope.showItylosSuccessfullyUpdatedKerberosSettings = false;
            $scope.showItylosFailedToUpdatKerberosSettings = false;
            $scope.showItylosIsTryingToUpdatKerberosSettings = false;

            // Alert messages in pushbullet settings
            $scope.showItylosCouldNotRetrievePushbulletDevices = false;
            $scope.showItylosCouldRetrievePushbulletDevices = false;
            $scope.showItylosIsRetrievingPushbulletDevices = false;
        };

        //Check Email Input
        $scope.checkMail = function (data) {
            if (!validateEmail(data)) {
                return "Wrong email";
            }
        };

        //Email Validation function
        function validateEmail(email) {
            var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        // Add a Item to the list
        $scope.addNewEmailToSettings = function () {
            $scope.settings.emailSettings.emailsToNotify.push("john@smith.com");
        };

        // Add new uri to webhooks
        $scope.addNewUriToWebhooks = function () {
            $scope.settings.webHookSettings.uris.push("http://localhost:8080/api/v1/alarm");
        };

        // Add new mobile to nexmo settings
        $scope.addNewMobileToNexmoSettings = function () {
            $scope.settings.nexmoSettings.mobilesToNotify.push("00306978787777");
        };

        // Remove Email
        $scope.removeMail = function (index) {
            $scope.settings.emailSettings.emailsToNotify.splice(index, 1);
        };

        // Remove Email
        $scope.removeMobileFromNexmoSettings = function (index) {
            $scope.settings.nexmoSettings.mobilesToNotify.splice(index, 1);
        };

        // Remove uri from webhooks
        $scope.removeUri = function (index) {
            $scope.settings.webHookSettings.uris.splice(index, 1);
        };

        // Remove instance from kerberos
        $scope.removeKerberosInstance = function (index) {
            $scope.settings.kerberosSettings.instances.splice(index, 1);
        };

        // Add Phone
        $scope.addPhone = function () {
            $scope.settings.webHookSettings.uris.push($scope.inserted);
        };

        //Check Phone Input
        $scope.checkPhone = function (data) {
            var phoneno = /^\d{12}$/;
            var phone = parseInt(data);
            if (phoneno.test(phone)) {
                return true;
            } else {
                return "Wrong phone";
            }
        };

        function phonenumber(inputtxt) {
            var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            if (inputtxt.value.match(phoneno)) {
                return true;
            } else {
                return false;
            }
        }

        // Open popup to add kerberos instance
        $scope.addKerberosInstance = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/settings/add_kerberos_instance.html',
                controller: 'AddKerberosInstanceCtrl'
            });
            modalInstance.result.then(function (newInstance) {
                $scope.settings.kerberosSettings.instances.push(newInstance);
                console.log($scope.settings.kerberosSettings.instances.length - 1)
                $scope.updateKerberosInstanceName($scope.settings.kerberosSettings.instances.length - 1);
            });
        };

        // Open popup to edit kerberos instance
        $scope.editKerberosInstance = function (instanceIndex) {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/settings/edit_kerberos_instance.html',
                controller: 'EditKerberosInstanceCtrl',
                resolve: {
                    kerberosInstance: function () {
                        return $scope.settings.kerberosSettings.instances[instanceIndex];
                    }
                }
            });
            modalInstance.result.then(function (updatedInstance) {
                $scope.settings.kerberosSettings.instances[instanceIndex] = updatedInstance;
                $scope.updateKerberosInstanceName(instanceIndex);
            });
        };

        //Get instance name
        $scope.updateKerberosInstanceName = function (kerberosInstanceIndex) {
            $scope.closeAllAlerts();
            $scope.showItylosIsTryingToCommunicateWithKerberos = true;
            $http({
                method: 'GET',
                url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.kerberosInstanceName
                + "/" + $scope.settings.kerberosSettings.instances[kerberosInstanceIndex].ip
                + "/" + $scope.settings.kerberosSettings.instances[kerberosInstanceIndex].username
                + "/" + $scope.settings.kerberosSettings.instances[kerberosInstanceIndex].password + '?token=' + token,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data, status, headers, config) {
                $scope.showItylosSuccessfullyCommunicatedWithKerberos = true;
                $scope.showItylosIsTryingToCommunicateWithKerberos = false;
                $scope.settings.kerberosSettings.instances[kerberosInstanceIndex].instanceName = data.response.instance.instanceName
            }).error(function (data, status, headers, config) {
                $scope.showItylosFailedToCommunicateWithKerberos = true;
                $scope.showItylosIsTryingToCommunicateWithKerberos = false;
                $scope.settings.kerberosSettings.instances[kerberosInstanceIndex].instanceName = "error!"
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


        //=========================================//
        //========== Nested Controllers ===========//
        //=========================================//

        //Controller for popup 'add_kerberos_instance'
        app.controller('AddKerberosInstanceCtrl', ['$scope', '$modalInstance', '$http',
            function ($scope, $modalInstance, $http) {
                $scope.error = false;
                // Default values
                $scope.addKerberosInstance = {
                    instanceName: "instanceName",
                    ip: "192.168.2.6",
                    username: "root",
                    password: "root"
                };

                // Close 'add_kerberos_instance' popup
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                //Form submit for 'add_kerberos_instance'
                $scope.submitKerberosInstance = function () {
                    var data = {
                        instanceName: $scope.addKerberosInstance.instanceName,
                        ip: $scope.addKerberosInstance.ip,
                        username: $scope.addKerberosInstance.username,
                        password: $scope.addKerberosInstance.password
                    };
                    $modalInstance.close(data);
                };
            }]);


        //Controller for popup 'edit_kerberos_instance'
        app.controller('EditKerberosInstanceCtrl', ['$scope', '$modalInstance', '$http', 'kerberosInstance',
            function ($scope, $modalInstance, $http, kerberosInstance) {
                $scope.error = false;
                $scope.editKerberosInstance = {
                    instanceName: kerberosInstance.instanceName,
                    ip: kerberosInstance.ip,
                    username: kerberosInstance.username,
                    password: kerberosInstance.password
                };

                // Close 'edit_kerberos_instance' popup
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                //Form submit for 'edit_kerberos_instance'
                $scope.submitEditedKerberosInstance = function () {
                    var data = {
                        instanceName: $scope.editKerberosInstance.instanceName,
                        ip: $scope.editKerberosInstance.ip,
                        username: $scope.editKerberosInstance.username,
                        password: $scope.editKerberosInstance.password
                    };
                    $modalInstance.close(data);
                };
            }]);


    }]);




