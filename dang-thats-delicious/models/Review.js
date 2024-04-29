const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author!'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'You must supply a store!'
  },
  text: {
    type: String,
    required: 'Your review must have text!'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

// This will populate the author field with the author's name and gravatar
function autopopulate(next) {
  this.populate('author');
  next();
}

// This hook will run the autopopulate function before any find or findOne query
// and will populate the author field with the author's name and gravatar
reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);