const mongoose = require('mongoose');
// We need to import the Store model
// The store model was created in models/Store.js as a mongoose model singleton (supported by mongoose)
// So now we can just reference it as mongoose.model('Store')
const Store = mongoose.model('Store');
// This library is used to handle image uploads
const multer = require('multer');
// This library is used to resize images
const multerOptions = {
  // store the image in memory and then resize it
  storage: multer.memoryStorage(),
  // check if the file is an image
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      // The first argument is an error object, the second is a boolean
      // null means no error
      next(null, true);
    } else {
      next({message: 'That filetype isn\'t allowed!'}, false);
    }
  }
};
// This library is used to resize images
const jimp = require('jimp');
// This library is used to generate unique ids
const uuid = require('uuid');

exports.homePage = (req, res) => {
  console.log(req.name);
  // req.flash() is a method from the flash middleware that we imported in app.js
  // It is loaded in the res.locals object in app.js
  // req.flash('error', 'Something Happened');
  res.render('index');
}

exports.addStore = (req,res) => {
  // We reuse the same template for editing and adding stores
  // The path to the template is views/editStore.pug
  // The path was set in app.js -> app.set('views', path.join(__dirname, 'views'));
  res.render('editStore', {title: 'Add Store'});
}

// This is a middleware that will handle the image upload
exports.upload = multer(multerOptions).single('photo');

// This is a middleware that will resize the image
exports.resize = async (req,res,next) => {
  // If there is no file to resize, skip this middleware
  if (!req.file) {
    next(); // skip to the next middleware
    return; // stop this function from running
  }
  // Check the structure of the file object
  // console.log(req.file);

  // The file is stored in req.file.buffer
  // mimetype is the type of the file (e.g. image/jpeg)
  const extension = req.file.mimetype.split('/')[1];
  // We push the file name as a unique id in the req.body object
  req.body.photo = `${uuid.v4()}.${extension}`;
  // Now we resize the image and save it to the public/uploads folder
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // Once the image is resized, move on to the next middleware
  next();
}

// Create store follows after the upload and resize middlewares
exports.createStore = async (req,res) => {
  // console.log(req.body);
  const store = await (new Store(req.body)).save();
  // flash() is a method from the flash middleware that we imported in app.js
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req,res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  // console.log(stores);
  // 2. Pass the data to the template and render it to the client
  res.render('stores', {title: 'Stores', stores});
}

exports.editStore = async (req,res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({_id: req.params.id});
  // 2. Confirm they are the owner of the store
  // 3. Render out the edit form so the user can update their store
  res.render('editStore', {title: `Edit ${store.name}`, store});
}

exports.updateStore = async (req,res) => {
  // Set the location data to be a point
  // For some reasons the default value for location.type is not being set
  req.body.location.type = 'Point';
  // Find and update the store
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true, // force the model to run validators again
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`);
  res.redirect(`/stores/${store._id}/edit`);
  // Redirect them to the store and tell them it worked
}


