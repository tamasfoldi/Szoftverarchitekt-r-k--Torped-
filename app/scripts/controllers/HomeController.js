/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var HomeCtrl = (function () {
        function HomeCtrl($http, store, PeerConnect, $scope, $rootScope, socket) {
            var _this = this;
            this.scope = $scope;
            this.http = $http;
            socket.on("peer_pool", function (data) {
                _this.onlineUsers = data.length;
                _this.peerIDs = data;
            });
            PeerConnect.getPeer().then(function (peerObject) {
                _this.scope.peerObject = peerObject;
                _this.peerID = peerObject.peer.id;
                if (store.get("secret")) {
                    _this.secret = store.get("secret");
                }
                else {
                    _this.secret = Math.random().toString(36).substring(10);
                    store.set("secret", _this.secret);
                }
                $http.post("/peer/confirmID", {
                    id: _this.peerID,
                    secret: _this.secret
                }).success(function (res) {
                    console.log("Confirmed ", res);
                }).error(function (data, status) {
                    console.log("Failed ", data, status);
                    $scope.peerError = data.error;
                });
                $rootScope.$on("connectFailed", function (event, error) {
                    console.log("Connection failed: ", error, error.message);
                    $scope.peerError = error.message;
                    $scope.$apply();
                });
                $rootScope.$on("peerConnectionReceived", function (event, connection) {
                    console.log("Peer DataConnection received", connection);
                    $scope.peerDataConnection = connection;
                    $scope.connected = true;
                    _this.remotePeerID = connection.peer;
                    $scope.peerError = null;
                    $scope.$apply();
                });
                $rootScope.$on("connectionEnded", function (event, connectionObject) {
                    console.log("Peer Disconnected!", connectionObject);
                    _this.remotePeerID = "";
                    $scope.connected = false;
                    $http.post("/peer/endCall", { id: _this.peerID, secret: _this.secret }).success(function (res) {
                        console.log(res);
                        this.remotePeerID = null;
                        $scope.peerError = null;
                    }).error(function (data, status) {
                        console.log("Failed ", data, status);
                        $scope.peerError = data.error;
                    });
                });
            });
        }
        HomeCtrl.prototype.endConnection = function () {
            this.scope.peerObject.endConnection();
            this.scope.connected = false;
        };
        HomeCtrl.prototype.connectToRequestedPeer = function () {
            var _this = this;
            if (this.remotePeerID) {
                this.http.post("/peer/callPeer", {
                    id: this.peerID,
                    callee_id: this.remotePeerID,
                    secret: this.secret
                }).success(function (res) {
                    console.log(res);
                    _this.remotePeerID = res["peerID"];
                    _this.scope.peerError = null;
                    _this.connectToPeer(_this.scope.peerObject);
                }).error(function (data, status) {
                    console.log("Failed ", data, status);
                    _this.scope.peerError = data.error;
                });
            }
        };
        HomeCtrl.prototype.connectToRandomPeer = function () {
            var _this = this;
            this.http.post("/peer/callRandom", {
                id: this.peerID,
                secret: this.secret
            }).success(function (res) {
                console.log(res);
                _this.remotePeerID = res["peerID"];
                _this.scope.peerError = null;
                _this.connectToPeer(_this.scope.peerObject);
            }).error(function (data, status) {
                console.log("Failed ", data, status);
                _this.scope.peerError = data.error;
            });
        };
        HomeCtrl.prototype.connectToPeer = function (peerObject) {
            var _this = this;
            this.scope.peerDataConnection = peerObject.makeConnection(this.remotePeerID);
            this.scope.peerDataConnection.on("open", function () {
                // attachReceiptListeners();
                _this.scope.peerError = null;
                _this.scope.connected = true;
                _this.scope.$apply();
            });
            this.scope.peerDataConnection.on("error", function (err) {
                console.log("Failed to connect to given peerID", err);
            });
        };
        HomeCtrl.prototype.sendHi = function () {
            console.log("Sendhi: ", this.scope.peerDataConnection);
            this.scope.peerDataConnection.send("Hi2!");
        };
        return HomeCtrl;
    })();
    Controllers.HomeCtrl = HomeCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=HomeController.js.map