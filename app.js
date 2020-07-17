// DEPENDENCIES
const express        = require("express"),
	  app	         = express(),
	  bodyParser     = require("body-parser"),
	  mongoose       = require("mongoose"),
	  methodOverride = require("method-override");

// MODELS
const Blog = require("./models/blog/blog");

// ROUTES
const indexRoutes = require("./routes"),
	  blogRoutes  = require("./routes/blog"),
	  blogCommentRoutes = require("./routes/blog/comment");


// MONGOOSE SETUP
mongoose.connect('mongodb://localhost:27017/IntenseTraveller', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);

// EXPRESS SETUP
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));








// REQUIRE ROUTES
app.use(indexRoutes);
app.use("/blog", blogRoutes);
app.use("/blog/:id/comment", blogCommentRoutes);



app.listen(3000, function(){
	console.log("SERVER RUNNING");
});