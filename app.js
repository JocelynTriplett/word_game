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

var guessed_letters = [];
var unguessed_letters = [];
var remaining_letters = [];

function getWord (req,res) {
  var random = words[Math.floor(Math.random() * words.length)];
  //console.log("random: "+random);
  //console.log("req.session: "+req.session[0]);
  req.session.word = random;
  //console.log("req.session.word: "+req.session.word);
  //console.log("req.session.word.length: "+req.session.word.length);
  for (var i = 0; i < random.length; i++) {
    unguessed_letters.push('_');
  }
  remaining_letters = random.split('');
  res.redirect('/');
}

function playGame(req,res,guess){
  current_session = req.session;
  word = current_session.word;
  word_letters = word.split('');
  //word_letters = [...word];
  console.log("word_letters: "+word_letters);
  console.log("guessed_letters: "+guessed_letters);
  console.log("guess: "+guess);

  if (remaining_letters.includes(guess)) {
    console.log("guessed right!");
    guessed_letter = remaining_letters.find(function(guessed_letter){
      return guessed_letter === guess;
    });
    console.log("guessed_letter index: "+remaining_letters.indexOf(guessed_letter))
    unguessed_letters[remaining_letters.indexOf(guessed_letter)] = guess;
    remaining_letters[word_letters.indexOf(guessed_letter)] = ' ';
  }

  else {
    console.log("guessed wrong!");
  }

  res.render('index',
  {session: current_session,
   word: current_session.word,
   word_length: current_session.word.length,
   word_letters: word_letters.join(' '),
   guessed_letters: guessed_letters.join(', '),
   unguessed_letters: unguessed_letters.join(' ').toUpperCase()});
  console.log("req.session.word: "+req.session.word);
  console.log("req.session.word.length: "+req.session.word.length);
  console.log("unguessed_letters: "+unguessed_letters);
}

app.get('/',function(req,res){
  current_session = req.session;
  if (req.session.word) {
    playGame (req,res);
  }
  else {
    getWord (req,res);
  }

});

app.post('/', function(req, res){
  var guess = req.body.letter;
  guessed_letters.push(guess);
  playGame (req,res,guess);

});

app.listen(3000, function(){
  console.log('Example app listening on port 3000!')
});
