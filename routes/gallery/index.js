const express = require("express");
const router = express.Router();
const middleware = require("../../middleware");

const Gallery = require("../../models/gallery/gallery");
const User = require("../../models/user");
const Notification = require("../../models/notification/notification");

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


// ROUTES

// INDEX
router.get("/", function(req, res){
	let perPage = 12;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
	Gallery.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec( function(err, galleries){
		Gallery.count().exec(function (err, count) {
			if(err){
				console.log(err);
				req.flash("error", "No albums found. Feel free to add one!");
				res.redirect("back");
			}else{
				res.render("gallery/index", {
					galleries: galleries, 
					current: pageNumber,
					pages: Math.ceil(count / perPage)
				});
			}
		});
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
	try{
		let gallery = await Gallery.create(req.body.gallery);
		let user = await User.findById(req.user._id).populate("followers").exec();
      	let newNotification = {
        	username: req.user.username,
        	id: gallery.id,
			gallery: true
      	}
      	for(const follower of user.followers) {
			let notification = await Notification.create(newNotification);
			follower.notifications.push(notification);
			follower.save();
      	}
		res.redirect("/gallery/" + gallery.id);
	}catch(err){
		console.log(err);
		res.redirect("back");
	}
});

// SHOW
router.get("/:id", function(req, res){
	Gallery.findById(req.params.id).populate({ path: "imgs", populate: {path: "likes"} }).exec(function(err, gallery){
		if(err || !gallery){
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
router.put("/:id", middleware.checkGalleryOwnership, upload.array("img"), async function(req, res){
	Gallery.findById(req.params.id, async function(err, gallery){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			try{
				// add each added img file to the gallery imgs array
				if(req.files){
					for(const file of req.files){
						let result = await cloudinary.v2.uploader.upload(file.path);
						gallery.imgs.unshift({
							img: result.secure_url,
							imgId: result.public_id
						});
					}
				}
				// update title
				gallery.title = req.body.gallery.title;
				// save and redirect
				gallery.save();
				res.redirect("/gallery/" + req.params.id);
			}catch(err){
				console.log(err);
				req.flash("error", err.message);
				res.redirect("back");
			}
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