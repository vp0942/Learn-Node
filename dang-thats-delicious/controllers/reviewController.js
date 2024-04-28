const mongoose = require('mongoose');
const Review = mongoose.model('Review');

exports.addReview = async (req, res) => {
  // console.log(req);
  // push the author and store to the request body
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  const newReview = new Review(req.body);
  await newReview.save();
  req.flash('success', 'Review Saved!');
  res.redirect('back');
}