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
		let blogs = await Blog.find().where("author.id").equals(user._id).exec();
		let galleries = await Gallery.find().where("author.id").equals(user._id).exec();
		res.render("profile/show", {user: user, blogs: blogs, galleries: galleries});
	}catch(err){
		console.log(err);
		res.redirect("back");
	}
});

// DELETE warning page
router.get("/:id/delete", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err){
			console.log(err);
			req.flash("error", "Unable to execute request. Try again later.");
			req.redirect("/");
		}else{
			res.render("profile/delete", {user: user});
		}
	});
});

// DELETE
router.delete("/:id", async function(req, res){
	try{
		let user = await User.findById(req.params.id);
		let blogs = await Blog.find().where("author.id").equals(user._id).populate("comments").exec();
		let galleries = await Gallery.find().where("author.id").equals(user._id).exec();
		await blogs.forEach(function(blog){
			blog.comments.forEach(function(comment){
				comment.delete();
			});
		});
		await blogs.forEach(function(blog){
				blog.delete();
		});
		await galleries.forEach(function(gallery){
			gallery.delete();
		});
		user.delete();
		req.flash("success", "User data successfully deleted.");
		res.redirect("/");
	}catch(err){
		console.log(err);
		req.flash("error", "Something went wrong. Please, try again later");
		res.redirect("back");
	}
});


module.exports = router;