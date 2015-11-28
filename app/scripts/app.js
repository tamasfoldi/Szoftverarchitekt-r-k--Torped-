/// <reference path="../../references.ts" />
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