var express = require('express');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var config = require('./config');
var path = require('path');
var User = require("../models/userSchema.js");
var app = module.exports = express.Router();
var passport = require("passport");

function createToken(user) {
  return jwt.sign(_.omit(user, 'password'), "torpedo", { expiresIn: 60 * 60 });
}

app.post('/users', function (req, res, next) {
  var newUser = new User(req.body);

  newUser.provider = "local";
  newUser.save(function (err) {
    if (err) {
      return res.status(400).send(err);
    }
    req.logIn(newUser, function (error) {
      if (error) {
        return next(error);
      }
      return res.status(200).send({ id_token: createToken(newUser.user_info) });
    });
  });
});

app.get('/users/:username', function (req, res, next) {
  var username = req.params.username;
  User.findOne({ username: username }, function (err, user) {
    if (err) {
      return next(new Error("Failed to load User"));
    }
    if (user) {
      var respdata = _.pick(user, "username", "gender", "about", "picUrl", "nofGames", "nofWons", "avgGameTime", "lastLogin");
      res.send(respdata);
    }
    else {
      res.status(404).send({ message: "User not found" });
    }
  });
});

app.put('/users/:username', function (req, res, next) {
  var username = req.params.username;
  var updatedata = _.pick(req.body, "gender", "about", "picUrl");
  User.findOneAndUpdate({username: username}, updatedata, { new: true }, function (err, user) {
    if (!err) {
      res.status(200).send("Updated!");
    } else {
      res.status(400).send(err);
    }
  });
});

app.put('/users/gameStat/:username', function (req, res, next) {
  var username = req.params.username;
  var stat = req.body;
  var query = User.where({ username: username });
  query.findOne(function (err, user) {
    user.avgGameTime = ((user.avgGameTime * user.nofGames) + parseInt(stat.gameLength)) / (user.nofGames + 1);
    user.nofGames += 1;
    if (stat.gameResult) {
      user.nofWons += 1;
    }
    var updatedata = _.pick(user, "nofGames", "nofWons", "avgGameTime");    
    User.findOneAndUpdate({username: user.username}, updatedata, { new: true }, function (err, user) {
    if (!err) {
      res.status(200).send("Updated!");
    } else {
      res.status(400).send(err);
    }
  });
  })
});

app.post('/sessions/create', function (req, res, next) {

  passport.authenticate("local", function (err, user, info) {
    if (err) {
      res.status(401).send({ message: info.message });
      return next(err);
    }
    if (!user) {
      res.status(401).send({ message: info.message });
      return next(err);
    }
    req.logIn(user, function (error) {
      if (error) {
        res.status(401).send({ message: info.message });
        return next(error);
      }
      res.status(201).send({ id_token: createToken(req.user.user_info) });
    });
  })(req, res, next);
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