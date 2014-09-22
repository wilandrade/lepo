module.exports = function(app, passport){
    //======================================================================
    // Home Page
    // ======================================================================
    app.get('/', isLoggedIn, function(req, res){
        res.redirect('index');
    });

    //======================================================================
    // Login Page
    // ======================================================================
    app.get('/login', function(req, res){
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/index',
        failureRedirect: '/login',
        failureFlash: true
    }));

    //======================================================================
    // Signup Page
    // ======================================================================
    app.get('/signup', function(req, res){
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    //process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/index',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    //======================================================================
    // Index Page
    // ======================================================================
    app.get('/index', isLoggedIn, function(req, res){
        res.render('index.ejs');
    });

    app.post('/send', isLoggedIn, function(req, res){
        console.log(req.body.msg);
        req.user.sendMessage(req.body.msg);
        res.redirect('index');
    });

    //======================================================================
    // Twitter Authorization
    // ======================================================================
    app.get('/toggleTwitterLink', function(req, res){
        if(!req.user.twitter.token){
            res.redirect('auth/twitter');
        }else{
            var currentUser = req.user;
            currentUser.twitter.token = undefined;
            currentUser.save(function(err){
                res.redirect('/');
            });
        }
    })

    app.get('/auth/twitter', passport.authorize('twitter'));

    app.get('/auth/twitter/callback',passport.authorize('twitter', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

    //======================================================================
    // Google Authorization
    // ======================================================================
    app.get('/toggleGoogleLink', function(req, res){
        if(!req.user.google.token){
            res.redirect('/auth/google');
        }else{
            var currentUser = req.user;
            currentUser.google.token = undefined;
            currentUser.save(function(err){
                res.redirect('/');
            });
        }
    })

    app.get('/auth/google', passport.authorize('google', {scope: ['profile', 'email']}));

    app.get('/auth/google/callback',passport.authorize('google', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

    //======================================================================
    // Facebook Authorization
    // ======================================================================
    app.get('/toggleFacebookLink', function(req, res){
        if(!req.user.facebook.token){
            res.redirect('/auth/facebook');
        }else{
            var currentUser = req.user;
            currentUser.facebook.token = undefined;
            currentUser.save(function(err){
                res.redirect('/');
            });
        }
    })

    app.get('/auth/facebook', passport.authorize('facebook', { scope : ['publish_actions'] }));

    app.get('/auth/facebook/callback',passport.authorize('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    }));

    

    //======================================================================
    // Logout Page
    // ======================================================================
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    //======================================================================
    // Unkown Routes
    // ======================================================================
    app.get('/*', function(req, res){
        res.redirect('/');
    });

    app.post('/*', function(req, res){
        res.redirect('/');
    });

};

var isLoggedIn = function(req, res, next){
    //if user is authenticated in the session, carry on
    if(req.isAuthenticated()){
        return next();
    }

    //if they aren't authenticated redirect them to signup page
    res.redirect('signup');

};