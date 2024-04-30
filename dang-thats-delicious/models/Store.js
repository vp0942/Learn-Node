const mongoose = require("mongoose");
mongoose.Promise = global.Promise; // It is necessary to avoid a warning
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
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author"
  }
},{
  // Virtual fields do not exist in the database, they are created on the fly
  // They will not be visible by default to JSON or Object although they are still in the model and not a problem for us
  // We need to set the virtuals option to true to make them visible in the JSON and Object!
  toJSON: { virtuals: true },
  toObject: { virtuals: true},
});

// Define our indexes to improve the performance of our queries
storeSchema.index({
  name: "text",
  description: "text"
});

storeSchema.index({
  location: "2dsphere"
});

// Pre-save hook -> before saving the store, we create an url friendly slug
// we use a function instead of an arrow function because we need the 'this' keyword
storeSchema.pre("save", async function(next) {
  // if the name is not modified, skip this function
  if (!this.isModified("name")) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  // find other stores that have a slug of store, store-1, store-2, etc.
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  // this.constructor is the Store model
  // this.constructor.find() is the same as Store.find() but we use this.constructor
  // because the Store model is not defined yet as it ia a pre-save hook
  // storeWithSlug is an array of stores that have the same slug (ex. store, store-1, store-2)
  const storesWithSlug = await this.constructor.find({ slug : slugRegEx });
  // if we have stores with the same slug
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next(); // move on to the next middleware
  // TODO make more resilient so slugs are unique
});

// We use this inside of the function. The function will be a static method of the Store model.
// Static method to get a list of tags and the number of stores that have that tag
// $unwind: "$tags" -> deconstructs the tags array and creates a document for each tag
// $group: { _id: "$tags", count: { $sum: 1 } } -> groups the tags and counts the number of stores that have that tag
// $sort: { count: -1 } -> sorts the tags by the number of stores that have that tag
storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get the top stores
storeSchema.statics.getTopStores = function() {
  // aggregate is a MongoDB method. MongoDB doesn't understand the virtual fields
  // we created in the schema with the virtual method of mongoose
  return this.aggregate([
    // Lookup stores and populate their reviews
    {
      // $lookup is a MongoDB aggregation pipeline stage
      // It allows us to reference documents in other collections
      // It is similar to a JOIN in SQL
      $lookup: {
        from: "reviews", // what model to link. MongoDB will lowercase and pluralize it: Review -> reviews !
        localField: "_id", // which field on the store
        foreignField: "store", // which field on the review
        as: "reviews" // the name of the field for the reviews
      }
    },
    // Filter for only items that have 2 or more reviews
    // The first item will be on index 0 - reviews.0 like in an array
    {
      $match: { // if a second item exists
        "reviews.1": { $exists: true }
      }
    },
    // Add the average reviews field
    // $addFields is a MongoDB aggregation pipeline stage
    // It adds new fields to documents
    // $avg is a MongoDB aggregation operator
    // It calculates the average value of the field passed from the previous pipeline stage (reviews.rating)
    {
      $addFields: {
        averageRating: { $avg: "$reviews.rating" }
      }
    },
    // Sort it by our new field, highest reviews first
    // -1 is for descending order
    {
      $sort: {
        averageRating: -1
      }
    },
    // Limit to at most 10
    { $limit: 10 }
  ]);
};

// Virtual field to populate the reviews of a store
// Find reviews where the store _id property === to the reviews store property
storeSchema.virtual("reviews", { // virtual is a capability of mongoose !!!
  ref: "Review", // what model to link : Go to the Review model
  localField: "_id", // which field on the store : Find reviews where the store field is equal to the _id of the store
  foreignField: "store" // which field on the review : Look at the store field in the Review model (JOIN with foreign key SQL alike)
});

// We will use autopopulate in the storeController to populate the author and reviews fields
function autopopulate(next) {
  this.populate("reviews");
  this.populate("author");
  next();
}

// This hook will run the autopopulate function before any find or findOne query
// and will populate the author and reviews fields in the Store model
storeSchema.pre("find", autopopulate);
storeSchema.pre("findOne", autopopulate);


module.exports = mongoose.model("Store", storeSchema);