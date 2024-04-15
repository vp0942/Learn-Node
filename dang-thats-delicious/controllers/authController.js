const passport = require('passport');

// We are using the passport
// We will use the local strategy to authenticate users
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});