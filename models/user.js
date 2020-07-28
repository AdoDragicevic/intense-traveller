const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	email: {type: String, unique: true, required: true},
	paswrord: String,
	resetPasswordToken: String,
    resetPasswordExpires: Date,
	isAdmin: {type: Boolean, default: false},
	profilePic: String,
	description: String
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);