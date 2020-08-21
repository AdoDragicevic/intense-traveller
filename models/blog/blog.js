const mongoose = require("mongoose"); 

// SCHEMA SETUP
const blogSchema = new mongoose.Schema({
	title: String,
	img: String,
	imgId: String,
	description: String,
	content: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	created: {type: Date, default: Date.now},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
	link: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Gallery"
		}
	]
});


module.exports = mongoose.model("Blog", blogSchema);