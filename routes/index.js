const express = require("express");
const router  = express.Router();

router.get("/", function(req, res){
	res.render("landing");
});

router.get("*", function(req, res){
	res.render("lost");
});


module.exports = router;