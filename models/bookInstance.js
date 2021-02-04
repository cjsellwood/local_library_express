const mongoose = require("mongoose");

// Create book instance schema
const bookInstanceSchema = mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  imprint: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  dueBack: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for book instance URL
bookInstanceSchema.virtual("url").get(function () {
  return "/catalog/bookinstance/" + this._id;
});

module.exports = mongoose.model("BookInstance", bookInstanceSchema)
