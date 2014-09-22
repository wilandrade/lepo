var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../app/models/user');
var configAuth = require('./auth');

module.exports = function(passport){

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //=========================================================
    // Account Signup
    // ========================================================

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        process.nextTick(function() {

            User.findOne({ 'local.username' :  username }, function(err, user) {
                
                if (err)
                    return done(err);

                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {

                    // if user doesn't already exist
                    var newUser = new User();

                    // set the user's credentials
                    newUser.local.username = username;
                    newUser.local.password = newUser.hashPassword(password);

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });    

        });

    }));

    //=========================================================
    // Account Login
    // ========================================================
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, username, password, done){
        User.findOne({'local.username': username}, function(err, user){
            if(err){
                return done(err);
            }
            if(!user){
                return done(null, false, req.flash('loginMessage', 'No user found'));
            }
            if(!user.validatePassword(password)){
                return done(null, false, req.flash('loginMessage', 'Username and password did not match, please try again.'));
            }

            return done(null, user);
        });
    }));

    //=========================================================
    // Twitter Account Link
    // ========================================================
    passport.use(new TwitterStrategy({

        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret : configAuth.twitterAuth.consumerSecret,
        callbackURL: configAuth.twitterAuth.callbackURL,
        passReqToCallback: true

    },
    function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {

            var currentUser = req.user;
            currentUser.twitter.token = token;
            currentUser.twitter.tokenSecret = tokenSecret;

            currentUser.save(function(err){
                if(err){
                    throw err;
                }

                return done(null, currentUser);
            });

        });

    }));

    //=========================================================
    // Google Account Link
    // ========================================================
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done){
        process.nextTick(function() {
            
            var currentUser = req.user;
            currentUser.google.id = profile.id;
            currentUser.google.token = token;
            currentUser.google.name = profile.displayName;

            currentUser.save(function(err){
                if(err){
                    throw err;
                }
                return done(null, currentUser);
            });

        });
    }));

    //=========================================================
    // Facebook Account Link
    // ========================================================
    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret : configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, done) {
        process.nextTick(function() {
            
            var currentUser = req.user;
            currentUser.facebook.id = profile.id;
            currentUser.facebook.token = token;

            currentUser.save(function(err){
                if(err){
                    throw err;
                }
                
                return done(null, currentUser);
            });

        });

    }));






};
