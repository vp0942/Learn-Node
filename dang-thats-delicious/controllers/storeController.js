const mongoose = require('mongoose');
// We need to import the Store model
// The store model was created in models/Store.js as a mongoose model singleton (supported by mongoose)
// So now we can just reference it as mongoose.model('Store')
const Store = mongoose.model('Store');

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

exports.createStore = async (req,res) => {
  // only the name, description and tags are saved as only they are in the Schema
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
  // 1. Find and update the store
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true, // force the model to run validators again
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`);
  res.redirect(`/stores/${store._id}/edit`);
  // 2. Redirect them to the store and tell them it worked
}


