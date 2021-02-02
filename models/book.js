const mongoose = require("mongoose");

// Define book schema
const bookSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  summary: {
    type: String,
    required: true,
    isbn: {
      type: String,
      required: true,
    },
    genre: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
      },
    ],
  },
});

// Virtual for book's URL
bookSchema.virtual("URL").get(function () {
  return "/catalog/book/" + this._id;
});

module.exports = mongoose.model("Book", bookSchema)