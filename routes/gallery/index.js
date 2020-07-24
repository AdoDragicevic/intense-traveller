const express = require("express");
const router = express.Router();


//ROUTES

// INDEX
router.get("/", function(req, res){
	res.render("gallery/index");
});

// NEW
router.get("/new", function(req, res){
	res.render("gallery/new");
});

// CREATE
router.post("/", function(req, res){
	res.redirect("/gallery");
})

// SHOW
router.get("/:id", function(req, res){
	res.render("gallery/show");
});

// EDIT
router.get("/:id/edit", function(req, res){
	res.render("gallery/edit");
});

// UPDATE
router.put("/:id", function(req, res){
	res.redirect("/gallery/" + req.partials.id);
});

// DELETE
router.delete("/:id", function(req, res){
	res.redirect("/gallery");
});


module.exports = router;