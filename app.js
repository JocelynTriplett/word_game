const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const express = require('express');
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();


// setup view engine
app.engine('mustache', mustache());
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

function getWord (req) {
  var random = words[Math.floor(Math.random() * words.length)];
  //console.log("random: "+random);
  //console.log("req.session: "+req.session[0]);
  req.session.word = random;
  console.log("req.session.word: "+req.session.word);
  console.log("req.session.word.length: "+req.session.word.length);
}

function playGame(req){

}

app.get('/',function(req,res){
  res.render('index');
  if (req.session.word) {
    playGame (req);
  }
  else {
    getWord (req);
  }
});

app.post('/', function(req, res){

});

app.listen(3000, function(){
  console.log('Example app listening on port 3000!')
});
