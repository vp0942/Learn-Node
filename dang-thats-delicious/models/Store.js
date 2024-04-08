const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
// Creates an url friendly slugs
const slug = require("slugs");

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true, // removes white space
    required: "Please enter a store name!" // true or error message
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply coordinates!"
      }
    ],
    address: {
      type: String,
      required: "You must supply an address!"
    }
  },
  photo: String,
});

// Pre-save hook -> before saving the store, we create an url friendly slug
// we use a function instead of an arrow function because we need the 'this' keyword
storeSchema.pre("save", function(next) {
  // if the name is not modified, skip this function
  if (!this.isModified("name")) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  next(); // move on to the next middleware
  // TODO make more resilient so slugs are unique
});

module.exports = mongoose.model("Store", storeSchema);