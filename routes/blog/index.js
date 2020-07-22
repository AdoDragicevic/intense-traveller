const express = require("express");
const router  = express.Router();

const middleware = require("../../middleware");

const Blog = require("../../models/blog/blog");
const Comment = require("../../models/blog/comment");


// INDEX
router.get("/", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.render("blog/index", {blogs: blogs});
		}
	});
});


// NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("blog/new");
});


// CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
	Blog.create(req.body.blog, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			// Add user id and username to blog
			blog.author.id = req.user._id;
			blog.author.username = req.user.username;
			blog.save();
			res.redirect("/blog");
		}
	})
});


//SHOW
router.get("/:id", function(req, res){
	Blog.findById(req.params.id).populate("comments").exec(function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.render("blog/show", {blog: blog});
		}
	});
});

// EDIT
router.get("/:id/edit", middleware.checkBlogOwnership, function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
		}else{
			res.render("blog/edit", {blog: blog});
		}
	});
});


// UPDATE
router.put("/:id", middleware.checkBlogOwnership, function(req, res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/blog");
		}
	})
});


// DESTROY
router.delete("/:id", middleware.checkBlogOwnership, function(req, res){
	Blog.findByIdAndDelete(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/blog");
		}
	});
});


module.exports = router;