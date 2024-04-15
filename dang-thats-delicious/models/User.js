const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise; // It is necessary to avoid a warning
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
// Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.js
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  }
});

// Gravatar is a service for providing globally unique avatars
// We create a virtual field 'gravatar' that is not stored in the database
// It is created on the fly when we access it
// We use a function instead of an arrow function because we need the 'this' keyword
userSchema.virtual('gravatar').get(function() {
  // We use the md5 library to hash the email
  const hash = md5(this.email);
  // We return the url of the gravatar image
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

// This plugin (middleware) will add a username, hash and salt field to store the username, the hashed password and the salt value
// It also adds some methods to the schema. For example, the authenticate and register methods
// It is compatible with passport.js
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// This plugin (middleware) will change the error messages to be more user friendly
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
