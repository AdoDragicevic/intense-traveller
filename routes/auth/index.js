const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../../models/user");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");




// REGISTER FORM
router.get("/register", function(req, res){
	res.render("auth/register");
});

// REGISTER LOGIC
router.post("/register", function(req, res){
	let newUser = new User(
		{
			username: req.body.username, 
			email: req.body.email, 
			img: "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1987&q=80", 
			imgId: "", 
			about: "No information entered yet.",
		});
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
				res.redirect("/blog");
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
	res.redirect("/blog");
});


// :::::::::RESET PASSWORD:::::::::

// Forgotten email form
router.get("/forgot", function(req, res){
	res.render("auth/forgot");
});

// Forgotten email logic
router.post("/forgot", function(req, res, next) {
	async.waterfall([
    	function(done) {
      		crypto.randomBytes(20, function(err, buf) {
        		let token = buf.toString('hex');
        		done(err, token);
      		});
    	},
    	function(token, done) {
      		User.findOne({ email: req.body.email }, function(err, user) {
        		if (!user) {
					req.flash("error", "No account with that email address exists.");
			  	    return res.redirect("/forgot");
        		}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

				user.save(function(err) {
          			done(err, token, user);
       		 	});
      		});
    	},
    	function(token, user, done) {
      		let smtpTransport = nodemailer.createTransport({
        		service: "Gmail", 
       			auth: {
					user: "portfolio.ado@gmail.com",
					pass: process.env.GMAILPW
        		}
      		});
      		let mailOptions = {
        		to: user.email,
        		from: "portfolio.ado@gmail.com",
        		subject: "Node.js Password Reset",
        		text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
          				"Please click on the following link, or paste this into your browser to complete the process:\n\n" +
          				"http://" + req.headers.host + "/reset/" + token + "\n\n" +
          				"If you did not request this, please ignore this email and your password will remain unchanged.\n"
      			};
      		smtpTransport.sendMail(mailOptions, function(err) {
        		console.log("mail sent");
        		req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
        		done(err, "done");
      		});
    	}
  		], 
		function(err) {
    		if (err) return next(err);
    			res.redirect("/forgot");
  			});
		});

// Token route - change password form
router.get("/reset/:token", function(req, res) {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    	if (!user) {
      		req.flash("error", "Password reset token is invalid or has expired.");
      		return res.redirect("/forgot");
    	}
    	res.render("auth/reset", {token: req.params.token});
  	});
});

// Change password logic
router.post("/reset/:token", function(req, res) {
	async.waterfall([
    	function(done) {
      		User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        		if (!user) {
          			req.flash("error", "Password reset token is invalid or has expired.");
          			return res.redirect('back');
        		}
        		if(req.body.password === req.body.confirm) {
          			user.setPassword(req.body.password, function(err) {
            			user.resetPasswordToken = undefined;
            			user.resetPasswordExpires = undefined;
            			user.save(function(err) {
              				req.logIn(user, function(err) {
                				done(err, user);
              				});
            			});
          			});
        		} else {
           			req.flash("error", "Passwords do not match.");
            		return res.redirect('back');
        		}
      		});
    	},
    	function(user, done) {
      		let smtpTransport = nodemailer.createTransport({
        		service: "Gmail", 
        		auth: {
          			user: "portfolio.ado@gmail.com",
          			pass: process.env.GMAILPW
        		}
      		});
      		let mailOptions = {
        		to: user.email,
        		from: "portfolio.ado@gmail.com",
        		subject: "Your password has been changed",
        		text: "Hello,\n\n" + "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
      		};
      		smtpTransport.sendMail(mailOptions, function(err) {
        		req.flash("success", "Password successfully changed!");
        		done(err);
      		});
    	}
  		], 
		function(err) {
    		res.redirect("/blog");
  	});
});



module.exports = router;