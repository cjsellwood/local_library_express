const mongoose = require("mongoose");

// Create genre schema
const genreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
});


// Virtual for genre url
genreSchema.virtual("url").get(function () {
  return "/catalog/genre/" + this._id;
})

module.exports = mongoose.model("Genre", genreSchema)