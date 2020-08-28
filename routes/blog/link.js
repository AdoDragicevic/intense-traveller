const express = require("express");
const router = express.Router(({mergeParams: true}));
const app = express();

const middleware = require("../../middleware");

const Blog = require("../../models/blog/blog");
const Gallery = require("../../models/gallery/gallery");
const User = require("../../models/user");


// ROUTES


// EDIT
router.get("/link", middleware.isLoggedIn, async function(req, res){
	try{
		let blog = await Blog.findById(req.params.id).populate("link").exec();
		let galleries = await Gallery.find().where("author.id").equals(req.user._id).populate("link").exec();
		res.render("blog/link", {blog: blog, galleries: galleries});
	}catch(err){
		console.log(err);
		req.flash("Unable to execute this functionality at the moment. Please, try again later.");
		res.redirect("back");
	}
	
});


// UPDATE
router.put("/", function(req, res){
	Blog.findByIdAndUpdate(req.params.id, req.body.link, function(err, blog){
		if(err){
			console.log(err);
			req.flash("error", "Unable to link choosen Gallery. Please, try again later.");
			res.redirect("back");
		}else{
			req.flash("success", "Your Journal now shows a link to the choosen Gallery.");
			res.redirect("/blog/" + req.params.id);
		}
	});
});


module.exports = router;