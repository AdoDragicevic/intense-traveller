const mongoose = require("mongoose"); 


// SCHEMA SETUP
const blogSchema = new mongoose.Schema({
	title: String,
	img: String,
	content: String,
	comments: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}
});


module.exports = mongoose.model("Blog", blogSchema);