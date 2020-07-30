const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
	username: String,
	// id of blog or gallery
	id: String,
	// use the boolean to decide res.render blog/id or gallery/id
	gallery: { type: Boolean, default: false },
	isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);