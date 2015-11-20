/// <reference path="../../../references.ts" />
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
//# sourceMappingURL=UserController.js.map