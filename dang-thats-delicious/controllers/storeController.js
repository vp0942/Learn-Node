const mongoose = require('mongoose');
// We need to import the Store model
// The store model was created in models/Store.js as a mongoose model singleton (supported by mongoose)
// So now we can just reference it as mongoose.model('Store')
const Store = mongoose.model('Store');
// We need to import the User model
const User = mongoose.model('User');
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

// This is the homePage controller (just for playing around)
// It is not used in the app (we use the getStores controller instead)
exports.homePage = (req, res) => {
  // console.log(req.name);
  // req.flash() is a method from the flash middleware that we imported in app.js
  // It is loaded in the res.locals object in app.js
  // req.flash('error', 'Something Happened');
  res.render('index');
}

// This is the addStore controller
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
  // We set the author of the store to the current user
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  // flash() is a method from the flash middleware that we imported in app.js
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

// This is the getStores controller
exports.getStores = async (req,res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  // console.log(stores);
  // 2. Pass the data to the template and render it to the client
  res.render('stores', {title: 'Stores', stores});
}

// This helper function checks if the user is the owner of the store
const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) { // equals() is a mongoose method
    throw Error('You must own a store in order to edit it!');
  }
};

// This is the editStore controller
exports.editStore = async (req,res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({_id: req.params.id});
  // 2. Confirm they are the owner of the store
  confirmOwner(store, req.user);
  // 3. Render out the edit form so the user can update their store
  res.render('editStore', {title: `Edit ${store.name}`, store});
}

// This is the updateStore controller
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

// This is the getStoreBySlug controller
exports.getStoreBySlug = async (req,res,next) => {
  // Find the store by the slug
  // We use the populate() method to get the author of the store from the User model
  // and the reviews of the store from the Review model.
  // The author field in the Store model is a reference to the User model
  // The populate() method will replace the author id with the author object so we can access the author's name and email...
  const store = await Store.findOne({slug: req.params.slug}).populate('author reviews');
  // If the store does not exist (null), skip to the next middleware
  if (!store) return next();
  res.render('store', {store, title: store.name});
}

// This is the getStoresByTag controller
exports.getStoresByTag = async (req,res) => {
  // Get the tag from the URL and pass it to the tag.pug template to highlight the selected tag
  const tag = req.params.tag;
  // If there is no specific tag selected, show all stores that have a tag
  const tagQuery = tag || { $exists: true };
  // Get the sorted tags array from the getTagsList() static method of the Store model
  // and the stores that have a selected tag (or all stores if no tag is selected)
  const tagsPromise = Store.getTagsList();
  const storePromise = Store.find({tags: tagQuery});
  // Wait for both promises to resolve
  const [tags, stores] = await Promise.all([tagsPromise, storePromise]);
  res.render('tag', {tags, title: 'Tags', tag, stores});
}

// This is the searchStores controller (API)
exports.searchStores = async (req,res) => {
  // Find stores that match the search query
  const stores = await Store
  // first find stores that match the search query
  .find({
    $text: {
      $search: req.query.q
    }
  }, { // We use the projection object to include the textScore in the result
    score: { $meta: 'textScore' } // textScore is a meta field
  })
  // then sort the stores by the textScore
  .sort({
    score: { $meta: 'textScore' }
  })
  // Limit the number of results to 5
  .limit(5);
  res.json(stores);
}

// This is the mapStores controller (API)
exports.mapStores = async (req,res) => {
  // Get the coordinates from the request query (by clicking on the map in the frontend)
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat); // In MongoDB, the order is longitude, latitude
  // Find stores near the coordinates
  const q = {
    location: {
      $near: { // $near is a MongoDB operator that finds the closest stores to the coordinates
        $geometry: { // $geometry is a MongoDB operator that defines the type and coordinates of the point (2dsphere)
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // 10km
      }
    }
  };
  // Find the stores that match the query
  // We only select the fields that we need (slug, name, description, location, photo)
  // We limit the number of closest 10 stores
  const stores = await Store.find(q).select('slug name description location photo').limit(10);
  res.json(stores);
}

// This is the mapPage controller
exports.mapPage = (req,res) => {
  res.render('map', {title: 'Map'});
}

// This is the heartStore controller
exports.heartStore = async (req,res) => {
  // Get the list of hearts from the user
  const hearts = req.user.hearts.map(obj => obj.toString()); // Convert the stored ObjectIds to strings to compare them with the store ids
  // Check if the store id is in the hearts array
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet'; // $pull removes the store id, $addToSet adds it
                                                                           // $addToSet adds the store id only if it is not already in the array
                                                                           // This is the same as $push but it does not add duplicates
  // Add or remove the store id from the hearts list
  const user = await User.findByIdAndUpdate(
    req.user._id, // query the user by the id that is stored in the session
    { [operator]: { hearts: req.params.id } }, // update operator
     { new: true } // return the new user
    );
  res.json(user);
}

// This is the getHearts controller
exports.getHearts = async (req,res) => {
  // Get the list of hearts from the user
  // $in is a MongoDB operator that finds all stores that have an _id that is in the hearts array of the user
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  // res.json(stores);
  res.render('stores', {title: 'Hearted Stores', stores});
}

// This is the getTopStores controller
exports.getTopStores = async (req,res) => {
  // Get the top stores from the getTopStores() static method of the Store model
  // We prefer to write the logic of the complex queries as static methods in the model instead of the controller
  const stores = await Store.getTopStores();
  // res.json(stores);
  res.render('topStores', {stores, title: '⭐ Top Stores!'});
}


