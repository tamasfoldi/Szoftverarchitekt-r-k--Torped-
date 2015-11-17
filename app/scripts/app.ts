/// <reference path="../../references.ts" />
module App {
  angular.module("torpedo", ["angular-jwt", "angular-storage", "ui.router", "LocalStorageModule"])
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
        });
      $urlRouterProvider.otherwise("/");

      $httpProvider.interceptors.push(($rootScope, $q, store: angular.a0.storage.IStoreService) => {
        return {
          request: function(config) {
            config.headers = config.headers || {};
              config.headers["Authorization"] = "Bearer " + localStorage.getItem("jwt").substring(1, localStorage.getItem("jwt").length - 1);
            return config;
          },
          response: function(response) {
            if (response.status === 401) {
              // handle the case where the user is not authenticated
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
    .controller("AppCtrl", ["$location", "$scope", Controllers.AppCtrl])
    .controller("HomeCtrl", ["$http", "store", "jwtHelper", Controllers.HomeCtrl])
    .controller("LoginCtrl", ["$http", "store", "$state", Controllers.LoginCtrl])
    .controller("RegCtrl", ["$http", "store", "$state", Controllers.RegCtrl]);
}
