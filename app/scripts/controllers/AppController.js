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
//# sourceMappingURL=AppController.js.map