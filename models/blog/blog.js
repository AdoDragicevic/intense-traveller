const mongoose = require("mongoose"); 


// SCHEMA SETUP
const blogSchema = new mongoose.Schema({
	title: String,
	img: String,
	content: String,
});


module.exports = mongoose.model("Blog", blogSchema);