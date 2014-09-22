var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Twit = require('twit');
var configAuth = require('../../config/auth');

var userSchema = mongoose.Schema({
    local: {
        username : String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
    },
    twitter: {
        token: String,
        tokenSecret: String,
    },
    google: {
        id: String,
        token: String,
        name: String
    }
});


userSchema.methods.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.sendMessage = function(msg){
    if(this.twitter.token){
        var tweet = new Twit({
            consumer_key: configAuth.twitterAuth.consumerKey,
            consumer_secret: configAuth.twitterAuth.consumerSecret,
            access_token: this.twitter.token,
            access_token_secret: this.twitter.tokenSecret
        });

        tweet.post('statuses/update', { status:msg}, 
            function(err, data){
                console.log(data);
            });
    }
    if(this.facebook.token){
        var FB = require('fb');
        FB.setAccessToken(this.facebook.token);
        FB.api('me/feed', 'post', {message:msg}, function(res){
            if(!res || res.error){
                console.log("There was an error: ", res.error)
                return;
            }
        });
    }
};


module.exports = mongoose.model('User', userSchema);

