const express = require("express");
const router = express.Router();

const Gallery = require("../../models/gallery/gallery");

// CLOUDINARY SETUP
const multer = require("multer");
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter});

const cloudinary = require("cloudinary");
cloudinary.config({ 
  cloud_name: "portfolioado", 
  api_key: 532218197446811, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});



//ROUTES

// INDEX
router.get("/", function(req, res){
	Gallery.find({}, function(err, galleries){
		if(err){
			console.log(err);
			req.flash("error", "No albums found! Feel free to add an album.");
			res.redirect("back");
		}else{
			res.render("gallery/index", {galleries: galleries});
		}
	});
});

// NEW
router.get("/new", function(req, res){
	res.render("gallery/new");
});

// CREATE
router.post("/", upload.array("img", 40), function(req, res){
	// add user id and username to gallery
	req.body.gallery.author = {
		id: req.user._id,
		username: req.user.username
	}
	Gallery.create(req.body.gallery, function(err, gallery){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/gallery");	
		}
	});
});

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