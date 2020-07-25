const express = require("express");
const router = express.Router();
const passport = require("passport");

const User = require("../../models/user");


// REGISTER FORM
router.get("/register", function(req, res){
	res.render("auth/register");
});

// REGISTER LOGIC
router.post("/register", function(req, res){
	let newUser = new User({username: req.body.username, email: req.body.email});
	if(req.body.username === "Admin"){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			res.redirect("back");
		}else{
			passport.authenticate("local")(req, res, function(){
				req.flash("Success", req.user.username + "  welcome to the Intense Traveller community!");
				res.redirect("/");
			});
		}
	});
});

// LOGIN FORM
router.get("/login", function(req, res){
	res.render("auth/login");
});

// LOGIN LOGIC
router.post("/login", passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/login"
}), function(req, res){
});

// LOGOUT
router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

module.exports = router;