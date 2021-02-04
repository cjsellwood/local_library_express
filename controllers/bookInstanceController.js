const BookInstance = require("../models/bookInstance");

// Display list of all BookInstances.
exports.bookInstanceList = async (req, res) => {
  // Find all book instances and link book objects inside them with populate
  const bookInstanceList = await BookInstance.find({}).populate("book");
  res.render("bookInstanceList", {
    title: "Book Instance List",
    bookInstanceList,
  });
};

// Display detail page for a specific BookInstance.
exports.bookInstanceDetail = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance detail: " + req.params.id);
};

// Display BookInstance create form on GET.
exports.bookInstanceCreateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance create GET");
};

// Handle BookInstance create on POST.
exports.bookInstanceCreatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance create POST");
};

// Display BookInstance delete form on GET.
exports.bookInstanceDeleteGet = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
};

// Handle BookInstance delete on POST.
exports.bookInstanceDeletePost = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
};

// Display BookInstance update form on GET.
exports.bookInstanceUpdateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
};

// Handle bookinstance update on POST.
exports.bookInstanceUpdatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
};
