/// <reference path="../../../references.ts" />

module Controllers {
  export class HomeCtrl {
    http: angular.IHttpService;
    scope;
    private secret: string;
    private peerID: string;
    private remotePeerID: string;
    constructor($http: angular.IHttpService, store: angular.a0.storage.IStoreService, PeerConnect, $scope, $rootScope) {
      this.scope = $scope;
      this.http = $http;
      PeerConnect.getPeer().then((peerObject) => {
        this.scope.peerObject = peerObject;
        this.peerID = peerObject.peer.id;
        $scope.streamReady = true;
        if (!store.get("peerObject")) {
          this.secret = Math.random().toString(36).substring(10);
          store.set("peerObject", { id: this.peerID, secret: this.secret });
        } else {
          this.secret = store.get("peerObject")["secret"];
        }

        // confirm to the server that my peerID is ready to be connected to
        $http.post("/peer/confirmID", {
          id: this.peerID,
          secret: this.secret
        }).success((res) => {
          console.log(res);

        }).error((data, status) => {
          console.log("Failed ", data, status);
          $scope.peerError = data.error;
        });

        // setup local game listeners so that we can send our events
        // attachLocalListeners();


        $rootScope.$on("callFailed", (event, error) => {
          console.log("Call failed: ", error, error.message);
          $scope.peerError = error.message;
          $scope.$apply();
        });

        $rootScope.$on("peerConnectionReceived", (event, connection) => {
          console.log("Peer DataConnection received", connection);
          $scope.peerDataConnection = connection;

          // attachReceiptListeners();

          $scope.connected = true;
          this.remotePeerID = connection.peer;
          $scope.peerError = null;

          $scope.$apply();
        });

        $rootScope.$on("peerStreamReceived", (event, objURL) => {
          console.log("Peer MediaStream received!", objURL);
          $scope.peerURL = objURL;

          // gameBtn.click();
          $scope.$apply();
        });

        $rootScope.$on("callEnded", (event, callObject) => {
          console.log("Peer Disconnected!", callObject);
          this.remotePeerID = "";

          if ($scope.playing) {
            // window.lose(false);
            $scope.gameWon = true;
          }

          $scope.gameStartCount = 0;
          $scope.connected = false;
          $scope.playing = false;
          $scope.waiting = false;
          $scope.otherWaiting = false;

          $http.post("/peer/endCall", { id: this.peerID, secret: this.secret }).success(function(res) {
            console.log(res);
            this.remotePeerID = null;

            $scope.peerError = null;
          }).error((data, status) => {
            console.log("Failed ", data, status);

            $scope.peerError = data.error;
          });
        });
      });
    }

    endCall() {
      this.scope.peerObject.endCall();
    };

    callRequestedPeer() {
      if (this.remotePeerID) {
        this.http.post("/peer/callPeer", {
          id: this.peerID,
          callee_id: this.remotePeerID,
          secret: this.secret
        }).success((res) => {
          console.log(res);

          this.remotePeerID = res["peerID"];
          this.scope.peerError = null;
          this.callPeer(this.scope.peerObject);

        }).error((data, status) => {
          console.log("Failed ", data, status);
          this.scope.peerError = data.error;
        });
      }
    }

    callRandomPeer() {
      this.http.post("/peer/callRandom", {
        id: this.peerID,
        secret: this.secret
      }).success((res) => {
        console.log(res);
        this.remotePeerID = res["peerID"];
        this.scope.peerError = null;
        this.callPeer(this.scope.peerObject);

      }).error((data, status) => {
        console.log("Failed ", data, status);
        this.scope.peerError = data.error;
      });
    }

    callPeer(peerObject) {
      this.scope.peerDataConnection = peerObject.makeCall(this.remotePeerID);

      this.scope.peerDataConnection.on("open", () => {
        // attachReceiptListeners();

        this.scope.peerError = null;
        this.scope.connected = true;
        // gameBtn.click();

        this.scope.$apply();
      });

      this.scope.peerDataConnection.on("error", (err) => {
        console.log("Failed to connect to given peerID", err);
      });
    }
  }
}
