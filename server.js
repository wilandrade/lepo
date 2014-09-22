// set up ======================================================================
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


// set up database ======================================================================
mongoose.connect('mongodb://localhost/lepo');

// set up passport ======================================================================
require('./config/passport')(passport);

// set up passport ======================================================================
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up ejs ======================================================================
app.set('view engine', 'ejs');

// set up session ======================================================================
app.use(session({ secret: 'doNotGoogleLadyStoneHeart' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes ======================================================================
require('./app/routes.js')(app, passport);

// launch ======================================================================
app.listen(port);
console.log('Listening on ' + port);
