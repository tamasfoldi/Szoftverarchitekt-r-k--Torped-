/// <reference path="../../../references.ts" />
module Controllers {
  export class UserCtrl {
    http: angular.IHttpService;
    state: angular.ui.IStateService;
    user;
    constructor($http: angular.IHttpService, $state: angular.ui.IStateService) {
      this.http = $http;
      this.state = $state;
      $http({
        url: "/users/" + this.state.params["username"],
        method: "GET"
      }).then( (user) => {
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
        alert("Successfully updated");
      }, () => {
        alert("Failed to update");
      });
    }

  }
}
