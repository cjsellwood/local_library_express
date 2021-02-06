const BookInstance = require("../models/bookInstance");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const async = require("async");

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
exports.bookInstanceDetail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookInstance) => {
      if (err) {
        return next(err);
      }
      if (bookInstance === null) {
        // No results.
        var err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("bookInstanceDetail", {
        title: "Copy: " + bookInstance.book.title,
        bookInstance: bookInstance,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookInstanceCreateGet = (req, res, next) => {
  Book.find({}, "title").exec((err, books) => {
    if (err) {
      return next(err);
    }
    res.render("bookInstanceForm", {
      title: "Create BookInstance",
      bookList: books,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookInstanceCreatePost = [
  // Validate and sanitise fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("dueBack", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      dueBack: req.body.dueBack,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, "title").exec(function (err, books) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("bookInstanceForm", {
          title: "Create BookInstance",
          bookList: books,
          selectedBook: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance,
        });
      });
      return;
    } else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookInstanceDeleteGet = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookInstance) => {
      if (err) {
        return next(err);
      }
      res.render("bookInstanceDelete", {
        title: "Delete Book Instance",
        bookInstance,
      });
    });
};

// Handle BookInstance delete on POST.
exports.bookInstanceDeletePost = (req, res, next) => {
  BookInstance.findByIdAndRemove(req.body.bookInstanceId, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/catalog/bookinstances");
  });
};

// Display BookInstance update form on GET.
exports.bookInstanceUpdateGet = (req, res, next) => {
  async.parallel(
    {
      bookInstance: (callback) => {
        BookInstance.findById(req.params.id).exec(callback);
      },
      bookList: (callback) => {
        Book.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("bookInstanceForm", {
        title: "Update Book Instance",
        bookInstance: results.bookInstance,
        bookList: results.bookList,
      });
    }
  );
};

// Handle bookinstance update on POST.
exports.bookInstanceUpdatePost = [
  // Validate and sanitise fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("dueBack", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      dueBack: req.body.dueBack,
      _id: req.params.id,
    });

    console.log("bookInstance", bookInstance)
    console.log("req", req.body)

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, "title").exec((err, books) => {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("bookInstanceForm", {
          title: "Update BookInstance",
          bookList: books,
          selectedBook: bookinstance.book._id,
          errors: errors.array(),
          bookInstance: bookInstance,
        });
      });
      return;
    } else {
      // Data from form is valid.
      BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {}, (err, theBookInstance) => {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(theBookInstance.url);
      });
    }
  },
];
