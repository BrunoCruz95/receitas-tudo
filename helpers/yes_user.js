module.exports = {
    yes_user: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error_msg", "Erro! tente fazer login novamente");
        res.redirect('/');
    }
}
