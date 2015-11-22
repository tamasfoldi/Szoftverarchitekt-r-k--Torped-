/// <reference path="../../references.ts" />
var App;
(function (App) {
    angular.module("torpedo", ["angular-jwt", "angular-storage", "ui.router", "LocalStorageModule", "permission", "ngMaterial", "focus-if", "ngMessages"])
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
        .controller("UserCtrl", ["$http", "$state", "$mdToast", Controllers.UserCtrl])
        .controller("MenuCtrl", ["$state", "store", Controllers.MenuCtrl])
        .directive("sidenav", function () {
        return {
            restrict: "E",
            transclude: true,
            scope: {},
            controller: Controllers.MenuCtrl,
            controllerAs: "MenuCtrl",
            templateUrl: "/partials/sidenav.html"
        };
    });
})(App || (App = {}));
//# sourceMappingURL=app.js.map