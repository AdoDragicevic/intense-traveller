const express = require("express");
const router = express.Router();

const middleware = require("../../middleware");

const User = require("../../models/user");
const Notification = require("../../models/notification/notification");

// Follow a user
router.get("/follow/:id", middleware.isLoggedIn, async function(req, res){
	try{
		// find the user you want to follow
		let user = await User.findById(req.params.id);
		// add your user id to their followers array
		// first check if the user is already a follower
		let isFollower = user.followers.some(function(follower){
							return follower.equals(req.user._id);
						});
		if(isFollower){
			// user already is a follower, remove him
			user.followers.pull(req.user._id);
			req.flash("success", "You are no longer following " + user.username + "!");
		}else{
			// user is not a follower, add him
			user.followers.push(req.user._id);
			req.flash("success", "You are following " + user.username + "!");
		}		
		user.save();
		res.redirect("back");
	}catch(err){
		console.log(err);
		req.flash("error", "Unable to follow this user at this time. Please, try again later.");
		res.redirect("back");
	}
});

// View all notifications
router.get("/notifications", middleware.isLoggedIn, async function(req, res){
	try{
		let user = await User.findById(req.user._id).populate( {path: "notifications" , options: {sort: {"-id": -1} }} ).exec();
		let allNotifications = user.notifications;
		res.render("follow/index", {allNotifications: allNotifications});
	}catch(err){
		console.log(err);
		req.flash("error", "Unable to find notifications. Please, try again later.");
		res.redirect("back");
	}
});

// Handle notification
router.get("/notifications/:id", middleware.isLoggedIn, async function(req, res){
	// blog._id/gallery._id saved under notification.id
	await Notification.findOne({id: req.params.id}, function(err, notification){
		if(err || !notification){
			console.log(err);
			req.flash("error", "Author has removed this post.");
			res.redirect("back");
		}else{
			notification.isRead = true;
			notification.save();
			if(notification.gallery){
				res.redirect("/gallery/" + req.params.id);
			}else{
				res.redirect("/blog/" + req.params.id);
			}
		}
	});
});


module.exports = router;