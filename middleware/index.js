const middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		next();
	}else{
		res.redirect("/login");
	}
}

module.exports = middlewareObj;