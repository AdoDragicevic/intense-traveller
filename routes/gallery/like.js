const express = require("express");
const router = express.Router(({mergeParams: true}));

const Gallery = require("../../models/gallery/gallery");

const middleware = require("../../middleware");


// Gallery LIKE route
router.post("/:img_id", middleware.isLoggedIn, function(req, res){
	Gallery.findById(req.params.id, function(err, gallery){
		if(err || !gallery){
			console.log(err);
			req.flash("error", "Ubable to like, please try again later.");
			res.redirect("back");
		}else{
			gallery.imgs.forEach(function(img){
				if(img._id.equals(req.params.img_id)){
					// check if req.user._id exists in gallery.likes
					let foundUserLike = img.likes.some(function(like){
						return like.equals(req.user._id);
					});
					if(foundUserLike){
						// user already liked, removing like
						img.likes.pull(req.user._id);
					}else{
						// add new user like to blog.likes
						img.likes.push(req.user);
					}	
				}
				
			});
			gallery.save(function(err, gallery){
					if(err){
						console.log(err);
						req.flash("error", "Something went wrong, please try again later.");
						res.redirect("back");
					}else{
						res.redirect("/gallery/" + gallery._id + "/" + req.params.img_id);
					}
				});
		}
	});	
});



module.exports = router;							