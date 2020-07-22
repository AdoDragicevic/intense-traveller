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
	User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err, user){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			passport.authenticate("local")(req, res, function(){
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
	successRedirect: "/blog",
	failureRedirect: "/login"
}), function(req, res){
});

// LOGOUT
router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

module.exports = router;