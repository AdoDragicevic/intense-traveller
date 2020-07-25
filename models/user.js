const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new mongoose.Schema({
	username: String,
	email: {type: String, unique: true, required: true},
	paswrord: String,
	isAdmin: {type: Boolean, default: false}
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);