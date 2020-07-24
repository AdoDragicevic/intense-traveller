const mongoose = require("mongoose");

const pictureSchema = new mongoose.Schema({
	img: String,
	imgId: String,
});

module.exports = mongoose.model("Picture", pictureSchema);