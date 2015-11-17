/// <reference path="../../references.ts" />
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var cryptoNode = require("crypto");
var UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: String,
    salt: String
});
UserSchema
    .virtual("password")
    .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
})
    .get(function () {
    return this._password;
});
UserSchema
    .virtual("user_info")
    .get(function () {
    return { "_id": this._id, "username": this.username };
});
var validatePresenceOf = function (value) {
    return value && value.length;
};
UserSchema.path("username").validate(function (value, respond) {
    mongoose.models["User"].findOne({ username: value }, function (err, user) {
        if (err) {
            throw err;
        }
        if (user) {
            return respond(false);
        }
        respond(true);
    });
}, "The specified username is already in use.");
UserSchema.pre("save", function (next) {
    if (!this.isNew) {
        return next();
    }
    if (!validatePresenceOf(this.password)) {
        next(new Error("Invalid password"));
    }
    else {
        next();
    }
});
UserSchema.methods = {
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },
    makeSalt: function () {
        return cryptoNode.randomBytes(16).toString("base64");
    },
    encryptPassword: function (password) {
        if (!password || !this.salt) {
            return "";
        }
        var salt = new Buffer(this.salt, "base64");
        return cryptoNode.pbkdf2Sync(password, salt, 10000, 64).toString("base64");
    }
};
module.exports = mongoose.model("User", UserSchema);
//# sourceMappingURL=userSchema.js.map