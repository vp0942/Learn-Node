const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// passport-local-mongoose adds a helper method createStrategy as static method to your schema.
// The createStrategy is responsible to setup passport-local LocalStrategy with the correct options.
passport.use(User.createStrategy());

// passport-local-mongoose adds a serializeUser and deserializeUser function to the schema.
// The serializeUser is invoked on authentication and its job is to determine what data from the user object should be stored in the session.
// The result of the serializeUser method is attached to the session as req.session.passport.user = {}.
passport.serializeUser(User.serializeUser());
// The deserializeUser method is invoked on every request by passport.session.
// It matches the id of the user object in the session to deserializeUser.
// The result of deserializeUser is attached to the request object as req.user.
passport.deserializeUser(User.deserializeUser());