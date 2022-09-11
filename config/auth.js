module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("errorMessage", "You need to be logged in to view this site");
    res.redirect("/users/login");
  },
};
