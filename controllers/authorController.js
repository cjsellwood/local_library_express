const Author = require("../models/author");
const Book = require("../models/book");
const async = require("async");

// Display list of all authors
exports.authorList = async (req, res) => {
  const authorList = await Author.find({}).sort("familyName");
  res.render("authorList", { title: "Author List", authorList });
};

// Display detail page for a specific Author
exports.authorDetail = (req, res) => {
  async.parallel(
    {
      author: (callback) => {
        Author.findById(req.params.id).exec(callback);
      },
      authorsBooks: (callback) => {
        Book.find({ author: req.params.id }, "title summary").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.author === null) {
        // No results.
        const err = new Error("Author not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("authorDetail", {
        title: "Author Detail",
        author: results.author,
        authorBooks: results.authorsBooks,
      });
    }
  );
};

// Display Author create form on GET
exports.authorCreateGet = (req, res) => {
  res.send("Not Implemented: Author create GET");
};

// Handle Author create on POST
exports.authorCreatePost = (req, res) => {
  res.send("Not Implemented: Author create POST");
};

// Display Author delete form on GET
exports.authorDeleteGet = (req, res) => {
  res.send("Not Implemented: Author delete GET");
};

// Handle Author delete on POST.
exports.authorDeletePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Display Author update form on GET.
exports.authorUpdateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Handle Author update on POST.
exports.authorUpdatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};
