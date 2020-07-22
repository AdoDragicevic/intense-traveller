const express = require("express");
const router = express.Router(({mergeParams: true}));

const middleware = require("../../middleware");

const Blog    = require("../../models/blog/blog");
const Comment = require("../../models/blog/comment");

// NEW
router.get("/new", function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
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
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
					res.redirect("/blog");
				}else{
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					blog.comments.unshift(comment);
					blog.save();
					res.redirect("/blog/" + blog._id);
				}
			});
		}
	});
});


// EDIT
router.get("/:comment_id/edit", function(req, res){
	Comment.findById(req.params.comment_id, function(err, comment){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.render("blog/comment/edit", {comment: comment, blog_id: req.params.id});
		}
	});
});

// UPDATE
router.put("/:comment_id", function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
		if(err){
			console.log(err);
		}else{
			res.redirect("/blog/" + req.params.id);
		}
	});
});

// DESTROY
router.delete("/:comment_id", function(req, res){
	Comment.findByIdAndDelete(req.params.comment_id, function(err, comment){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/blog/" + req.params.id);
		}
	});
});


module.exports = router;