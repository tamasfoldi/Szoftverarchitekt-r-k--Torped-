/// <reference path="../../../references.ts" />

module Controllers {
  export class AppCtrl {
    pageTitle: string = "";

    constructor($location: angular.ILocationService, $scope: angular.IScope) {
      $scope.$on("$routeChangeSuccess", function(e: angular.IAngularEvent, nextRoute) {
        if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
          this.pageTitle = nextRoute.$$route.pageTitle + " | Torpedo";
        }
      });
    }
  }
}
