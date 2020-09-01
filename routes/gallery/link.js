const express = require("express");
const router = express.Router(({mergeParams: true}));
const app = express();

const middleware = require("../../middleware");

const Blog = require("../../models/blog/blog");
const Gallery = require("../../models/gallery/gallery");
const User = require("../../models/user");


// ROUTES


// EDIT
router.get("/", middleware.checkGalleryOwnership, async function(req, res){
	try{
		let gallery = await Gallery.findById(req.params.id);
		let blogs = await Blog.find().where("author.id").equals(req.user._id).populate("link").exec();
		res.render("gallery/link", {gallery: gallery, blogs: blogs});
	}catch(err){
		console.log(err);
		req.flash("Unable to execute at the moment. Please, try again later.");
		res.redirect("back");
	}
});




module.exports = router;