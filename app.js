require('dotenv').config();

// DEPENDENCIES
const express        = require("express"),
	  app	         = express(),
	  bodyParser     = require("body-parser"),
	  mongoose       = require("mongoose"),
	  passport		 = require("passport"),
	  flash			 = require("connect-flash"),
	  LocalStrategy  = require("passport-local"),
	  methodOverride = require("method-override");

// MODELS
const Blog = require("./models/blog/blog");
const Comment = require("./models/blog/comment");
const User = require("./models/user");

// ROUTES
const indexRoutes 		 = require("./routes"),
	  authRoutes  		 = require("./routes/auth"),
	  followRoutes       = require("./routes/follow"),
	  profileRoutes		 = require("./routes/profile"),
	  blogRoutes  		 = require("./routes/blog"),
	  blogCommentRoutes  = require("./routes/blog/comment"),
	  blogLikeRoutes	 = require("./routes/blog/like"),
	  galleryRoutes		 = require("./routes/gallery"),
	  galleryLikeRoutes  = require("./routes/gallery/like");

const js = require("./public/js/galleryShowPage.js");


// MONGOOSE SETUP
mongoose.connect('mongodb://localhost:27017/IntenseTraveller', {
	useNewUrlParser: true, 
	useUnifiedTopology: true, 
	useFindAndModify: false, 
	useCreateIndex: true});

// EXPRESS SETUP
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Ado Dragicevic Full Stack Project no1",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARE TO EACH ROUTE
app.use(async function(req, res, next){
	res.locals.currentUser = req.user;
	if(req.user){
		try{
			let user = await User.findById(req.user._id).populate("notifications", null, {isRead: false} ).exec();
			res.locals.notifications = user.notifications.reverse();
		}catch(err){
			console.log(err.message);
		}
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});




// REQUIRE ROUTES
app.use(indexRoutes);
app.use(authRoutes);
app.use(followRoutes);
app.use("/profile", profileRoutes);
app.use("/blog", blogRoutes);
app.use("/blog/:id/comment", blogCommentRoutes);
app.use("/blog/:id/like", blogLikeRoutes);
app.use("/gallery", galleryRoutes);
app.use("/gallery/:id/like", galleryLikeRoutes);




app.listen(3000, function(){
	console.log("SERVER RUNNING");
});