const express = require("express");
const router = express.Router();

const middleware = require("../../middleware");

const User = require("../../models/user");


// ROUTE


// UPDATE - change user.darkMode to true or false
router.put("/darkMode", function(req, res){
	User.findById(req.user.id, function(err, user){
		if(err){
			console.log(req.user.id);
			console.log(err);
			res.redirect("back");
		}else{
			if(user.darkMode){
				user.darkMode = false;
			}else{
				user.darkMode = true;
			}
			user.save();
			res.redirect("back");
		}
	})
});





module.exports = router;