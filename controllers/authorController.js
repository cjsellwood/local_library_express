const Author = require("../models/author");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

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
  res.render("authorForm", { title: "Create Author" });
};

// Handle Author create on POST
exports.authorCreatePost = [
  // Validate and sanitize fields
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),
  body("familyName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("dateOfBirth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("dateOfDeath", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render from again with sanitized values/errors messages
      res.render("authorForm", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid

      //Create an Author object with escaped and trimmed data
      const author = new Author({
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        dateOfBirth: req.body.dateOfBirth,
        dateOfDeath: req.body.dateOfDeath,
      });

      author.save((err) => {
        if (err) {
          return next(err);
        }
        // Successful redirect to new author record
        res.redirect(author.url);
      });
    }
  },
];

// Display Author delete form on GET
exports.authorDeleteGet = (req, res, next) => {
  async.parallel(
    {
      author: (callback) => {
        Author.findById(req.params.id).exec(callback);
      },
      authorBooks: (callback) => {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.author === null) {
        res.redirect("/catalog/authors");
      }
      // Successful, so render
      res.render("authorDelete", {
        title: "Delete Author",
        author: results.author,
        authorBooks: results.authorBooks,
      });
    }
  );
};

// Handle Author delete on POST.
exports.authorDeletePost = (req, res) => {
  async.parallel(
    {
      author: (callback) => {
        Author.findById(req.body.authorId).exec(callback);
      },
      authorsBooks: (callback) => {
        Book.find({ author: req.body.authorId }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.authorsBooks.length > 0) {
        // Author has books. Render in same way as for GET route.
        res.render("authorDelete", {
          title: "Delete Author",
          author: results.author,
          authorBooks: results.authorsBooks,
        });
        return;
      } else {
        // Author has no books. Delete object and redirect to the list of authors.
        Author.findByIdAndRemove(req.body.authorId, (err) => {
          if (err) {
            return next(err);
          }
          // Success - go to author list
          res.redirect("/catalog/authors");
        });
      }
    }
  );
};

// Display Author update form on GET.
exports.authorUpdateGet = (req, res, next) => {
  async.parallel(
    {
      author: (callback) => {
        Author.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("authorForm", {
        title: "Update Author",
        author: results.author,
      });
    }
  );
};

// Handle Author update on POST.
exports.authorUpdatePost = [
  // Validate and sanitize fields
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),
  body("familyName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("dateOfBirth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("dateOfDeath", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render from again with sanitized values/errors messages
      res.render("authorForm", {
        title: "Create Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      //Create an Author object with escaped and trimmed data
      const author = new Author({
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        dateOfBirth: req.body.dateOfBirth,
        dateOfDeath: req.body.dateOfDeath,
        _id: req.params.id, //This is required, or a new ID will be assigned!
      });

      Author.findByIdAndUpdate(req.params.id, author, {}, (err, theAuthor) => {
        if (err) {
          return next(err);
        }
        // Successful redirect to new author record
        res.redirect(theAuthor.url);
      });
    }
  },
];
