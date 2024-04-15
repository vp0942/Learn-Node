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

// This plugin (middleware) will add a username, hash and salt field to store the username, the hashed password and the salt value
// It also adds some methods to the schema. For example, the authenticate and register methods
// It is compatible with passport.js
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

// This plugin (middleware) will change the error messages to be more user friendly
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
