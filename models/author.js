const mongoose = require("mongoose");
const { DateTime } = require("luxon");

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

// // Virtual for author's lifespan
// authorSchema.virtual("lifespan").get(function () {
//   return (this.dateOfDeath.getYear() - this.dateOfBirth.getYear()).toString();
// });

// Virtual for author's URL
authorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

// Virtual for author's lifespan
authorSchema.virtual("lifespan").get(function () {
  // Convert to nicer format
  const birth = this.dateOfBirth
    ? DateTime.fromJSDate(this.dateOfBirth).toLocaleString(DateTime.DATE_MED)
    : "";
  const death = this.dateOfDeath
    ? DateTime.fromJSDate(this.dateOfDeath).toLocaleString(DateTime.DATE_MED)
    : "";
  return `${birth} - ${death}`;
});

// Virtual for form entry date format
authorSchema.virtual("dateOfBirthForm").get(function () {
  return this.dateOfBirth
    ? DateTime.fromJSDate(this.dateOfBirth).toISODate()
    : "";
});

// Virtual for form entry date format
authorSchema.virtual("dateOfDeathForm").get(function () {
  return this.dateOfDeath
    ? DateTime.fromJSDate(this.dateOfDeath).toISODate()
    : "";
});

module.exports = mongoose.model("Author", authorSchema);
