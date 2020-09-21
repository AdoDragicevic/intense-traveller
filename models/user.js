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
	darkMode: { type: Boolean, default: false },
	personalData: {
		Name: { type: String, default: "" },
		Gender: { type: String, default: "" },
		Location: { type: String, default: "" },
		Profession: { type: String, default: "" },
		Contact: { type: String, default: "" },
		Hobbies: { type: String, default: "" },
		Relationship: { type: String, default: "" }
	},
	notifications: [
    	{
			username: String,
			// id of blog or gallery
			id: String,
			// use the boolean to decide res.render blog/id or gallery/id
			gallery: { type: Boolean, default: false },
			isRead: { type: Boolean, default: false }
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