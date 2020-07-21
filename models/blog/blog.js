const mongoose = require("mongoose"); 

// SCHEMA SETUP
const blogSchema = new mongoose.Schema({
	title: String,
	img: String,
	content: String,
	//timestamps: {
	//	createdAt: { type: Date, default: Date.now },
	//	updatedAt: { type: Date, default: Date.now }	
	//},
	created: {type: Date, default: Date.now},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});


module.exports = mongoose.model("Blog", blogSchema);