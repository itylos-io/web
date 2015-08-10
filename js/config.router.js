'use strict';

/**
 * Config for the router
 */
angular.module('app')
    .run(
    ['$rootScope', '$state', '$stateParams', '$http', '$interval', '$localStorage', '$location',
        function ($rootScope, $state, $stateParams, $http, $interval, $localStorage, $location) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $http.get('./js/config/config.json').success(function (data) {
                $rootScope.apiEndpoints = data;
                $rootScope.apiEndpoints.domain = $location.protocol() + "://" +  "localhost" + ":18081";
            });

            /* check the first time for token */
            if (angular.isDefined($localStorage.authed)) {
                var now = new Date().getTime();
                var expireTime = $localStorage.authed.expireTime;
                //console.log(expireTime - now);
                if (expireTime - now - 2300000 <= 0) {
                    $localStorage.$reset();
                    $location.path('/access/signin').replace();
                } else {
                    //TODO new token?
                }
            }

            /* check every 30 min the token */
            $interval(function () {
                // console.log('TimerPetros');
                if (angular.isDefined($localStorage.authed)) {
                    var now = new Date().getTime();
                    var expireTime = $localStorage.authed.expireTime;
                    if (expireTime - now - 2300000 <= 0) {
                        $localStorage.$reset();
                        $location.path('/access/signin').replace();
                    } else {
                        $http({
                            method: 'POST',
                            url: $rootScope.apiEndpoints.domain + $rootScope.apiEndpoints.services.updateToken + '?token=' + $localStorage.authed.token
                        })
                            .success(function (data, status, headers, config) {
                                $localStorage.authed = data.response.tokenData;
                            })
                            .error(function (data, status, headers, config) {
                                $localStorage.$reset();
                                $location.path('/access/signin').replace();
                            });
                    }
                }
            }, 1200000);

            var socket = new WebSocket("ws://" + "localhost" + ":19997/events");
            socket.onmessage = function (event) {
                //$state.forceReload();
                $rootScope.$apply(function () {
                    $rootScope.socketEvent = JSON.parse(event.data);
                });
            }
        }
    ]
)
    .config(
    ['$stateProvider', '$urlRouterProvider', 'JQ_CONFIG',
        function ($stateProvider, $urlRouterProvider, JQ_CONFIG) {

            $urlRouterProvider
                .otherwise('/app/dashboard');
            $stateProvider
                .state('app', {
                    abstract: true,
                    url: '/app',
                    templateUrl: 'tpl/app.html',
                    controller: 'RedirectCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/controllers/redirect.controller.js', 'js/controllers/dashboard/dashboard.controller.js']);
                            }
                        ]
                    }
                })
                .state('app.dashboard', {
                    url: '/dashboard',
                    templateUrl: 'tpl/dashboard/app_dashboard_v1.html',
                    controller: 'DashboardCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/controllers/chart.js', 'js/controllers/dashboard/dashboard.controller.js']);
                            }]
                    }
                })
                .state('app.zones', {
                    abstract: true,
                    url: '/zones',
                    template: '<div ui-view></div>',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/controllers/zones/zones.controller.js', 'ui.select'])
                                    .then(function () {
                                        return $ocLazyLoad.load(['js/filters/select.js', 'js/directives/ui-select-required.js']);
                                    });
                            }
                        ]
                    }
                })
                .state('app.zones.conf', {
                    url: '/conf',
                    templateUrl: 'tpl/zones/configure_zone.html'
                })
                .state('app.sensors', {
                    abstract: true,
                    url: '/sensors',
                    template: '<div ui-view></div>'
                })
                .state('app.sensors.conf', {
                    url: '/conf',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/controllers/sensors/sensors.config.js']);
                            }]
                    },
                    templateUrl: 'tpl/sensors/configure_sensor.html'
                })
                .state('app.sensors.history', {
                    url: '/history',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/controllers/sensors/sensors.history.js']);
                            }]
                    },
                    templateUrl: 'tpl/sensors/history_sensor.html'
                })
                .state('app.sensors.status', {
                    url: '/status',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load(['js/controllers/sensors/sensors.status.js']);
                            }]
                    },
                    templateUrl: 'tpl/sensors/sensors_status.html'
                })
                .state('app.users', {
                    url: '/users',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('js/controllers/users/users.controller.js');
                                    }
                                );
                            }]
                    },
                    templateUrl: 'tpl/users/configure_user.html'
                })
                .state('app.settings', {
                    url: '/settings',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('js/controllers/settings/settings.js');
                                    }
                                );
                            }]
                    },
                    templateUrl: 'tpl/settings/settings.html'
                })
                .state('app.statistics', {
                    url: '/statistics',
                    resolve: {
                        deps: ['$ocLazyLoad',
                            function ($ocLazyLoad) {
                                return $ocLazyLoad.load('xeditable').then(
                                    function () {
                                        return $ocLazyLoad.load('js/controllers/statistics/statistics.js');
                                    }
                                );
                            }]
                    },
                    templateUrl: 'tpl/statistics/statistics.html'
                })

                .state('access', {
                    url: '/access',
                    template: '<div ui-view class="fade-in-right-big smooth"></div>'
                })
                .state('access.signin', {
                    url: '/signin',
                    templateUrl: 'tpl/page_signin.html',
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load(['js/controllers/signin.js']);
                            }]
                    }
                })
        }
    ]
);
