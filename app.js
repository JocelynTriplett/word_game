const fs = require("fs");

// Use Mac built-in dictionary to supply words.
const words = fs
  .readFileSync("public/words/words", "utf-8")
  .toLowerCase()
  .split("\n");
const express = require("express");
const mustache = require("mustache-express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const players = require("./players");
const app = express();


// setup view engine
app.engine("mustache", mustache());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", "./views");
app.set("view engine", "mustache");

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// from express-session documentation:
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
  })
);

// game code
var unguessed_letters = [];
var remaining_letters = [];
var guessed_letters = [];
var remaining_guesses = ["*", "*", "*", "*", "*", "*", "*", "*"];

function getWord(req, res, difficulty) {
  var random = words[Math.floor(Math.random() * words.length)];
  if (
    (difficulty === "easy" && random.length > 3 && random.length < 7) ||
    (difficulty === "medium" && random.length > 5 && random.length < 9) ||
    (difficulty === "hard" && random.length > 8)
  ) {
    req.session.word = random;
    for (var i = 0; i < random.length; i++) {
      unguessed_letters.push("_");
    }
    remaining_letters = random.split("");
    word_letters = random.split("");
    res.redirect("/");
  } else {
    getWord(req, res, difficulty);
  }
}

function playGame(req, res, guess) {
  console.log("You're playing the game! Your guess is " + guess);
  console.log("mystery word is: " + current_session.word);
  console.log("unguessed_letters: " + unguessed_letters);
  console.log("remaining_letters: " + remaining_letters);
  console.log("word_letters: " + word_letters);
  console.log("remaining_guesses: " + remaining_guesses);

  if (!remaining_letters.includes(guess)) {
    console.log("guessed wrong!");
    console.log(
      "your guess was " + guess + " it is not a letter in " + word_letters
    );
    remaining_guesses.pop();
    if (remaining_guesses.length === 0) {
      res.render("game_over", { word: current_session.word });
    } else res.redirect("/");
  } else {
    console.log("guessed right!");
    console.log(
      "your guess was " + guess + ", which is a letter in " + remaining_letters
    );
    for (var i = 0; i < remaining_letters.length; i++) {
      guessed_letter = remaining_letters.find(function(guessed_letter) {
        if (guessed_letter === guess) {
          console.log(
            "guessed_letter index: " + remaining_letters.indexOf(guessed_letter)
          );
          unguessed_letters[remaining_letters.indexOf(guessed_letter)] = guess;
          remaining_letters[remaining_letters.indexOf(guessed_letter)] = " ";
        }
      });
    }
    if (!unguessed_letters.includes("_")) {
      fs.readFile("players.json", "utf8", function readFileCallback(err, data) {
        if (err) {
          console.log(err);
        } else {
          winners = JSON.parse(data);
          console.log(winners);
          res.render("you_won", {
            word: current_session.word,
            players: winners.table
          });
        }
      });
    } else {
      res.redirect("/");
    }
  }
}

app.get("/", function(req, res) {
  current_session = req.session;
  if (remaining_guesses.length > 1) {
    remaining_guesses_text = "You have " + remaining_guesses.length + " guesses left."
  }
  else {
    remaining_guesses_text = "You have 1 guess left."
  }
  if (current_session.word) {
    res.render("index", {
      session: current_session,
      word: current_session.word,
      word_length: current_session.word.length,
      word_letters: word_letters.join(" "),
      guessed_letters: guessed_letters.join(", "),
      unguessed_letters: unguessed_letters.join(" ").toUpperCase(),
      remaining_guesses: remaining_guesses_text,
    });
  } else {
    fs.readFile("players.json", "utf8", function readFileCallback(err, data) {
      winners = JSON.parse(data);
      res.render("welcome", {
        players: winners.table
      });
    });
  }
});

app.post("/", function(req, res) {
  console.log(req.body);
  console.log(req.body.letter);

  // code from welcome template
  if (req.body.letter === "?") {
    console.log("guess is blank! Starting new game!");
    delete req.session.word;
    difficulty = req.body.difficulty;
    remaining_guesses = ["*", "*", "*", "*", "*", "*", "*", "*"];
    guessed_letters = [];
    unguessed_letters = [];
    getWord(req, res, difficulty);
  } else if (req.body.letter === "" && !req.body.player) {
    // code from game_over template
    fs.readFile("players.json", "utf8", function readFileCallback(err, data) {
      winners = JSON.parse(data);
    res.render("welcome", {
      players: winners.table
    })});
  } else if (req.body.player) {
    // code from you_won template
    fs.readFile("players.json", "utf8", function readFileCallback(err, data) {
      winners = JSON.parse(data);
      var match = winners.table.filter(function(obj) {
        return obj.name === req.body.player;
      });
      if (match[0]) {
        match[0].won = match[0].won + 1;
      } else {
        winners.table.push({ name: req.body.player, won: 1 });
      }
      json = JSON.stringify(winners);
      fs.writeFile("players.json", json, "utf8");
      res.render("welcome", {
        players: winners.table
      });
    });
  } else {
    // code from index template
    var guess = req.body.letter.toLowerCase();
    if (guessed_letters.includes(guess)) {
      console.log("you already guessed that letter!");
    } else {
      guessed_letters.push(guess);
    }
    playGame(req, res, guess);
  }
});

app.listen(process.env.PORT || 5000);
// app.listen(5000, function() {
//   console.log("Example app listening on port 5000!");
// });
