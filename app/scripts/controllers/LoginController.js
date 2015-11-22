/// <reference path="../../../references.ts" />
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
                _this.store.set("username", _this.user.username);
                _this.state.go("user", { username: _this.user.username });
            }, function (error) {
                alert(error.data);
            });
        };
        return LoginCtrl;
    })();
    Controllers.LoginCtrl = LoginCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=LoginController.js.map