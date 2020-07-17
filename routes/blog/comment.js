const express = require("express");
const router = express.Router(({mergeParams: true}));

const Blog    = require("../../models/blog/blog");
const Comment = require("../../models/blog/comment");

// NEW
router.get("/new", function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
		}else{
			res.render("blog/comment/new", {blog: blog});
		}
	});
});

// CREATE
router.post("/", function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			Comment.create(req.body.blog, function(err, comment){
				if(err){
					console.log(err);
					res.redirect("back");
				}else{
					comment.save();
					blog.comments.unshift(comment);
					blog.save();
					res.redirect("/blog/" + req.params.id);
				}
			});
		}
	});
});


// EDIT

// UPDATE

// DESTROY


module.exports = router;