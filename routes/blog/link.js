const express = require("express");
const router = express.Router(({mergeParams: true}));
const app = express();

const middleware = require("../../middleware");

const Blog = require("../../models/blog/blog");
const Gallery = require("../../models/gallery/gallery");
const User = require("../../models/user");


// ROUTES


// EDIT
router.get("/", middleware.isLoggedIn, async function(req, res){
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
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			req.flash("error", "Unable to link choosen Gallery. Please, try again later.");
			res.redirect("back");
		}else{
			// check if req.body.link exists in blog.likes
			let foundLink = blog.link.some(function(link){
				return link.equals(req.body.link);
			});
			if(foundLink){
				// user already liked, removing like
				blog.link.pull(req.body.link);
				blog.save();
				req.flash("success", "Link between Journal and Gallery has been removed.");
				res.redirect("/blog/link/" + req.params.id);
			}else{
				// add new user like to blog.likes
				blog.link.push(req.body.link);
				blog.save();
				req.flash("success", "Link between Journal and Gallery has been created.");
				res.redirect("/blog/link/" + req.params.id);
			}
			
		}
	});
});


module.exports = router;