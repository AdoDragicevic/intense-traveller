const express = require("express");
const router  = express.Router(({mergeParams: true}));

const middleware = require("../../middleware");

const Blog = require("../../models/blog/blog");
const User = require("../../models/user");
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



// ::::::::::::: ROUTES ::::::::::::::::

// SHOW
router.get("/:id", async function(req, res){
	try{
		let user = await User.findById(req.params.id).populate("followers").exec();
		let blogs = await Blog.find().where("author.id").equals(user._id).exec();
		let galleries = await Gallery.find().where("author.id").equals(user._id).exec();
		res.render("profile/show", {user: user, blogs: blogs, galleries: galleries});
	}catch(err){
		console.log(err);
		res.redirect("back");
	}
});

// EDIT
router.get("/:id/edit", middleware.checkProfileOwnership, function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err){
			console.log(err);
			req.flash("error", "Unable to change user profile at this time.");
			res.redirect("back");
		}else{
			res.render("profile/edit", {user: user});
		}
	});
});


// UPDATE
router.put("/:id", middleware.checkProfileOwnership, upload.single("img"), function(req, res){
	User.findById(req.params.id, async function(err, user){
		if(err){
			console.log(err);
			req.flash("error", "Unable to uplad profile at this time. Please, try again later.");
			res.redirect("back");
		}else{
			// if a file is uploaded
			if(req.file){
				try{
					// if profile img already exists
					if(user.imgId !== ""){
						// delete current img from cloudinary
						await cloudinary.v2.uploader.destroy(user.imgId);	
					}
					let result = await cloudinary.v2.uploader.upload(req.file.path);
					user.imgId = result.public_id;
					user.img = result.secure_url;
					console.log(user.img);
				}catch(err){
					console.log(err);
					req.flash("error", "Something went wrong, try again later.");
					return res.redirect("back");	
				}					
			}
			// update data
			user.about = req.body.user.about;
			user.personalData = req.body.personalData;
			await user.save();
			req.flash("success", "Successfully updated!");
			res.redirect("/profile/" + user._id);	
		}
	});
});


// DELETE warning page
router.get("/:id/delete", middleware.checkProfileOwnership, function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err){
			console.log(err);
			req.flash("error", "Unable to execute request. Try again later.");
			req.redirect("back");
		}else{
			res.render("profile/delete", {user: user});
		}
	});
});

// DELETE
router.delete("/:id", middleware.checkProfileOwnership, async function(req, res){
	try{
		let user = await User.findById(req.params.id);
		let blogs = await Blog.find().where("author.id").equals(user._id).populate("comments").exec();
		let galleries = await Gallery.find().where("author.id").equals(user._id).exec();
		await blogs.forEach(function(blog){
			blog.comments.forEach(function(comment){
				comment.delete();
			});
		});
		await blogs.forEach(async function(blog){
			await cloudinary.v2.uploader.destroy(blog.imgId);
			blog.delete();
		});
		await galleries.forEach(function(gallery){
			gallery.imgs.forEach(async function(img){
				await cloudinary.v2.uploader.destroy(img.imgId);
			});
			gallery.delete();
		});
		user.delete();
		req.flash("success", "User data successfully deleted.");
		res.redirect("/blog");
	}catch(err){
		console.log(err);
		req.flash("error", "Something went wrong. Please, try again later");
		res.redirect("back");
	}
});


module.exports = router;