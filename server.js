var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Set up handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/slashfilm_scraper";

mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  db.Article.deleteMany({}, function(data1) {
    console.log(data1);
    // First, we grab the body of the html with axios
    axios.get("https://www.slashfilm.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("#title").each(function(i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .find("h1")
          .children("a")
          .text();
        result.link = $(this)
          .find("h1")
          .children("a")
          .attr("href");

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });

      // Send a message to the client
      res.send("Scrape Complete");
    });
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
    .then(function(data) {
      console.log(data[0]);
      var hbsObject = {
        articles: data
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findById({ _id: req.params.id })
    .populate("note")
    .then(function(data) {
      res.json(data);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body).then(function(dbNote) {
    console.log(dbNote);
    db.Article.findByIdAndUpdate(req.params.id, {
      $push: { note: dbNote._id }
    }).then(function(note) {
      console.log(note);
    });
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
