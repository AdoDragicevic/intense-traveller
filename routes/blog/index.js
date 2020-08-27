const express = require("express");
const router  = express.Router();
const middleware = require("../../middleware");

const Blog = require("../../models/blog/blog");
const Comment = require("../../models/blog/comment");
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


// ::::::::::: ROUTES ::::::::::::


// INDEX
router.get("/", function(req, res){
	// pagination
	let perPage = 8;
    let pageQuery = parseInt(req.query.page);
    let pageNumber = pageQuery ? pageQuery : 1;
	// search
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Blog.find({title: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec( function (err, blogs) {
			Blog.count().exec(function (err, count) {
				if(err){
					console.log(err);
					res.redirect("back");
				}else{
					// if there are no blogs with the searched name
					res.render("blog/index", { 
						success: "No Journals match the searched term.",
						blogs: blogs, 
						current: pageNumber, 
						pages: Math.ceil(count / perPage) 
					});
				}
			});
		});
	// no search
	}else{
		Blog.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, blogs) {
			Blog.count().exec(function (err, count) {
				if(err){
					console.log(err);
					res.redirect("back");
				}else{
					res.render("blog/index", { 
						blogs: blogs, 
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
	res.render("blog/new");
});


//CREATE
router.post("/", middleware.isLoggedIn, upload.single("img"), async function(req, res){
  	// add user id and username to blog
		req.body.blog.author = {
			id: req.user._id,
			username: req.user.username
		}
	try{
		let blog = await Blog.create(req.body.blog);
		let result = await cloudinary.v2.uploader.upload(req.file.path);
		blog.img = result.secure_url;
        blog.imgId = result.public_id;
		blog.save();
		let user = await User.findById(req.user._id).populate("followers").exec();
      	let newNotification = {
        	username: req.user.username,
        	id: blog.id
      	}
      	for(const follower of user.followers) {
			let notification = await Notification.create(newNotification);
			follower.notifications.push(notification);
			follower.save();
      	}
		res.redirect("/blog/" +blog.id);
	}catch(err){
		console.log(err);
		req.flash('error', err.message);
      	res.redirect('back');
	}
});

//SHOW
router.get("/:id", async function(req, res){
	Blog.findById(req.params.id).populate("comments likes").exec(function(err, blog){
		if(err || !blog){
			console.log(err);
			req.flash("error", "Journal not found.");
			res.redirect("back");
		}else{
			User.findById(blog.author.id).populate("followers").exec(function(err, user){
				if(err){
					console.log(err);
					req.flash("error", "Journal not found.");
					res.redirect("back");
				}else{
					res.render("blog/show", {blog: blog, user: user});	
				}
			});
		}
	});
});


// EDIT
router.get("/:id/edit", middleware.checkBlogOwnership, function(req, res){
	Blog.findById(req.params.id, function(err, blog){
		if(err){
			console.log(err);
			req.flash("error", "Something went wrong, please try again later.");
			res.redirect("back");
		}else{
			res.render("blog/edit", {blog: blog});
		}
	});
});


// UPDATE
router.put("/:id", middleware.checkBlogOwnership, upload.single("img"), function(req, res){
	Blog.findById(req.params.id, async function(err, blog){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			res.redirect("back");
		}else{
			if(req.file){
				try{
					// delete current img from cloudinary
					await cloudinary.v2.uploader.destroy(blog.imgId);
					// upload new ing to cloudinary
					let result = await cloudinary.v2.uploader.upload(req.file.path);
					blog.imgId = result.public_id;
					blog.img = result.secure_url;	
				}catch(err){
					console.log(err);
					req.flash("error", "Something went wrong, try again later.");
					return res.redirect("back");
				}
			}
			// update data
			blog.title = req.body.blog.title;
			blog.description = req.body.blog.description;
			blog.content = req.body.blog.content;
			blog.save();
			req.flash("success", "Successfully updated!");
			res.redirect("/blog/" + blog._id);	
		}
	});
});


// DESTROY
router.delete("/:id", middleware.checkBlogOwnership, function(req, res){
	Blog.findById(req.params.id, async function(err, blog){
		if(err){
			console.log(err);
			req.flash("error", "Journal was not deleted, please try again later.");
			res.redirect("back");
		}else{
			try{
				await cloudinary.v2.uploader.destroy(blog.imgId);
				blog.delete();
				req.flash("success", "Journal deleted.");
				res.redirect("/blog");
			}catch(err){
				console.log(err);
				req.flash("error", "Journal was not deleted, please try again later.");
				res.redirect("back");
			}
		}
	});
});


// fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router