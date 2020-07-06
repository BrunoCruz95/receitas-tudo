module.exports = {
    yes_user: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/');
    }
}
