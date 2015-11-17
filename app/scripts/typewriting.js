/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var AppCtrl = (function () {
        function AppCtrl($location, $scope) {
            this.pageTitle = "";
            $scope.$on("$routeChangeSuccess", function (e, nextRoute) {
                if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
                    this.pageTitle = nextRoute.$$route.pageTitle + " | Torpedo";
                }
            });
        }
        return AppCtrl;
    })();
    Controllers.AppCtrl = AppCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=AppController.js.map;/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var HomeCtrl = (function () {
        function HomeCtrl($http, store, jwtHelper) {
            this.jwt = store.get("jwt");
            this.decodedJwt = this.jwt && jwtHelper.decodeToken(this.jwt);
            this.http = $http;
        }
        HomeCtrl.prototype.callAnonymousApi = function () {
            this.callApi("Anonymous", "/api/random-quote");
        };
        HomeCtrl.prototype.callSecuredApi = function () {
            this.callApi("Secured", "/api/protected/random-quote");
        };
        HomeCtrl.prototype.callApi = function (type, url) {
            var _this = this;
            this.response = null;
            this.api = type;
            this.http({
                url: url,
                method: "GET"
            }).then(function (quote) {
                _this.response = quote.data;
            }, function (error) {
                _this.response = error.data;
            });
        };
        return HomeCtrl;
    })();
    Controllers.HomeCtrl = HomeCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=HomeController.js.map;/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var LoginCtrl = (function () {
        function LoginCtrl($http, store, $state) {
            this.http = $http;
            this.state = $state;
            this.store = store;
        }
        LoginCtrl.prototype.login = function () {
            var _this = this;
            this.http({
                url: "/sessions/create",
                method: "POST",
                data: this.user
            }).then(function (response) {
                _this.store.set("jwt", response.data["id_token"]);
                _this.state.go("home");
            }, function (error) {
                alert(error.data);
            });
        };
        return LoginCtrl;
    })();
    Controllers.LoginCtrl = LoginCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=LoginController.js.map;/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var RegCtrl = (function () {
        function RegCtrl($http, store, $state) {
            this.http = $http;
            this.state = $state;
            this.store = store;
        }
        RegCtrl.prototype.register = function () {
            var _this = this;
            this.http({
                url: "/users",
                method: "POST",
                data: this.user
            }).then(function (response) {
                _this.store.set("jwt", response.data["id_token"]);
                _this.state.go("home");
            }, function (error) {
                alert(error.data);
            });
        };
        return RegCtrl;
    })();
    Controllers.RegCtrl = RegCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=RegisterController.js.map;/// <reference path="../../references.ts" />
var App;
(function (App) {
    angular.module("torpedo", ["angular-jwt", "angular-storage", "ui.router", "LocalStorageModule"])
        .config(function ($urlRouterProvider, jwtInterceptorProvider, $httpProvider, $stateProvider) {
        $stateProvider
            .state("home", {
            url: "/",
            controller: Controllers.HomeCtrl,
            controllerAs: "HomeCtrl",
            templateUrl: "partials/home.html",
            data: {
                requiresLogin: true
            }
        })
            .state("login", {
            url: "/login",
            controller: Controllers.LoginCtrl,
            controllerAs: "LoginCtrl",
            templateUrl: "partials/login.html"
        })
            .state("register", {
            url: "/register",
            controller: Controllers.RegCtrl,
            controllerAs: "RegCtrl",
            templateUrl: "partials/register.html"
        });
        $urlRouterProvider.otherwise("/");
        $httpProvider.interceptors.push(function ($rootScope, $q, store) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    config.headers["Authorization"] = "Bearer " + localStorage.getItem("jwt").substring(1, localStorage.getItem("jwt").length - 1);
                    return config;
                },
                response: function (response) {
                    if (response.status === 401) {
                    }
                    return response || $q.when(response);
                }
            };
        });
    })
        .run(function ($rootScope, $state, store, jwtHelper) {
        $rootScope.$on("$stateChangeStart", function (e, to) {
            if (to.data && to.data.requiresLogin) {
                if (!store.get("jwt") || jwtHelper.isTokenExpired(store.get("jwt"))) {
                    e.preventDefault();
                    $state.go("login");
                }
            }
        });
    })
        .controller("AppCtrl", ["$location", "$scope", Controllers.AppCtrl])
        .controller("HomeCtrl", ["$http", "store", "jwtHelper", Controllers.HomeCtrl])
        .controller("LoginCtrl", ["$http", "store", "$state", Controllers.LoginCtrl])
        .controller("RegCtrl", ["$http", "store", "$state", Controllers.RegCtrl]);
})(App || (App = {}));
//# sourceMappingURL=app.js.map