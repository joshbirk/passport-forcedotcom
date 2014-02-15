'use strict';
/*
 * Simple app implementation to test the current version of passport-forcedotcom against
 */
var express = require('express'),
  passport = require('passport'),
  util = require('util'),
  ForceDotComStrategy = require('../lib/passport-forcedotcom').Strategy;

// Force.com App Credentials
var CF_CLIENT_ID = '3MVG9A2kN3Bn17hsWsLDatw._IRRcBapWFgecAzRUqAny5.wuHmAMejzvV7ZhFlTg5ZPNdHBDjS18Zu0cvgeN';
var CF_CLIENT_SECRET = '3585278186716093184';

// Note: You should have a app.get(..) for this callback to receive callback
// from Force.com
//
// For example, if your callback url is:
//
//   https://localhost:3000/auth/forcedotcom/callback
// 
// then, you should have a HTTP GET endpoint like:
//
//   app.get('/auth/forcedotcom/callback, callback))
//
var CF_CALLBACK_URL = 'http://localhost:3000/auth/forcedotcom/callback';


// Salesforce Authorization URL (this defaults to:
// https://login.salesforce.com/services/oauth2/authorize)
var SF_AUTHORIZE_URL = 'https://login.salesforce.com/services/oauth2/authorize';

// Salesforce token URL (this defaults to:
// https://login.salesforce.com/services/oauth2/token)
var SF_TOKEN_URL = 'https://login.salesforce.com/services/oauth2/token';

//----------------------------------------------------------------------------


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Salesforce profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the ForceDotComStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Salesforce
//   profile), and invoke a callback with a user object.
var sfStrategy = new ForceDotComStrategy({
  clientID: CF_CLIENT_ID,
  clientSecret: CF_CLIENT_SECRET,
  callbackURL: CF_CALLBACK_URL,
  authorizationURL: SF_AUTHORIZE_URL,
  tokenURL: SF_TOKEN_URL
}, function(accessToken, refreshToken, profile, done) {

  // asynchronous verification, for effect...
  process.nextTick(function() {

    // To keep the example simple, the user's forcedotcom profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the forcedotcom account with a user record in your database,
    // and return that user instead.
    //
    // We'll remove the raw profile data here to save space in the session store:
    delete profile._raw;
    return done(null, profile);
  });
});

passport.use(sfStrategy);


var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));

  /* This is a workaround to remove deprecation notices of
   * third party Connect from our Express implementation.
   * It is equivalient to bodyParser.
   */
  app.use(express.json());
  app.use(express.urlencoded());

  /* Here we disable express's logger */
  app.use(express.logger(function(tokens, req, res){ return; }));

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res) {
  if(!req.user) {
    req.session.destroy();
    req.logout();
    return res.redirect('/login');
  }
  res.render('index', {
    user: req.user
  });
});


app.get('/login', function(req, res) {
  req.logout();
  req.session.destroy();

  res.render('login', {
    user: req.user
  });
});

// GET /auth/forcedotcom
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Force.com authentication will involve
//   redirecting the user to your domain.  After authorization, Force.com will
//   redirect the user back to this application at /auth/forcedotcom/callback
app.get('/auth/forcedotcom', passport.authenticate('forcedotcom'), function(req, res) {
  // The request will be redirected to Force.com for authentication, so this
  // function will not be called.
});

// GET /auth/forcedotcom/callback
//   PS: This MUST match what you gave as 'callback_url' earlier
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/forcedotcom/callback', passport.authenticate('forcedotcom', {
  failureRedirect: '/login'
}), function(req, res) {
  res.redirect('/');
});

app.get('/logout', function(req, res) {
  res.redirect('/login');
});

app.listen(3000,function(){
  // Notify our parent process of the server running.
  process.send('running');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}
