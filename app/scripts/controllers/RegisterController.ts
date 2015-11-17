/// <reference path="../../../references.ts" />
module Controllers {
  export class RegCtrl {
    http: angular.IHttpService;
    store: angular.a0.storage.IStoreService;
    state: angular.ui.IStateService;
    user: Model.IUser;
    constructor($http: angular.IHttpService, store: angular.a0.storage.IStoreService, $state: angular.ui.IStateService) {
      this.http = $http;
      this.state = $state;
      this.store = store;
    }

    register() {
      this.http({
        url: "/users",
        method: "POST",
        data: this.user
      }).then((response) => {
        this.store.set("jwt", response.data["id_token"]); // care
        this.state.go("home");
      }, function(error) {
        alert(error.data);
      });
    }
  }
}
