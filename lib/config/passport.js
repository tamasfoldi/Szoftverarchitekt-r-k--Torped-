var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  User = require("../models/userSchema");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findOne({ _id: id }, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function (username, password, done) {
  User.findOne({ username: username }, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }
    if (!user.authenticate(password)) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  });
}));
