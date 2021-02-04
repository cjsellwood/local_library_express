const mongoose = require("mongoose");
const { DateTime } = require("luxon");

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

// Virtual due date formatted
bookInstanceSchema.virtual("dueBackFormatted").get(function () {
  return DateTime.fromJSDate(this.dueBack).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("BookInstance", bookInstanceSchema);
