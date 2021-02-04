const Book = require("../models/book");

exports.index = (req, res) => {
  res.send("NOT IMPLEMENTED: Site Home Page");
};

// Display list of all books.
exports.bookList = (req, res) => {
  res.send("NOT IMPLEMENTED: Book list");
};

// Display detail page for a specific book.
exports.bookDetail = (req, res) => {
  res.send("NOT IMPLEMENTED: Book detail: " + req.params.id);
};

// Display book create form on GET.
exports.bookCreateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Book create GET");
};

// Handle book create on POST.
exports.bookCreatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Book create POST");
};

// Display book delete form on GET.
exports.bookDeleteGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

// Handle book delete on POST.
exports.bookDeletePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

// Display book update form on GET.
exports.bookUpdateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Book update GET");
};

// Handle book update on POST.
exports.bookUpdatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Book update POST");
};
