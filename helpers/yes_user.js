module.exports = {
    yes_user: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error_msg", "Erro! tente novamente ou cadastre-se");
        res.redirect('/');
    }
}
