/// <reference path="../../../references.ts" />
module Controllers {
  export class UserCtrl {
    http: angular.IHttpService;
    state: angular.ui.IStateService;
    isEdit: boolean;
    mdToast: angular.material.IToastService;
    user;
    constructor($http: angular.IHttpService, $state: angular.ui.IStateService, $mdToast: angular.material.IToastService) {
      this.http = $http;
      this.isEdit = false;
      this.state = $state;
      this.mdToast = $mdToast;
      $http({
        url: "/users/" + this.state.params["username"],
        method: "GET"
      }).then((user) => {
        this.user = user.data;
      }, (err) => {
        // error handling
      });
    }

    update() {
      this.http({
        url: "/users/" + this.state.params["username"],
        method: "PUT",
        data: this.user
      }).then(() => {
        this.mdToast.show(
          this.mdToast.simple()
            .content("Updated!")
            .position("top")
            .hideDelay(1000)
        );
        this.isEdit = false;
      }, () => {
        this.mdToast.show(
          this.mdToast.simple()
            .content("Failed to update!")
            .hideDelay(1000)
        );
      });
    }

  }
}
