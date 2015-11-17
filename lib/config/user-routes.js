var express = require('express');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var config = require('./config');
var path = require('path');

var app = module.exports = express.Router();

// XXX: This should be a database of users :).
var users = [{
  id: 1,
  username: 'gonto',
  password: 'gonto'
}];

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), "torpedo", { expiresIn: 60 * 5 });
}

app.post('/users', function (req, res) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }
  if (_.find(users, { username: req.body.username })) {
    return res.status(400).send("A user with that username already exists");
  }

  var profile = _.pick(req.body, 'username', 'password', 'email');
  profile.id = _.max(users, 'id').id + 1;
  users.push(profile);

  res.status(201).send({
    id_token: createToken(profile)
  });
});

app.post('/sessions/create', function (req, res) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send("You must send the username and the password");
  }

  var user = _.find(users, { username: req.body.username });
  if (!user) {
    return res.status(401).send("The username or password don't match");
  }

  if (!user.password === req.body.password) {
    return res.status(401).send("The username or password don't match");
  }

  res.status(201).send({
    id_token: createToken(user)
  });
});

// angular Routes
app.get("/partials/*", function (req, res) {
  var requestedView = path.join("./", req.url);
  res.render(requestedView);
});

app.get("/*", function (req, res) {
  if (req.user) {
    res.cookie("user", JSON.stringify(req.user.user_info));
  }
  res.render("index.html");
});