/// <reference path="../../references.ts" />
module App {
  angular.module("torpedo", ["angular-jwt", "angular-storage", "ui.router", "LocalStorageModule", "permission", "ngMaterial", "focus-if", "ngMessages"])
    .config(($urlRouterProvider: angular.ui.IUrlRouterProvider, jwtInterceptorProvider: angular.jwt.IJwtInterceptor, $httpProvider: angular.IHttpProvider,
      $stateProvider: angular.ui.IStateProvider) => {
      $stateProvider
        .state("home", {
          url: "/",
          controller: Controllers.HomeCtrl,
          controllerAs: "HomeCtrl",
          templateUrl: "partials/home.html"
        })
        .state("login", {
          url: "/login",
          controller: Controllers.LoginCtrl,
          controllerAs: "LoginCtrl",
          templateUrl: "partials/login.html"
        })
        .state("register", {
          url: "/register",
          controller: Controllers.RegCtrl,
          controllerAs: "RegCtrl",
          templateUrl: "partials/register.html"
        })
        .state("user", {
          url: "/users/:username",
          controller: Controllers.UserCtrl,
          controllerAs: "UserCtrl",
          templateUrl: "partials/user.html",
          data: {
            requiresLogin: true,
            permissions: {
              only: ["user"],
              redirectTo: "home"
            }
          }
        });
      $urlRouterProvider.otherwise("/");

      $httpProvider.interceptors.push(($rootScope, $q, store: angular.a0.storage.IStoreService) => {
        return {
          request: function(config) {
            config.headers = config.headers || {};
            if (localStorage.getItem("jwt") !== null) {
              config.headers["Authorization"] = "Bearer " + localStorage.getItem("jwt").substring(1, localStorage.getItem("jwt").length - 1);
            }
            return config;
          },
          response: function(response) {
            if (response.status === 401) {
              // todo handle the case where the user is not authenticated
            }
            return response || $q.when(response);
          }
        };
      });
    })

    .run(($rootScope: angular.IRootScopeService, $state: angular.ui.IStateService, store: angular.a0.storage.IStoreService, jwtHelper: angular.jwt.IJwtHelper) => {
      $rootScope.$on("$stateChangeStart", function(e, to) {
        if (to.data && to.data.requiresLogin) {
          if (!store.get("jwt") || jwtHelper.isTokenExpired(store.get("jwt"))) {
            e.preventDefault();
            $state.go("login");
          }
        }
      });
    })
    .run((jwtHelper: angular.jwt.IJwtHelper, store: angular.a0.storage.IStoreService, Permission, $state: angular.ui.IStateService) => {
      Permission.defineRole("user", ($stateParams: angular.ui.IStateParamsService) => {
        var user = jwtHelper.decodeToken(store.get("jwt"));
        if ($stateParams["username"] === user["username"]) {
          return true;
        } else {
          return false;
        }
      });
    })
    .controller("AppCtrl", ["$location", "$scope", Controllers.AppCtrl])
    .controller("HomeCtrl", ["$http", "store", "PeerConnect", "$scope", "$rootScope", Controllers.HomeCtrl])
    .controller("LoginCtrl", ["$http", "store", "$state", Controllers.LoginCtrl])
    .controller("RegCtrl", ["$http", "store", "$state", Controllers.RegCtrl])
    .controller("UserCtrl", ["$http", "$state", "$mdToast", Controllers.UserCtrl])
    .controller("MenuCtrl", ["$state", "store", Controllers.MenuCtrl])
    .directive("sidenav", () => {
      return {
        restrict: "E",
        transclude: true,
        scope: {},
        controller: Controllers.MenuCtrl,
        controllerAs: "MenuCtrl",
        templateUrl: "/partials/sidenav.html"
      };
    })
    .factory("PeerConnect", ["$q", "$rootScope", "$sce", "$location",
    function ($q, $rootScope, $sce, $location) {
      var deferred = $q.defer();
      // var peerKey = "7k99lrngvwle4s4i";
      var stunURL = "stun:stun.l.google.com:19302";
      var existingCall;
      var existingConn;

      function _resolvePeer(peer, peerLocalStream, blobURL) {
        var peerObject = {
          peer: peer,
          peerLocalStream: peerLocalStream,
          videoURL: blobURL,

          // calls and connects to the given remotePeerId -- returns a DataConnection object
          makeCall: function(remotePeerId) {
            console.log("Initiating a call to: ", remotePeerId);

            var call = peer.call(remotePeerId, peerLocalStream);
            _setupCallEvents(call);

            console.log("Initiating a data connection to: ", remotePeerId);

            existingConn = peer.connect(remotePeerId, peerLocalStream);

            existingConn.on("close", function() {
              console.log("Data connection closed!");
            });

            return existingConn;
          },

          // closes the existing call and connection
          endCall: function() {
            _endExistingCalls();
          }
        };

        deferred.resolve(peerObject);
      }

      function _endExistingCalls() {
        if (existingCall) { existingCall.close(); }
        if (existingConn) { existingConn.close(); }
      }

      function _setupCallEvents (call) {
        // hang up on an existing call if present
        _endExistingCalls();

        existingCall = call;

        // wait for MediaStream on the call, then set peer video display
        call.on("stream", function(stream){
          // console.log(URL.createObjectURL(stream));
          var remoteBlobURL = $sce.trustAsResourceUrl(URL.createObjectURL(stream));
          $rootScope.$emit("peerStreamReceived", remoteBlobURL);
        });

        // when either you or the other ends the call
        call.on("close", function() {
          console.log("You have been disconnected from ", existingCall);
          $rootScope.$emit("callEnded", existingCall);

          // hang up on any existing calls if present
          _endExistingCalls();
        });

        call.on("error", function(err) {
          console.log("Call Error: ", err);
          _endExistingCalls();
        });
      }

      // compatibility shim
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      // peerJS object
      // -- Peer JS CLOUD
      // var peer = new Peer({ key: peerKey, debug: 3, config: {"iceServers": [
      //   { url: stunURL } // Pass in optional STUN and TURN server for maximum network compatibility
      // ]}});

      // navigator.getUserMedia({audio: true, video: true}, function(stream) {
      navigator.getUserMedia({audio: true, video: true}, function(stream) {
        var peerLocalStream = stream;
        var blobURL = $sce.trustAsResourceUrl(URL.createObjectURL(stream));
        var peer = new Peer({ host: $location.host(), path: "/", port: 3000, debug: 3, config: {"iceServers": [ { url: stunURL } // pass in optional STUN and TURN server for maximum network compatibility
        ]}});

        peer.on("open", function() { _resolvePeer(peer, peerLocalStream, blobURL); });

        // receiving a call -- answer automatically
        peer.on("call", function(call){
          console.log("Answering a call!");

          call.answer(peerLocalStream);
          _setupCallEvents(call);
        });

        // receiving a data connection
        peer.on("connection", function(connection) {
          console.log("Answering a connection!", connection);
          $rootScope.$emit("peerConnectionReceived", connection);
        });

        peer.on("error", function(err){
          console.log("ERROR! Couldn\"t connect to given peer");

          $rootScope.$emit("callFailed", err);
        });

        // as convenience, add our localStream to global window object
        console.log("Peer Connect: Stream ready: ", stream);
        // window.localStream = stream;

      }, function(){ deferred.reject("Failed to getUserMedia!"); });


      return {
        getPeer: function() {
          return deferred.promise;
        }
      };

  }]);
}
