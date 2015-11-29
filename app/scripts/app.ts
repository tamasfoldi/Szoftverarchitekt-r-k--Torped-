/// <reference path="../../references.ts" />
module App {
    angular.module("torpedo", ["angular-jwt", "angular-storage", "ui.router", "LocalStorageModule", "permission", "ngMaterial", "focus-if", "ngMessages", "btford.socket-io"])
        .config(($urlRouterProvider: angular.ui.IUrlRouterProvider, jwtInterceptorProvider: angular.jwt.IJwtInterceptor, $httpProvider: angular.IHttpProvider,
            $stateProvider: angular.ui.IStateProvider) => {
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
        .controller("HomeCtrl", ["$http", "store", "PeerConnect", "$scope", "$rootScope", "socket", Controllers.HomeCtrl])
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
        .factory("PeerConnect", ["$q", "$rootScope", "$location", "store",
            ($q, $rootScope, $location, store) => {
                var deferred = $q.defer();
                // var peerKey = "7k99lrngvwle4s4i";
                var stunURL = "stun:stun.l.google.com:19302";
                var existingConn;

                function _resolvePeer(peer) {
                    var peerObject = {
                        peer: peer,

                        // connects to the given remotePeerId -- returns a DataConnection object
                        makeConnection: function(remotePeerId) {

                            console.log("Initiating a data connection to: ", remotePeerId);

                            var connection = peer.connect(remotePeerId);
                            _setupConnEvents(connection);

                            return existingConn;
                        },

                        // closes the existing call and connection
                        endConnection: function() {
                            _endExistingConnections();
                        },

                        disconnect: () => {
                            peer.disconnect();
                        },

                        reconnect: () => {
                            peer.reconnect();
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
                    // when either you or the other ends the conn
                    // conn.on("data", this.scope.messagehandler);
                    // conn.on("data", function (data) {
                    //    console.log("Incoming data: ", data);
                    // });

                    conn.on("close", function() {
                        console.log("You have been disconnected from ", existingConn);
                        $rootScope.$emit("connectionEnded", existingConn);

                        // hang up on any existing connections if present
                        _endExistingConnections();
                    });

                    conn.on("error", function(err) {
                        console.log("Connection Error: ", err);
                        _endExistingConnections();
                    });
                }

                var peer = new Peer(store.get("username"), {
                    host: $location.host(), path: "/", port: 3000, debug: 3, config: {
                        "iceServers": [{ url: stunURL } // pass in optional STUN and TURN server for maximum network compatibility
                        ]
                    }
                });

                peer.on("open", function() {
                    _resolvePeer(peer);
                });

                // receiving a data connection
                peer.on("connection", function(connection) {
                    console.log("Answering a connection!", connection);
                    _setupConnEvents(connection);
                    $rootScope.$emit("peerConnectionReceived", connection);
                });

                peer.on("error", function(err) {
                    console.log("ERROR! Couldn\"t connect to given peer");

                    $rootScope.$emit("connectFailed", err);
                });

                return {
                    getPeer: function() {
                        return deferred.promise;
                    }
                };

            }])
        .factory("socket", (socketFactory) => {
            return socketFactory();
        })
        .run(($window: angular.IWindowService, store: angular.a0.storage.IStoreService) => {
            $window.onbeforeunload = () => {
                store.remove("secret");
            };
        });
}
