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
            this.store = store;
            $scope.$on("$destroy", function () {
                $scope.peerObject.endConnection();
                $scope.peerObject.peer.disconnect();
            });
            socket.on("peer_pool", function (data) {
                _this.onlineUsers = data.length;
                _this.peerIDs = data;
            });
            document.addEventListener('gameOver', function (event) {
                var _this = this;
                $http.put('/users/gameStat/' + store.get("username"), {
                    gameResult: event.detail.gameResult,
                    gameLength: event.detail.gameLength
                }).success(function (res) {
                    console.log("Stats updated ", res);
                }).error(function (data, status) {
                    console.log("Failed to update stats ", data, status);
                    _this.scope.peerError = data.error;
                });
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
                    _this.remotePeerID = connection.peer;
                    game = new Game(_this.scope.peerDataConnection);
                    $scope.peerDataConnection.on("data", handleMessage);
                    $scope.peerError = null;
                    $scope.$apply();
                });
                $rootScope.$on("connectionEnded", function (event, connectionObject) {
                    console.log("Peer Disconnected!", connectionObject);
                    _this.remotePeerID = "";
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
                game = new Game(_this.scope.peerDataConnection);
                _this.scope.peerDataConnection.on("data", handleMessage);
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
                _this.user.lastLogin = Date.now();
                _this.http({
                    url: "/users/" + _this.user.username,
                    method: "PUT",
                    data: _this.user
                }).then(function () {
                    _this.store.set("jwt", response.data["id_token"]);
                    _this.store.set("username", _this.user.username);
                    _this.state.go("user", { username: _this.user.username });
                });
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
                _this.store.set("username", _this.user.username);
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
            templateUrl: "partials/home.html",
            data: {
                requiresLogin: true
            }
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
        .factory("PeerConnect", ["$q", "$rootScope", "$location", "store",
        function ($q, $rootScope, $location, store) {
            var deferred = $q.defer();
            var stunURL = "stun:stun.l.google.com:19302";
            var existingConn;
            function _resolvePeer(peer) {
                var peerObject = {
                    peer: peer,
                    makeConnection: function (remotePeerId) {
                        console.log("Initiating a data connection to: ", remotePeerId);
                        var connection = peer.connect(remotePeerId);
                        _setupConnEvents(connection);
                        return existingConn;
                    },
                    endConnection: function () {
                        _endExistingConnections();
                    }
                };
                deferred.resolve(peerObject);
            }
            function _endExistingConnections() {
                if (existingConn) {
                    existingConn.close();
                    ereaseGame();
                }
            }
            function _setupConnEvents(conn) {
                _endExistingConnections();
                existingConn = conn;
                conn.on("close", function () {
                    console.log("You have been disconnected from ", existingConn);
                    $rootScope.$emit("connectionEnded", existingConn);
                    _endExistingConnections();
                });
                conn.on("error", function (err) {
                    console.log("Connection Error: ", err);
                    _endExistingConnections();
                });
            }
            var peer = new Peer(store.get("username"), {
                host: $location.host(), path: "/", port: 3000, debug: 3, config: {
                    "iceServers": [{ url: stunURL }
                    ]
                }
            });
            peer.on("open", function () {
                _resolvePeer(peer);
            });
            peer.on("connection", function (connection) {
                console.log("Answering a connection!", connection);
                _setupConnEvents(connection);
                $rootScope.$emit("peerConnectionReceived", connection);
            });
            peer.on("error", function (err) {
                console.log("ERROR! Couldn\"t connect to given peer");
                $rootScope.$emit("connectFailed", err);
            });
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