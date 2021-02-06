const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookInstance");

const async = require("async");
const bookInstance = require("../models/bookInstance");
const { body, validationResult } = require("express-validator");

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
exports.bookCreateGet = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      authors: (callback) => {
        Author.find(callback);
      },
      genres: (callback) => {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("bookForm", {
        title: "Create Book",
        authors: results.authors,
        genres: results.genres,
      });
    }
  );
};

// Handle book create on POST.
exports.bookCreatePost = [
  // Convert the genre to an array.
  (req, res, next) => {
    console.log(req.body);
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    console.log(req.body);
    next();
  },
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // console.log(req.body)
    // Create a Book object with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: (callback) => {
            Author.find(callback);
          },
          genres: (callback) => {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          // console.log(results.genres)
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          // console.log(results.genres)
          res.render("bookForm", {
            title: "Create Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save book.
      book.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  },
];

// Display book delete form on GET.
exports.bookDeleteGet = (req, res, next) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id).exec(callback);
      },
      bookInstances: (callback) => {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("bookDelete", {
        title: "Delete Book",
        book: results.book,
        bookInstances: results.bookInstances,
      });
    }
  );
};

// Handle book delete on POST.
exports.bookDeletePost = (req, res, next) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id).exec(callback);
      },
      bookInstances: (callback) => {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // If still book instance
      if (results.bookInstances.length > 0) {
        res.render("bookDelete", {
          title: "Delete Book",
          book: results.book,
          bookInstances: results.bookInstances,
        });
        return;
      } else {
        Book.findByIdAndRemove(req.body.bookId, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/catalog/books");
        });
      }
    }
  );
};

// Display book update form on GET.
exports.bookUpdateGet = (req, res) => {
  async.parallel(
    {
      book: (callback) => {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      authors: (callback) => {
        Author.find(callback);
      },
      genres: (callback) => {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      if (results.book === null) {
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      // Success
      // Mark our selected genres as checked
      for (let allGIter = 0; allGIter < results.genres.length; allGIter++) {
        for (
          let bookGIter = 0;
          bookGIter < results.book.genre.length;
          bookGIter++
        ) {
          if (
            results.genres[allGIter]._id.toString() ===
            results.book.genre[bookGIter]._id.toString()
          ) {
            results.genres[allGIter].checked = true;
          }
        }
      }
      res.render("bookForm", {
        title: "Update Book",
        authors: results.authors,
        genres: results.genres,
        book: results.book,
      });
    }
  );
};

// Handle book update on POST.
exports.bookUpdatePost = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitise fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors: (callback) => {
            Author.find(callback);
          },
          genres: (callback) => {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Update Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Book.findByIdAndUpdate(req.params.id, book, {}, (err, theBook) => {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(theBook.url);
      });
    }
  },
];
