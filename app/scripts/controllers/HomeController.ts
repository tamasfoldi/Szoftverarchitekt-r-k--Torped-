/// <reference path="../../../references.ts" />

module Controllers {
    export class HomeCtrl {
        http: angular.IHttpService;
        scope;
        private secret: string;
        private peerID: string;
        private remotePeerID: string;
        private onlineUsers: number;
        private peerIDs;

        constructor($http: angular.IHttpService, store: angular.a0.storage.IStoreService, PeerConnect, $scope, $rootScope, socket) {
            this.scope = $scope;
            this.http = $http;

            socket.on("peer_pool", (data) => {
                this.onlineUsers = data.length;
                this.peerIDs = data;
            });

            PeerConnect.getPeer().then((peerObject) => {
                this.scope.peerObject = peerObject;
                this.peerID = peerObject.peer.id;
                // $scope.streamReady = true;
                if (store.get("secret")) {
                    this.secret = store.get("secret");
                } else {
                    this.secret = Math.random().toString(36).substring(10);
                    store.set("secret", this.secret);
                }

                // confirm to the server that my peerID is ready to be connected to
                $http.post("/peer/confirmID", {
                    id: this.peerID,
                    secret: this.secret
                }).success((res) => {
                    console.log("Confirmed ", res);

                }).error((data, status) => {
                    console.log("Failed ", data, status);
                    $scope.peerError = data.error;
                });

                // setup local game listeners so that we can send our events
                // attachLocalListeners();


                $rootScope.$on("connectFailed", (event, error) => {
                    console.log("Connection failed: ", error, error.message);
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

                $rootScope.$on("connectionEnded", (event, connectionObject) => {
                    console.log("Peer Disconnected!", connectionObject);
                    this.remotePeerID = "";

                    $scope.connected = false;

                    $http.post("/peer/endCall", {id: this.peerID, secret: this.secret}).success(function (res) {
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

        endConnection() {
            this.scope.peerObject.endConnection();
            this.scope.connected = false;
        }

        connectToRequestedPeer() { // t TODO rename
            if (this.remotePeerID) {
                this.http.post("/peer/callPeer", {
                    id: this.peerID,
                    callee_id: this.remotePeerID,
                    secret: this.secret
                }).success((res) => {
                    console.log(res);

                    this.remotePeerID = res["peerID"];
                    this.scope.peerError = null;
                    this.connectToPeer(this.scope.peerObject);

                }).error((data, status) => {
                    console.log("Failed ", data, status);
                    this.scope.peerError = data.error;
                });
            }
        }

        connectToRandomPeer() { // t TODO Rename
            this.http.post("/peer/callRandom", {
                id: this.peerID,
                secret: this.secret
            }).success((res) => {
                console.log(res);
                this.remotePeerID = res["peerID"];
                this.scope.peerError = null;
                this.connectToPeer(this.scope.peerObject);

            }).error((data, status) => {
                console.log("Failed ", data, status);
                this.scope.peerError = data.error;
            });
        }

        connectToPeer(peerObject) {
            this.scope.peerDataConnection = peerObject.makeConnection(this.remotePeerID);

            this.scope.peerDataConnection.on("open", () => {
                // attachReceiptListeners();
                this.scope.peerDataConnection.on("data", function (data) {
                    console.log("Incoming data: ", data);
                });


                this.scope.peerError = null;
                this.scope.connected = true;
                // gameBtn.click();

                this.scope.$apply();
            });

            this.scope.peerDataConnection.on("error", (err) => {
                console.log("Failed to connect to given peerID", err);
            });
        }

        sendHi() {
            this.scope.peerDataConnection.send("Hi!");
        }
    }
}
