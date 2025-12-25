  module.exports.isLoggedIn = (req, res, next) => {
   if(!req.isAuthenticated()) {
        req.flash('error', 'ログインが必要です');
        return res.redirect('/login');
    }
    next();
}