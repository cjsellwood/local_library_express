const mongoose = require("mongoose");

// Create schema for author model
const authorSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 100,
  },
  familyName: {
    type: String,
    required: true,
    maxlength: 100,
  },
  dateOfBirth: {
    type: Date,
  },
  dateOfDeath: {
    type: Date,
  },
});

// Virtual field for author's full name
authorSchema.virtual("name").get(function () {
  return this.familyName + ", " + this.firstName;
});

// Virtual for author's lifespan
authorSchema.virtual("lifespan").get(function () {
  return (this.dateOfDeath.getYear() - this.dateOfBirth.getYear()).toString();
});

// Virtual for author's URL
authorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

module.exports = mongoose.model("Author", authorSchema);
