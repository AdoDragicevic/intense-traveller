// DEPENDENCIES
const express        = require("express"),
	  app	         = express(),
	  bodyParser     = require("body-parser"),
	  mongoose       = require("mongoose"),
	  passport		 = require("passport"),
	  LocalStrategy  = require("passport-local"),
	  methodOverride = require("method-override");

// MODELS
const Blog = require("./models/blog/blog");
const Comment = require("./models/blog/comment");
const User = require("./models/user");

// ROUTES
const indexRoutes 		= require("./routes"),
	  authRoutes  		= require("./routes/auth"),
	  blogRoutes  		= require("./routes/blog"),
	  blogCommentRoutes = require("./routes/blog/comment");


// MONGOOSE SETUP
mongoose.connect('mongodb://localhost:27017/IntenseTraveller', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);

// EXPRESS SETUP
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

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
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});




// REQUIRE ROUTES
app.use(indexRoutes);
app.use(authRoutes);
app.use("/blog", blogRoutes);
app.use("/blog/:id/comment", blogCommentRoutes);



app.listen(3000, function(){
	console.log("SERVER RUNNING");
});