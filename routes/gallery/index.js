const express = require("express");
const router = express.Router();
const middleware = require("../../middleware");

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
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("gallery/new");
});

// CREATE
router.post("/", middleware.isLoggedIn, upload.array("img", 40), async function(req, res){
	// add user id and username to gallery
	req.body.gallery.author = {
		id: req.user._id,
		username: req.user.username
	}
	req.body.gallery.imgs = [];
	for(const file of req.files){
		let result = await cloudinary.v2.uploader.upload(file.path);
		req.body.gallery.imgs.unshift({
			img: result.secure_url,
			imgId: result.public_id
		});
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
	Gallery.findById(req.params.id, function(err, gallery){
		if(err){
			console.log(err);
			req.flash("error", "Album not found");
			res.redirect("back");
		}else{
			res.render("gallery/show", {gallery: gallery});
		}
	})
});

// EDIT
router.get("/:id/edit", middleware.checkGalleryOwnership, function(req, res){
	Gallery.findById(req.params.id, function(err, gallery){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.render("gallery/edit", {gallery: gallery});
		}
	});
});

// UPDATE
router.put("/:id", middleware.checkGalleryOwnership, function(req, res){
	Gallery.findById(req.params.id, function(err, gallery){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/gallery/" + req.partials.id);
		}
	});
});

// DELETE One Img
router.delete("/:id/:img_id", middleware.checkGalleryOwnership, function(req, res){
	Gallery.findById(req.params.id, function(err, gallery){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			gallery.imgs.forEach(async function(img, i){
				if(img._id.equals(req.params.img_id)){
					await cloudinary.v2.uploader.destroy(img.imgId, function(err){
						if(err){
							console.log(err);
							res.redirect("back");
						}else{
							gallery.imgs.splice(i, 1);
							gallery.save();
							res.redirect("/gallery/" + req.params.id + "/edit");
						}
					});
				}
			});
		}
	});
});

// DELETE gallery
router.delete("/:id", middleware.checkGalleryOwnership, function(req, res){
	Gallery.findById(req.params.id, async function(err, gallery){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			try{
				gallery.imgs.forEach(async function(img){
					await cloudinary.v2.uploader.destroy(img.imgId);
				});
				gallery.delete();
        		req.flash('success', 'Album deleted');
        		res.redirect('/gallery');
			}catch(err){
				console.log(err);
				req.flash("error", "Something went wrong, please try again later.");
				res.redirect("back");
			}
		}
	});
});






module.exports = router;