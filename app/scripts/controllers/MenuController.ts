/// <reference path="../../../references.ts" />

module Controllers {
  export class MenuCtrl {
    state: angular.ui.IStateService;
    store: angular.a0.storage.IStoreService;
    constructor($state: angular.ui.IStateService, store: angular.a0.storage.IStoreService) {
      this.state = $state;
      this.store = store;
    }
  }
}
