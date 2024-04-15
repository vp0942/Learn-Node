const passport = require('passport');

// We are using the passport
// We will use the local strategy to authenticate users
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout(); // passport middleware adds this method to the request object
  req.flash('success', 'You are now logged out! 👋');
  res.redirect('/');
}

// This is a middleware that checks if the user is logged in
// It is used in the routes that require authentication like /add
exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {  // isAuthenticated() is a method from passport
    next(); // carry on! They are logged in!
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
}