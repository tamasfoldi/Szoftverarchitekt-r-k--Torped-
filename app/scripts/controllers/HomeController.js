/// <reference path="../../../references.ts" />
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
//# sourceMappingURL=HomeController.js.map