/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var UserCtrl = (function () {
        function UserCtrl($http, $state, $mdToast) {
            var _this = this;
            this.http = $http;
            this.isEdit = false;
            this.state = $state;
            this.mdToast = $mdToast;
            $http({
                url: "/users/" + this.state.params["username"],
                method: "GET"
            }).then(function (user) {
                _this.user = user.data;
            }, function (err) {
                // error handling
            });
        }
        UserCtrl.prototype.update = function () {
            var _this = this;
            this.http({
                url: "/users/" + this.state.params["username"],
                method: "PUT",
                data: this.user
            }).then(function () {
                _this.mdToast.show(_this.mdToast.simple()
                    .content("Updated!")
                    .position("top")
                    .hideDelay(1000));
                _this.isEdit = false;
            }, function () {
                _this.mdToast.show(_this.mdToast.simple()
                    .content("Failed to update!")
                    .hideDelay(1000));
            });
        };
        return UserCtrl;
    })();
    Controllers.UserCtrl = UserCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=UserController.js.map