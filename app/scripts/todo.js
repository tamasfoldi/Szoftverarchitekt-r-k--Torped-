/// <reference path="../../../references.ts" />
//# sourceMappingURL=IUser.js.map;/// <reference path="../../../references.ts" />
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
                _this.state.go("user", { username: "bucicimaci" });
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
                _this.state.go("user");
            }, function (error) {
                alert(error.data);
            });
        };
        return RegCtrl;
    })();
    Controllers.RegCtrl = RegCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=RegisterController.js.map;/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var UserCtrl = (function () {
        function UserCtrl($http, $state) {
            var _this = this;
            this.http = $http;
            this.state = $state;
            $http({
                url: "/users/" + this.state.params["username"],
                method: "GET"
            }).then(function (user) {
                _this.user = user.data;
            }, function (err) {
            });
        }
        UserCtrl.prototype.update = function () {
            this.http({
                url: "/users/" + this.state.params["username"],
                method: "PUT",
                data: this.user
            }).then(function () {
                alert("Successfully updated");
            }, function () {
                alert("Failed to update");
            });
        };
        return UserCtrl;
    })();
    Controllers.UserCtrl = UserCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=UserController.js.map;/// <reference path="../../references.ts" />
var App;
(function (App) {
    angular.module("torpedo", ["angular-jwt", "angular-storage", "ui.router", "LocalStorageModule", "permission"])
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
        })
            .state("user", {
            url: "/users/:username",
            controller: Controllers.UserCtrl,
            controllerAs: "UserCtrl",
            templateUrl: "partials/user.html",
            data: {
                requiresLogin: true,
                permissions: {
                    only: ["user"],
                    redirectTo: "home"
                }
            }
        });
        $urlRouterProvider.otherwise("/");
        $httpProvider.interceptors.push(function ($rootScope, $q, store) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    if (localStorage.getItem("jwt") !== null) {
                        config.headers["Authorization"] = "Bearer " + localStorage.getItem("jwt").substring(1, localStorage.getItem("jwt").length - 1);
                    }
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
        .run(function (jwtHelper, store, Permission, $state) {
        Permission.defineRole("user", function ($stateParams) {
            var user = jwtHelper.decodeToken(store.get("jwt"));
            if ($stateParams["username"] === user["username"]) {
                return true;
            }
            else {
                return false;
            }
        });
    })
        .controller("AppCtrl", ["$location", "$scope", Controllers.AppCtrl])
        .controller("HomeCtrl", ["$http", "store", "jwtHelper", Controllers.HomeCtrl])
        .controller("LoginCtrl", ["$http", "store", "$state", Controllers.LoginCtrl])
        .controller("RegCtrl", ["$http", "store", "$state", Controllers.RegCtrl])
        .controller("UserCtrl", ["$http", "$location", Controllers.UserCtrl]);
})(App || (App = {}));
//# sourceMappingURL=app.js.map