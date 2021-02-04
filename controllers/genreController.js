const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");

// Display list of all Genre.
exports.genreList = async (req, res) => {
  const genreList = await Genre.find({}).sort("name");
  res.render("genreList", { title: "Genre List", genreList });
};

// Display detail page for a specific Genre.
exports.genreDetail = (req, res, next) => {
  async.parallel(
    {
      genre: (callback) => {
        Genre.findById(req.params.id).exec(callback);
      },
      genreBooks: (callback) => {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre === null) {
        // No results
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("genreDetail", {
        title: "Genre Detail",
        genre: results.genre,
        genreBooks: results.genreBooks,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genreCreateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create GET");
};

// Handle Genre create on POST.
exports.genreCreatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create POST");
};

// Display Genre delete form on GET.
exports.genreDeleteGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
};

// Handle Genre delete on POST.
exports.genreDeletePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
};

// Display Genre update form on GET.
exports.genreUpdateGet = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

// Handle Genre update on POST.
exports.genreUpdatePost = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
};
