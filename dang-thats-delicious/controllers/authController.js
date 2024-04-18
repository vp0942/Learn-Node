const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
// crypto is a core module of node.js
// It is used to generate random tokens
const crypto = require('crypto');
const mail = require('../handlers/mail');

// We are using the passport
// We will use the local strategy to authenticate users
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

// This is a middleware that checks if the user is logged in
exports.logout = (req, res) => {
  req.logout(); // passport middleware adds this method to the request object
  req.flash('success', 'You are now logged out! 👋');
  res.redirect('/');
};

// This is a middleware that checks if the user is logged in
// It is used in the routes that require authentication like /add - protected routes!!!!
exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {  // isAuthenticated() is a method from passport
    next(); // carry on! They are logged in!
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  // Protect the route by redirecting to the login page!!!
  res.redirect('/login');
};

// This is a middleware that checks if the user is logged in
exports.forgot = async (req, res) => {
  // 1. See if a user with that email exists
  const user = await User.findOne({ email: req.body.email }); // findOne is a mongoose method
  if (!user) {
    req.flash('error', 'No account with that email exists.');
    // req.flash('error', 'A password reset has been mailed to you.');// If we don't want to give away if an email exists or not
    return res.redirect('/login');
  }
  // 2. Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex'); // generate a random string
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save(); // save the user with the reset token and expiry
  // 3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  mail.send({
    user,
    subject: 'Password Reset',
    resetURL,
    filename: 'password-reset' // This is the pug template that we will use
  });
  req.flash('success', `You have been emailed a password reset link.`);// Don't expose ${resetURL} in production!!!
  // 4. Redirect to login page
  res.redirect('/login');
};

// This is a middleware that renders the reset password form
exports.reset = async (req, res) => {
  // Find the user with the reset token and check if the expiry date is valid
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // $gt means greater than
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // If there is a user, show the reset password form
  res.render('reset', { title: 'Reset your Password' });
};

// Middleware that checks if the passwords match
exports.confirmedPasswords = (req, res, next) => {
  // check if the passwords match
  if (req.body.password === req.body['password-confirm']) {
    next(); // keep going
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back'); // redirect to the page that the user was on (the reset password form)
};

// This is a middleware that updates the user's password
exports.update = async (req, res) => {
  // Find the user with the reset token and check if the expiry date is valid
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() } // $gt means greater than
  });
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // setPassword() is a method from passport-local-mongoose
  // It hashes the password before saving it to the database
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  // We need to remove the resetPasswordToken and resetPasswordExpires fields from the user
  // We set them to undefined so that they are not saved to
  // the database when we call the save method
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // We save the user to the database
  const updatedUser = await user.save();
  // We log the user in with the login method from passport
  // We pass the user object and a callback function
  // The callback function is not used in this case
  // The login method is used to establish a login session
  // It is a passport method
  await req.login(updatedUser);
  req.flash('success', '💃 Nice! Your password has been reset! You are now logged in!');
  res.redirect('/');
};
