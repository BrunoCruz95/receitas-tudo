module.exports = {
    yes_user: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error_msg", "Você precisar se cadastrar");
        res.redirect('/');
    }
}
