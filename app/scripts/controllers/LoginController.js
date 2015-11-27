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
                _this.user.lastLogin = Date.now();
                _this.http({
                    url: "/users/" + _this.user.username,
                    method: "PUT",
                    data: _this.user
                }).then(function () {
                    _this.store.set("jwt", response.data["id_token"]);
                    _this.store.set("username", _this.user.username);
                    _this.state.go("user", { username: _this.user.username });
                });
            }, function (error) {
                alert(error.data.message);
            });
        };
        return LoginCtrl;
    })();
    Controllers.LoginCtrl = LoginCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=LoginController.js.map