const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
	name: String,
	pictures: [pictureSchema],
});


module.exports = mongoose.Schema("Gallery", gallerySchema);