/// <reference path="../../references.ts" />
module App {
  angular.module("torpedo", ["angular-jwt", "angular-storage", "ui.router", "LocalStorageModule", "permission"])
    .config(($urlRouterProvider: angular.ui.IUrlRouterProvider, jwtInterceptorProvider: angular.jwt.IJwtInterceptor, $httpProvider: angular.IHttpProvider,
      $stateProvider: angular.ui.IStateProvider) => {
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

      $httpProvider.interceptors.push(($rootScope, $q, store: angular.a0.storage.IStoreService) => {
        return {
          request: function(config) {
            config.headers = config.headers || {};
            if (localStorage.getItem("jwt") !== null) {
              config.headers["Authorization"] = "Bearer " + localStorage.getItem("jwt").substring(1, localStorage.getItem("jwt").length - 1);
            }
            return config;
          },
          response: function(response) {
            if (response.status === 401) {
              // todo handle the case where the user is not authenticated
            }
            return response || $q.when(response);
          }
        };
      });
    })

    .run(($rootScope: angular.IRootScopeService, $state: angular.ui.IStateService, store: angular.a0.storage.IStoreService, jwtHelper: angular.jwt.IJwtHelper) => {
      $rootScope.$on("$stateChangeStart", function(e, to) {
        if (to.data && to.data.requiresLogin) {
          if (!store.get("jwt") || jwtHelper.isTokenExpired(store.get("jwt"))) {
            e.preventDefault();
            $state.go("login");
          }
        }
      });
    })
    .run((jwtHelper: angular.jwt.IJwtHelper, store: angular.a0.storage.IStoreService, Permission, $state: angular.ui.IStateService) => {
      Permission.defineRole("user", ($stateParams: angular.ui.IStateParamsService) => {
        var user = jwtHelper.decodeToken(store.get("jwt"));
        if ($stateParams["username"] === user["username"]) {
          return true;
        } else {
          return false;
        }
      });
    })
    .controller("AppCtrl", ["$location", "$scope", Controllers.AppCtrl])
    .controller("HomeCtrl", ["$http", "store", "jwtHelper", Controllers.HomeCtrl])
    .controller("LoginCtrl", ["$http", "store", "$state", Controllers.LoginCtrl])
    .controller("RegCtrl", ["$http", "store", "$state", Controllers.RegCtrl])
    .controller("UserCtrl", ["$http", "$location", Controllers.UserCtrl]);
}
