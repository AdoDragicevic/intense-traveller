const express = require("express");
const router  = express.Router();
const middleware = require("../../middleware");
const Blog = require("../../models/blog/blog");
const Comment = require("../../models/blog/comment");

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


// INDEX
router.get("/", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.render("blog/index", {blogs: blogs});
		}
	});
});


// NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("blog/new");
});


// CREATE
router.post("/", middleware.isLoggedIn, upload.single("img"), function(req, res){
	// add user id and username to blog
	req.body.blog.author = {
		id: req.user._id,
		username: req.user.username
	}
	Blog.create(req.body.blog, function(err, blog){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			res.redirect("back");
		}else{
			cloudinary.v2.uploader.upload(req.file.path, function(err, result){
				if(err){
					console.log(err);
				}else{
					blog.img = result.secure_url;
        			blog.imgId = result.public_id;
					blog.save();
					res.redirect("/blog/" + blog.id);
				}
			});
		}
	});
});

// If you're using Google maps then you'll need to put all of the cloudinary code from above inside of the geocoder.geocode() callback. If you're not using Google maps then you can ignore this step.


//SHOW
router.get("/:id", function(req, res){
	Blog.findById(req.params.id).populate("comments").exec(function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.render("blog/show", {blog: blog});
		}
	});
});

// EDIT
router.get("/:id/edit", middleware.checkBlogOwnership, function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
		}else{
			res.render("blog/edit", {blog: blog});
		}
	});
});


// UPDATE
router.put("/:id", middleware.checkBlogOwnership, function(req, res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/blog");
		}
	})
});


// DESTROY
router.delete("/:id", middleware.checkBlogOwnership, function(req, res){
	Blog.findByIdAndDelete(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/blog");
		}
	});
});


module.exports = router