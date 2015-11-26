var peerPool = require('../peerPool');
var express = require('express');
var app = module.exports = express.Router();
var io = require('socket.io');


module.exports = function (app, io) {
  app.route('/peer/confirmID')
    .post(function (req, res) {
      var requestID = req.body.id;
      var secret = req.body.secret;
      var added = false;

      console.log(new Date(), 'Request to add ', requestID, ' to confirmed list...');

      if (requestID) {
        added = peerPool.confirmPeer(requestID, secret);
      }

      if (!requestID || !added) {
        console.log('Failure - Confirmed Peers List: ', peerPool.confirmedConnectedPeers);

        res.status(400).send({ error: 'The Peer ID sent to the server was invalid - try refreshing the page' });
      } else {

        console.log('Success - Confirmed Peers List: ', peerPool.confirmedConnectedPeers.length, peerPool.confirmedConnectedPeers);

        io.sockets.emit('peer_pool', peerPool.confirmedConnectedPeers);
        res.status(200).send();
      }
    });


  app.route('/peer/callPeer')
    .post(function (req, res) {
      var requestID = req.body.id;
      var secret = req.body.secret;
      var calleeID = req.body.callee_id;
      var success = false;

      console.log(new Date(), 'Request to call from [', requestID, '] to [', calleeID, ']');

      if (requestID && calleeID) {

        if (requestID === calleeID) {
          success = false;
        } else {
          success = peerPool.requestConnectPeer(requestID, calleeID, secret);
        }
      }

      if (!requestID || !calleeID || !success) {
        res.status(400).send({ error: 'Cannot connect to Peer ID: ' + calleeID });
      } else {
        io.sockets.emit('peer_pool', peerPool.confirmedConnectedPeers);
        res.status(200).send({ peerID: calleeID });
      }
    });

  app.route('/peer/callRandom')
    .post(function (req, res) {
      var requestID = req.body.id;
      var secret = req.body.secret;
      var peerID = -1;

      console.log(new Date(), 'Request to connect ', requestID, ' to RANDOM peer...');

      if (requestID) {
        peerID = peerPool.requestRandomPeer(requestID, secret);
      }

      if (!requestID || peerID === -1) {
        console.log('Failure: Can\'t get random peer for [', requestID, ']');
        res.status(400).send({ error: 'Not enough peers or invalid peer ID' });
      } else {
        console.log('Success: Connect [', requestID, '] to [', peerID, '] --> Pool of peers after: ', peerPool.confirmedConnectedPeers);

        io.sockets.emit('peer_pool', peerPool.confirmedConnectedPeers);
        res.status(200).send({ peerID: peerID });
      }
    });

  app.route('/peer/endCall')
    .post(function (req, res) {
      var requestID = req.body.id;
      var secret = req.body.secret;
      var confirmed = false;

      console.log(new Date(), 'Request to return ', requestID, ' to connected peers');

      if (requestID) {
        confirmed = peerPool.confirmPeer(requestID, secret);
      }

      if (!requestID || !confirmed) {
        res.status(400).send({ error: 'Invalid Peer ID: ' + requestID });
      }
      else {
        io.sockets.emit('peer_pool', peerPool.confirmedConnectedPeers);
        res.status(200).send();
      }
    });

};