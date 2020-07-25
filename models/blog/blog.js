const mongoose = require("mongoose"); 

// SCHEMA SETUP
const blogSchema = new mongoose.Schema({
	title: String,
	img: String,
	imgId: String,
	content: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
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
	],
	likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});


module.exports = mongoose.model("Blog", blogSchema);