/// <reference path="../../../references.ts" />

module Controllers {
  export class HomeCtrl {
    jwt: string;
    decodedJwt: angular.jwt.JwtToken;
    http: angular.IHttpService;
    response;
    api: string;
    constructor($http: angular.IHttpService, store: angular.a0.storage.IStoreService, jwtHelper: angular.jwt.IJwtHelper) {
      this.jwt = store.get("jwt");
      this.decodedJwt = this.jwt && jwtHelper.decodeToken(this.jwt);
      this.http = $http;
    }
    callAnonymousApi() {
      this.callApi("Anonymous", "/api/random-quote");
    }

    callSecuredApi() {
      this.callApi("Secured", "/api/protected/random-quote");
    }

    private callApi(type: string, url: string) {
      this.response = null;
      this.api = type;
      this.http({
        url: url,
        method: "GET"
      }).then((quote: angular.IHttpPromiseCallbackArg<{}>) => {
        this.response = quote.data;
      }, (error) => {
        this.response = error.data;
      });
    }
  }
}
