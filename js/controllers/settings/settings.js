/**
 * Created by psmaster on 15/3/2015.
 */

app.controller('SettingsCtrl', ['$scope', '$http', '$state', '$localStorage', '$filter', 'editableOptions', 'editableThemes', function ($scope, $http, $state, $localStorage, $filter, editableOptions, editableThemes) {

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
    var token = $localStorage.authed.token;
    $http({
        method: 'GET',
        url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSettings + '?token=' + token,
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .success(function (data, status, headers, config) {
            $scope.settings = data.response.settings;
        })

    //Update Email Settings
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
        })
            .success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            })
            .error(function (data, status, headers, config) {
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
        })
            .success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            })
            .error(function (data, status, headers, config) {
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
        })
            .success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            })
            .error(function (data, status, headers, config) {
                $scope.error = true;
            });
    };


    editableThemes.bs3.inputClass = 'input-sm';
    editableThemes.bs3.buttonsClass = 'btn-sm';
    editableOptions.theme = 'bs3';

    // Add Email
    $scope.addMail = function () {
        $scope.inserted = '';
        $scope.settings.emailSettings.emailsToNotify.push($scope.inserted);
    };

    //Check Email Input
    $scope.checkMail = function (data) {
        if (!validateEmail(data)) {
            return "Wrong email";
        }
    };

    //Save Email
    $scope.saveMail = function (data2, index) {
        $scope.settings.emailSettings.emailsToNotify[index] = data2.name;
        var data = {
            maxAlarmPasswordRetries: $scope.settings.maxAlarmPasswordRetries,
            maxSecondsToDisarm: $scope.settings.maxSecondsToDisarm,
            emailSettings: {
                isEnabled: $scope.settings.emailSettings.isEnabled,
                smtpStartTLSEnabled: $scope.settings.emailSettings.smtpStartTLSEnabled,
                smtpHost: $scope.settings.emailSettings.smtpHost,
                smtpUser: $scope.settings.emailSettings.smtpUser,
                smtpPassword: $scope.settings.emailSettings.smtpPassword,
                smtpPort: parseInt($scope.settings.emailSettings.smtpPort),
                smtpAuth: $scope.settings.emailSettings.smtpAuth,
                emailsToNotify: $scope.settings.emailSettings.emailsToNotify
            },
            "nexmoSettings": {
                "isEnabled": $scope.settings.nexmoSettings.isEnabled,
                "nexmoKey": $scope.settings.nexmoSettings.nexmoKey,
                "nexmoSecret": $scope.settings.nexmoSettings.nexmoSecret,
                "mobilesToNotify": $scope.settings.nexmoSettings.mobilesToNotify
            }
        }
        $http({
            method: 'POST',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.updateSettings + '?token=' + token,
            data: JSON.stringify(data),
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            })
            .error(function (data, status, headers, config) {
                $scope.error = true;
            });
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

    //Save Phone
    $scope.savePhone = function (data2, index) {
        $scope.settings.nexmoSettings.mobilesToNotify[index] = data2.name;
        var data = {
            "isEnabled": $scope.settings.nexmoSettings.isEnabled,
            "nexmoKey": $scope.settings.nexmoSettings.nexmoKey,
            "nexmoSecret": $scope.settings.nexmoSettings.nexmoSecret,
            "mobilesToNotify": $scope.settings.nexmoSettings.mobilesToNotify
        }
        $http({
            method: 'PUT',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.updateNexmoSettings + '?token=' + token,
            data: JSON.stringify(data),
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            })
            .error(function (data, status, headers, config) {
                $scope.error = true;
            });
    };

    // Remove Phone
    $scope.removePhone = function (index) {
        $scope.settings.nexmoSettings.mobilesToNotify.splice(index, 1);

        var data = {
            maxAlarmPasswordRetries: $scope.settings.maxAlarmPasswordRetries,
            maxSecondsToDisarm: $scope.settings.maxSecondsToDisarm,
            emailSettings: {
                isEnabled: $scope.settings.emailSettings.isEnabled,
                smtpStartTLSEnabled: $scope.settings.emailSettings.smtpStartTLSEnabled,
                smtpHost: $scope.settings.emailSettings.smtpHost,
                smtpUser: $scope.settings.emailSettings.smtpUser,
                smtpPassword: $scope.settings.emailSettings.smtpPassword,
                smtpPort: parseInt($scope.settings.emailSettings.smtpPort),
                smtpAuth: $scope.settings.emailSettings.smtpAuth,
                emailsToNotify: $scope.settings.emailSettings.emailsToNotify
            },
            "nexmoSettings": {
                "isEnabled": $scope.settings.nexmoSettings.isEnabled,
                "nexmoKey": $scope.settings.nexmoSettings.nexmoKey,
                "nexmoSecret": $scope.settings.nexmoSettings.nexmoSecret,
                "mobilesToNotify": $scope.settings.nexmoSettings.mobilesToNotify
            }
        }
        $http({
            method: 'POST',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.updateSettings + '?token=' + token,
            data: JSON.stringify(data),
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .success(function (data, status, headers, config) {
                $scope.settings = data.response.settings;
            })
            .error(function (data, status, headers, config) {
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

        }).error(function (data, status, headers, config) {
            $scope.error = true;
        });
    };

    // Ask core API for pushbullet devices associated to given access token
    $scope.getPusbhbulletDevices = function () {
        $http({
            method: 'GET',
            url: $scope.apiEndpoints.domain + $scope.apiEndpoints.services.pushbulletDevices + '/'
            + $scope.settings.pushBulletSettings.accessToken + '?token=' + token,
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .success(function (data, status, headers, config) {
                $scope.settings.pushBulletSettings.devices = data.response.devices;
            })
            .error(function (data, status, headers, config) {
                $scope.settings.pushBulletSettings.devices = [];
            });
    };


    function phonenumber(inputtxt) {
        var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (inputtxt.value.match(phoneno)) {
            return true;
        }
        else {
            return false;
        }
    }


    $scope.$watch('socketEvent', function () {
        if ($scope.socketEvent) {
            if ($scope.socketEvent.eventType == "alarmStatusChanged") {
                if ($scope.socketEvent.message.alarmStatus.currentStatus == 'DISARMED') $scope.alarmIsActive = false;
                else $scope.alarmIsActive = true;
            }
        }
    });




}]);