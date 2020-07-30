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
		user.followers.push(req.user._id);
		user.save();
		req.flash("success", "You are following " + user.username + "!");
		res.redirect("/profile/" + req.params.id);
	}catch(err){
		console.log(err);
		req.flash("error", "Unable to follow this user at this time. Please, try again later.");
		res.redirect("back");
	}
});

// View all notifications
router.get("/notifications", middleware.isLoggedIn, async function(req, res){
	try{
		let user = User.findById(req.user._id).populate( {path: "notifications" , options: {sort: {"-id": -1} }} ).exec();
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
	Notification.findById(req.params.id, function(err, notification){
		if(err){
			console.log(err);
			req.flash("error", "Notification not found. Please, try again later.");
			res.redirect("back");
		}else{
			notification.isRead = true;
			notification.save();
			res.redirect("/blog/" + notification.blogId);
		}
	});
});


module.exports = router;