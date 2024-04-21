const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
}

// This is a middleware that validates the registration data
// It uses the express-validator library
// The librabry is loaded in app.js with the line app.use(expressValidator());
// It adds some methods to the request object (req)
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name'); // sanitizeBody is a method from express-validator
  req.checkBody('name', 'You must supply a name!').notEmpty(); // checkBody is a method from express-validator
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    // In case of an error, we need to repopulate the form with the data that was submitted
    // otherwise the user would have to retype everything
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running if there are errors and return
    // otherwise the code below would run and the user would be registered !!!
  }
  next(); // there were no errors! pass to userController.register
}

exports.register = async (req, res, next) => {
  // We create a new User object with the email and name that the user submitted in the form
  const user = new User({ email: req.body.email, name: req.body.name });
  // The register method hashes the password and saves the user to the database
  // We will use the promisify library to convert the callback based method to a promise based method
  const register = promisify(User.register, User); // User.register is a method from passport-local-mongoose
  // We pass the User model to it
  // We call the register method with the user object and the password
  // The password is not stored in the database, only the hash
  await register(user, req.body.password);
  // res.send('it works!!');
  next(); // pass to authController.login
}

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
}

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id }, // query. We find the user by the id that is stored in the session!
    { $set: updates }, // updates
    { new: true, runValidators: true, context: 'query' } // options
    // new: true returns the new user
    // runValidators: true forces the model to run validators
    // context: 'query' is necessary because of a bug in mongoose
  );
  // res.json(user);
  req.flash('success', 'Updated the profile!');
  // res.redirect('/account');
  res.redirect('back'); // redirect to the page that the user was on

}
