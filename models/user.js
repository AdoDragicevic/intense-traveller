const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new mongoose.Schema({
	username: String,
	paswrord: String
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);