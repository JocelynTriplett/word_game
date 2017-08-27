const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const express = require('express');
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();

// setup view engine
app.engine('mustache', mustache());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', './views');
app.set('view engine', 'mustache');

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
// from express-session documentation:
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// game code
var unguessed_letters = [];
var remaining_letters = [];
var guessed_letters = [];
var remaining_guesses = ['*','*','*']

function getWord (req,res) {
  var random = words[Math.floor(Math.random() * words.length)];
  req.session.word = random;
  for (var i = 0; i < random.length; i++) {
    unguessed_letters.push('_');
  }
  remaining_letters = random.split('');
  word_letters = random.split('');
  res.redirect('/');
}

function playGame (req,res,guess) {
  console.log("You're playing the game! Your guess is "+guess);
  console.log("mystery word is: "+current_session.word);
  console.log("unguessed_letters: "+unguessed_letters);
  console.log("remaining_letters: "+remaining_letters);
  console.log("word_letters: "+word_letters);
  console.log("remaining_guesses: "+remaining_guesses);

  if (!remaining_letters.includes(guess)){
    console.log("guessed wrong!");
    console.log("your guess was "+guess+" it is not a letter in "+word_letters);
    remaining_guesses.pop();
    if (remaining_guesses.length === 0) {
      res.render('game_over');
    }
    else res.redirect('/');
  }
  else {
    console.log("guessed right!");
    console.log("your guess was "+guess+", which is a letter in "+remaining_letters);
    for (var i = 0; i < remaining_letters.length; i++) {
      guessed_letter = remaining_letters.find(function(guessed_letter){
        if (guessed_letter === guess) {
          console.log("guessed_letter index: "+remaining_letters.indexOf(guessed_letter))
          unguessed_letters[remaining_letters.indexOf(guessed_letter)] = guess;
          remaining_letters[remaining_letters.indexOf(guessed_letter)] = ' ';
        }
      });
    }
    if (!unguessed_letters.includes('_')){
      res.render('you_won');

    }
    else {
      res.redirect('/');
    }    
  }
}

app.get('/',function(req,res){
  current_session = req.session;
  if (current_session.word) {
    // console.log("mystery word is: "+current_session.word);
    // console.log("unguessed_letters: "+unguessed_letters);
    // console.log("remaining_letters: "+remaining_letters);
    // console.log("word_letters: "+word_letters);
    // console.log("remaining_guesses: "+remaining_guesses);
    res.render('index',
    {session: current_session,
        word: current_session.word,
        word_length: current_session.word.length,
        word_letters: word_letters.join(' '),
        guessed_letters: guessed_letters.join(', '),
        unguessed_letters: unguessed_letters.join(' ').toUpperCase(),
        remaining_guesses: remaining_guesses.length});
      }
  else {
    console.log('new game - getting word');
    getWord (req,res);
  }
});

app.post('/', function(req, res){
  console.log(req.body);
  console.log(req.body.letter);
  if (req.body.letter === ''){
    console.log("guess is blank! Starting new game!");
    delete req.session.word;
    remaining_guesses = ['*','*','*'];
    guessed_letters = [];
    unguessed_letters = [];
    getWord (req,res);
  }
  else {
    var guess = req.body.letter.toLowerCase();
    if (guessed_letters.includes(guess)) {
      console.log("you already guessed that letter!");
    }
    else {
      guessed_letters.push(guess);
    }

    playGame (req,res,guess);
  }
});

app.listen(3000, function(){
  console.log('Example app listening on port 3000!')
});
