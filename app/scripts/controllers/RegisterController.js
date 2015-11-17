/// <reference path="../../../references.ts" />
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
//# sourceMappingURL=RegisterController.js.map