/// <reference path="../../../references.ts" />
//# sourceMappingURL=IUser.js.map;/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var AppCtrl = (function () {
        function AppCtrl($location, $scope) {
            this.pageTitle = "";
            $scope.$on("$routeChangeSuccess", function (e, nextRoute) {
                if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
                    this.pageTitle = nextRoute.$$route.pageTitle + " | Torpedo";
                }
            });
        }
        return AppCtrl;
    })();
    Controllers.AppCtrl = AppCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=AppController.js.map;/// <reference path="../../../references.ts" />
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
                _this.peerID = store.get("username");
                _this.peerID = peerObject.peer.id;
                $scope.streamReady = true;
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
                    console.log(res);
                }).error(function (data, status) {
                    console.log("Failed ", data, status);
                    $scope.peerError = data.error;
                });
                $rootScope.$on("callFailed", function (event, error) {
                    console.log("Call failed: ", error, error.message);
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
                $rootScope.$on("peerStreamReceived", function (event, objURL) {
                    console.log("Peer MediaStream received!", objURL);
                    $scope.peerURL = objURL;
                    $scope.$apply();
                });
                $rootScope.$on("callEnded", function (event, callObject) {
                    console.log("Peer Disconnected!", callObject);
                    _this.remotePeerID = "";
                    if ($scope.playing) {
                        $scope.gameWon = true;
                    }
                    $scope.gameStartCount = 0;
                    $scope.connected = false;
                    $scope.playing = false;
                    $scope.waiting = false;
                    $scope.otherWaiting = false;
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
        HomeCtrl.prototype.endCall = function () {
            this.scope.peerObject.endCall();
        };
        ;
        HomeCtrl.prototype.callRequestedPeer = function () {
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
                    _this.callPeer(_this.scope.peerObject);
                }).error(function (data, status) {
                    console.log("Failed ", data, status);
                    _this.scope.peerError = data.error;
                });
            }
        };
        HomeCtrl.prototype.callRandomPeer = function () {
            var _this = this;
            this.http.post("/peer/callRandom", {
                id: this.peerID,
                secret: this.secret
            }).success(function (res) {
                console.log(res);
                _this.remotePeerID = res["peerID"];
                _this.scope.peerError = null;
                _this.callPeer(_this.scope.peerObject);
            }).error(function (data, status) {
                console.log("Failed ", data, status);
                _this.scope.peerError = data.error;
            });
        };
        HomeCtrl.prototype.callPeer = function (peerObject) {
            var _this = this;
            this.scope.peerDataConnection = peerObject.makeCall(this.remotePeerID);
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
        return HomeCtrl;
    })();
    Controllers.HomeCtrl = HomeCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=HomeController.js.map;/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var LoginCtrl = (function () {
        function LoginCtrl($http, store, $state) {
            this.http = $http;
            this.state = $state;
            this.store = store;
        }
        LoginCtrl.prototype.login = function () {
            var _this = this;
            this.http({
                url: "/sessions/create",
                method: "POST",
                data: this.user
            }).then(function (response) {
                _this.store.set("jwt", response.data["id_token"]);
                _this.store.set("username", _this.user.username);
                _this.state.go("user", { username: _this.user.username });
            }, function (error) {
                alert(error.data.message);
            });
        };
        return LoginCtrl;
    })();
    Controllers.LoginCtrl = LoginCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=LoginController.js.map;/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var MenuCtrl = (function () {
        function MenuCtrl($state, store) {
            this.state = $state;
            this.store = store;
        }
        return MenuCtrl;
    })();
    Controllers.MenuCtrl = MenuCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=MenuController.js.map;/// <reference path="../../../references.ts" />
var Controllers;
(function (Controllers) {
    var RegCtrl = (function () {
        function RegCtrl($http, store, $state) {
            this.http = $http;
            this.state = $state;
            this.store = store;
        }
        RegCtrl.prototype.register = function () {
            var _this = this;
            this.http({
                url: "/users",
                method: "POST",
                data: this.user
            }).then(function (response) {
                _this.store.set("jwt", response.data["id_token"]);
                _this.state.go("user", { username: _this.user.username });
            }, function (error) {
                alert(error.data.message);
            });
        };
        return RegCtrl;
    })();
    Controllers.RegCtrl = RegCtrl;
})(Controllers || (Controllers = {}));
//# sourceMappingURL=RegisterController.js.map;/// <reference path="../../../references.ts" />
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
//# sourceMappingURL=UserController.js.map;/// <reference path="../../references.ts" />
var App;
(function (App) {
    angular.module("torpedo", ["angular-jwt", "angular-storage", "ui.router", "LocalStorageModule", "permission", "ngMaterial", "focus-if", "ngMessages", "btford.socket-io"])
        .config(function ($urlRouterProvider, jwtInterceptorProvider, $httpProvider, $stateProvider) {
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
        $httpProvider.interceptors.push(function ($rootScope, $q, store) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    if (localStorage.getItem("jwt") !== null) {
                        config.headers["Authorization"] = "Bearer " + localStorage.getItem("jwt").substring(1, localStorage.getItem("jwt").length - 1);
                    }
                    return config;
                },
                response: function (response) {
                    if (response.status === 401) {
                    }
                    return response || $q.when(response);
                }
            };
        });
    })
        .run(function ($rootScope, $state, store, jwtHelper) {
        $rootScope.$on("$stateChangeStart", function (e, to) {
            if (to.data && to.data.requiresLogin) {
                if (!store.get("jwt") || jwtHelper.isTokenExpired(store.get("jwt"))) {
                    e.preventDefault();
                    $state.go("login");
                }
            }
        });
    })
        .run(function (jwtHelper, store, Permission, $state) {
        Permission.defineRole("user", function ($stateParams) {
            var user = jwtHelper.decodeToken(store.get("jwt"));
            if ($stateParams["username"] === user["username"]) {
                return true;
            }
            else {
                return false;
            }
        });
    })
        .controller("AppCtrl", ["$location", "$scope", Controllers.AppCtrl])
        .controller("HomeCtrl", ["$http", "store", "PeerConnect", "$scope", "$rootScope", "socket", Controllers.HomeCtrl])
        .controller("LoginCtrl", ["$http", "store", "$state", Controllers.LoginCtrl])
        .controller("RegCtrl", ["$http", "store", "$state", Controllers.RegCtrl])
        .controller("UserCtrl", ["$http", "$state", "$mdToast", Controllers.UserCtrl])
        .controller("MenuCtrl", ["$state", "store", Controllers.MenuCtrl])
        .directive("sidenav", function () {
        return {
            restrict: "E",
            transclude: true,
            scope: {},
            controller: Controllers.MenuCtrl,
            controllerAs: "MenuCtrl",
            templateUrl: "/partials/sidenav.html"
        };
    })
        .factory("PeerConnect", ["$q", "$rootScope", "$sce", "$location", "store",
        function ($q, $rootScope, $sce, $location, store) {
            var deferred = $q.defer();
            var stunURL = "stun:stun.l.google.com:19302";
            var existingCall;
            var existingConn;
            function _resolvePeer(peer, peerLocalStream, blobURL) {
                var peerObject = {
                    peer: peer,
                    peerLocalStream: peerLocalStream,
                    videoURL: blobURL,
                    makeCall: function (remotePeerId) {
                        console.log("Initiating a call to: ", remotePeerId);
                        var call = peer.call(remotePeerId, peerLocalStream);
                        _setupCallEvents(call);
                        console.log("Initiating a data connection to: ", remotePeerId);
                        existingConn = peer.connect(remotePeerId, peerLocalStream);
                        existingConn.on("close", function () {
                            console.log("Data connection closed!");
                        });
                        return existingConn;
                    },
                    endCall: function () {
                        _endExistingCalls();
                    }
                };
                deferred.resolve(peerObject);
            }
            function _endExistingCalls() {
                if (existingCall) {
                    existingCall.close();
                }
                if (existingConn) {
                    existingConn.close();
                }
            }
            function _setupCallEvents(call) {
                _endExistingCalls();
                existingCall = call;
                call.on("stream", function (stream) {
                    var remoteBlobURL = $sce.trustAsResourceUrl(URL.createObjectURL(stream));
                    $rootScope.$emit("peerStreamReceived", remoteBlobURL);
                });
                call.on("close", function () {
                    console.log("You have been disconnected from ", existingCall);
                    $rootScope.$emit("callEnded", existingCall);
                    _endExistingCalls();
                });
                call.on("error", function (err) {
                    console.log("Call Error: ", err);
                    _endExistingCalls();
                });
            }
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            navigator.getUserMedia({ audio: true, video: false }, function (stream) {
                var peerLocalStream = stream;
                var blobURL = $sce.trustAsResourceUrl(URL.createObjectURL(stream));
                var peer = new Peer({ host: $location.host(), path: "/", port: 3000, debug: 3, config: { "iceServers": [{ url: stunURL }
                        ] } });
                peer.on("open", function () { _resolvePeer(peer, peerLocalStream, blobURL); });
                peer.on("call", function (call) {
                    console.log("Answering a call!");
                    call.answer(peerLocalStream);
                    _setupCallEvents(call);
                });
                peer.on("connection", function (connection) {
                    console.log("Answering a connection!", connection);
                    $rootScope.$emit("peerConnectionReceived", connection);
                });
                peer.on("error", function (err) {
                    console.log("ERROR! Couldn\"t connect to given peer");
                    $rootScope.$emit("callFailed", err);
                });
                console.log("Peer Connect: Stream ready: ", stream);
            }, function () { deferred.reject("Failed to getUserMedia!"); });
            return {
                getPeer: function () {
                    return deferred.promise;
                }
            };
        }])
        .factory("socket", function (socketFactory) {
        return socketFactory();
    })
        .run(function ($window, store) {
        $window.onbeforeunload = function () {
            store.remove("secret");
        };
    });
})(App || (App = {}));
//# sourceMappingURL=app.js.map