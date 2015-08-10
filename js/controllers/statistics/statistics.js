app.controller('StatisticsCtrl', ['$scope', '$http', '$localStorage', '$filter',
    function ($scope, $http, $localStorage, $filter) {

        var token = $localStorage.authed.token;
        $scope.selectedTimespan = "lastDay";
        $scope.selectedSensor = "...";

        $scope.options = {
            scaleShowGridLines: true
        };

        //Get sensors
        $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.getSensors + '?token=' + token)
            .success(function (data, status, headers, config) {
                $scope.sensors = data.response.sensors;
                $scope.selectedSensor = $scope.sensors[0].name;
            });


        //get stats
        $http.get($scope.apiEndpoints.domain + $scope.apiEndpoints.services.sensorStatistics + '?token=' + token)
            .success(function (data) {
                $scope.minutelyStats = data.response.lastHourStats;
                $scope.hourlyStats = data.response.lastDayStats;
                $scope.dailyStats = data.response.lastWeekStats;
                $scope.updateSpecificSensorStats();
                $scope.updateAggregatedSensorStats();
            });


        //=========================================//
        //================ Methods ================//
        //=========================================//

        $scope.setSelectedTimespan = function (timespan) {
            $scope.selectedTimespan = timespan;
            $scope.updateSpecificSensorStats();
            $scope.updateAggregatedSensorStats();
        };

        $scope.setSelectedSensor = function (sensor) {
            $scope.selectedSensor = sensor;
            $scope.updateSpecificSensorStats();
        };


        // Update aggregated sensor events chart
        $scope.updateAggregatedSensorStats = function () {
            // Reset counters
            $scope.countPerSensor = {};
            for (var i = 0; i < $scope.sensors.length; i++) {
                $scope.countPerSensor[$scope.sensors[i].name] = 10;
            }

            if ($scope.selectedTimespan == "lastHour") { // Minutely resolution
                for (var i = 0; i < $scope.minutelyStats.length; i++) {
                    $scope.countPerSensor[$scope.minutelyStats[i].sensorName] =
                        $scope.countPerSensor[$scope.minutelyStats[i].sensorName] + $scope.minutelyStats[i].sensorEventsCount
                }
            }
            else if ($scope.selectedTimespan == "lastDay") {// Hourly resolution
                for (var i = 0; i < $scope.hourlyStats.length; i++) {
                    $scope.countPerSensor[$scope.hourlyStats[i].sensorName] =
                        $scope.countPerSensor[$scope.hourlyStats[i].sensorName] + $scope.hourlyStats[i].sensorEventsCount
                }
            } else { // Daily resolution
                for (var i = 0; i < $scope.dailyStats.length; i++) {
                    $scope.countPerSensor[$scope.dailyStats[i].sensorName] =
                        $scope.countPerSensor[$scope.dailyStats[i].sensorName] + $scope.dailyStats[i].sensorEventsCount
                }
            }

            // Update data and labels
            $scope.aggregatedSensorStatsLabel = [];
            $scope.aggregatedSensorStatsData = [];
            for (var i = 0, keys = Object.keys($scope.countPerSensor), ii = keys.length; i < ii; i++) {
                console.log('key : ' + keys[i] + ' val : ' + $scope.countPerSensor[keys[i]]);
                $scope.aggregatedSensorStatsLabel.push(keys[i]);
                $scope.aggregatedSensorStatsData.push($scope.countPerSensor[keys[i]]);
            }
        };


        // Update chart for a specific sensor
        $scope.updateSpecificSensorStats = function () {
            $scope.specificSensorLabels = [];
            $scope.specificSensorData = [[]];

            if ($scope.selectedTimespan == "lastHour") { // Minutely resolution
                for (var i = 0; i < $scope.minutelyStats.length; i++) {
                    if ($scope.minutelyStats[i].sensorName == $scope.selectedSensor) {
                        var label = $filter('date')(new Date($scope.minutelyStats[i].datetimeInterval), 'hh:mm');
                        $scope.specificSensorLabels.push(label);
                        $scope.specificSensorData[0].push($scope.minutelyStats[i].sensorEventsCount);
                    }
                }
            } else if ($scope.selectedTimespan == "lastDay") {// Hourly resolution
                for (var i = 0; i < $scope.hourlyStats.length; i++) {
                    if ($scope.hourlyStats[i].sensorName == $scope.selectedSensor) {
                        var label = $filter('date')(new Date($scope.hourlyStats[i].datetimeInterval), 'hh:mm');
                        $scope.specificSensorLabels.push(label);
                        $scope.specificSensorData[0].push($scope.hourlyStats[i].sensorEventsCount);
                    }
                }
            } else { // Daily resolution
                for (var i = 0; i < $scope.dailyStats.length; i++) {
                    if ($scope.dailyStats[i].sensorName == $scope.selectedSensor) {
                        var label = $filter('date')(new Date($scope.dailyStats[i].datetimeInterval), 'EEEE')
                        $scope.specificSensorLabels.push(label);
                        $scope.specificSensorData[0].push($scope.dailyStats[i].sensorEventsCount);
                    }
                }
            }
        };
    }
])
;