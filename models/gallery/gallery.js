const mongoose = require("mongoose");


const gallerySchema = new mongoose.Schema({
	title: String,
	imgs: [ 
		{
			img: String,
			imgId: String,
			likes: [
        		{	
    				type: mongoose.Schema.Types.ObjectId,
    				ref: "User"
    			}
			]
		}
	],
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	created: {type: Date, default: Date.now},
});


module.exports = mongoose.model("Gallery", gallerySchema);