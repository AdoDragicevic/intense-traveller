const Blog = require("../models/blog/blog");
const Comment = require("../models/blog/comment");
const Gallery = require("../models/gallery/gallery");

const middlewareObj = {};


middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please, login first.");
	res.redirect("/login");
}

middlewareObj.checkBlogOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Blog.findById(req.params.id, function(err, blog){
			if(err || !blog){
				req.flash("error", "Journal not found");
				res.redirect("back");
				console.log(err);
			}else{
				if(blog.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "Please, login first.");
		res.redirect("/login");
	}	
}

middlewareObj.checkGalleryOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Gallery.findById(req.params.id, function(err, blog){
			if(err || !blog){
				req.flash("error", "Album not found");
				res.redirect("back");
				console.log(err);
			}else{
				if(blog.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "Please, login first.");
		res.redirect("/login");
	}	
}

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, comment){
			if(err){
				res.redirect("back");
				console.log(err);
			}else{
				// Does the user own the comment?
				if(comment.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "Please, login first.");
		res.redirect("/login");
	}
}


module.exports = middlewareObj;