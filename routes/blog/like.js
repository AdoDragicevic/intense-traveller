const express = require("express");
const router = express.Router(({mergeParams: true}));

const Blog = require("../../models/blog/blog");

const middleware = require("../../middleware");


// Blog LIKE route
router.post("/", middleware.isLoggedIn, function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err || !blog){
			console.log(err);
			req.flash("error", "Something went wrong, please try again later.");
			res.redirect("back");
		}else{
			// check if req.user._id exists in blog.likes
			let foundUserLike = blog.likes.some(function(like){
				return like.equals(req.user._id);
			});
			if(foundUserLike){
				// user already liked, removing like
				blog.likes.pull(req.user._id);
			}else{
				// add new user like to blog.likes
				blog.likes.push(req.user);
			}
			blog.save(function(err, blog){
				if(err){
					console.log(err);
					req.flash("error", "Something went wrong, please try again later.");
					res.redirect("back");
				}else{
					res.redirect("/blog/" + blog._id);
				}
			});
		}
	});	
});


module.exports = router;