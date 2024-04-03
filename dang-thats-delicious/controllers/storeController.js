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

