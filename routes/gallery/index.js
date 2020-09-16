const express = require("express");
const router = express.Router();
const middleware = require("../../middleware");

const Gallery = require("../../models/gallery/gallery");
const Blog = require("../../models/blog/blog");
const User = require("../../models/user");
const Notification = require("../../models/notification/notification");

const js = require("../../public/js/galleryShowPage.js");

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
	// pagination
	let perPage = 12;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
	// search
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Gallery.find({title: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec( function(err, galleries){
			Gallery.countDocuments().exec(function (err, count) {
				if(err){
					console.log(err);
					req.flash("error", "No albums found. Feel free to add one!");
					res.redirect("back");
				}else{
					// if there are no blogs with the searched name
					res.render("gallery/index", { 
						success: "No Galleries match the searched term.",
						galleries: galleries, 
						current: pageNumber, 
						pages: Math.ceil(count / perPage) 
					});					
				}
			});
		});
	}else{
		Gallery.find({}).sort({'_id':-1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec( function(err, galleries){
			Gallery.countDocuments().exec(function (err, count) {
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
	}
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
			User.findById(gallery.author.id).populate("followers").exec(function(err, user){
				if(err){
					console.log(err);
					req.flash("error", "Journal not found.");
					res.redirect("back");
				}else{
					// find blogs linked to this gallery
					Blog.find().where("link").equals(req.params.id).exec(function(err, blogs){
						if(err){
							console.log(err);
							req.flash("error", "Journal not found.");
							res.redirect("back");
						}else{
							res.render("gallery/show", {gallery: gallery, user: user, blogs: blogs, paramsId: req.params.id});			
						}
					});
				}
			});			
		}
	})
});

// SHOW ONE (for each img in Gallery)
router.get("/:id/show/:imgId", function(req, res){
	Gallery.findById(req.params.id).populate({ path: "imgs", populate: {path: "likes"} }).exec(function(err, gallery){
		if(err || !gallery){
			console.log(err);
			req.flash("error", "Image not found.");
			res.redirect("back");
		}else{
			// we use these indx numbers in showOne.ejs, to display the right img and move to next/previous imgs in Gallery in relation to current img
			let indx;
			let indxNext;
			let indxBack;
			// indxNext can not be greater than imgs.length -1
			let maxIndx = gallery.imgs.length -1;
			// find index num of this pic in the gallery.imgs
			for(let i = 0; i < gallery.imgs.length; i++){
				if(gallery.imgs[i]._id.equals(req.params.imgId)){
					indx = i;   
				}
			}
			// indxNext is +1 than current index, except if it is equal to imgs.length, then it is set to 0
			if(indx == maxIndx){
				indxNext = 0;
			}else{
				indxNext = indx + 1;
			}
			// indxBack is -1 than current index, except if it is 0, then it is set to imgs.length
			if(indx == 0){
				indxBack = maxIndx;
			}else{
				indxBack = indx - 1;
			}
			// rended showOne.ejs
			res.render("gallery/showOne", 
				{
					gallery: gallery, 
					paramsId: req.params.id, 
					imgId: req.params.imgId, 
					indx: indx,
					indxNext: indxNext,
					indxBack: indxBack
				});
		}
	});
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


// fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;