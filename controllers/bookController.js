const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookInstance");

const async = require("async");
const bookInstance = require("../models/bookInstance");

// Home page render
exports.index = (req, res) => {
  // Get counts all at the same time
  async.parallel(
    {
      bookCount: (callback) => {
        Book.countDocuments({}, callback);
      },
      bookInstanceCount: (callback) => {
        bookInstance.countDocuments({}, callback);
      },
      bookInstanceAvailableCount: (callback) => {
        bookInstance.countDocuments({ status: "Available" }, callback);
      },
      authorCount: (callback) => {
        Author.countDocuments({}, callback);
      },
      genreCount: (callback) => {
        Genre.countDocuments({}, callback);
      },
      // Run function after all counts completed
    },
    (err, results) => {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );

  // res.send("NOT IMPLEMENTED: Site Home Page");
};

// Display list of all books.
exports.bookList = (req, res, next) => {
  Book.find({}, "title author")
    .populate("author")
    .exec((err, listBooks) => {
      if (err) {
        return next(err);
      }
      listBooks.sort((a, b) => {
        let textA = a.title.toUpperCase();
        let textB = b.title.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      res.render("bookList", { title: "Book List", bookList: listBooks });
    });
};

// Display detail page for a specific book.
exports.bookDetail = (req, res, next) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      bookInstance: (callback) => {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.book === null) {
        const err = new Error("Book Not Found");
        err.status = 404;
        return next(err);
      }
      // Successful so render
      res.render("bookDetail", {
        title: results.book.title,
        book: results.book,
        bookInstances: results.bookInstance,
      });
    }
  );
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
