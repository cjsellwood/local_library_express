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
    console.log(req.body)
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.genre);
      }
    }
    console.log(req.body)
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
