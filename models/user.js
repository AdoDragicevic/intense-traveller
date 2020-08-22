const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


const UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	email: {type: String, unique: true, required: true},
	paswrord: String,
	resetPasswordToken: String,
    resetPasswordExpires: Date,
	isAdmin: {type: Boolean, default: false},
	img: String,
	imgId: String,
	about: String,
	personalData: {
		name: String,
		gender: String,
		location: String,
		profession: String,
		contact: String,
		hobbies: String,
		relationship: String,
	},
	notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: "Notification"
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: "User"
    	}
    ]
});


UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);