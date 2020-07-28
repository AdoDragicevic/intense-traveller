const express = require("express");
const router  = express.Router(({mergeParams: true}));

const middleware = require("../../middleware");

const Blog = require("../../models/blog/blog");
const User = require("../../models/user");
const Gallery = require("../../models/gallery/gallery");

// SHOW
router.get("/:id", async function(req, res){
	try{
		let user = await User.findById(req.params.id);
		let blogs = await Blog.find().where("author.username").equals(user.username).exec();
		let galleries = await Gallery.find().where("author.username").equals(user.username).exec();
		res.render("profile/show", {user: user, blogs: blogs, galleries: galleries});
	}catch(err){
		console.log(err);
		res.redirect("back");
	}
});





module.exports = router;