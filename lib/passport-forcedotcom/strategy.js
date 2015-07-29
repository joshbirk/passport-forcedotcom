/*jshint node:true*/
'use strict';
var util = require('util');
var OAuth2Strategy = require('passport-oauth2').Strategy;
var url = require('url');

function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://login.salesforce.com/services/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://login.salesforce.com/services/oauth2/token';
  options.scopeSeparator = options.scopeSeparator || ' ';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'forcedotcom';

  this._skipPhoto = options.skipPhoto || false;

  // salesforce uses the "Authorization: Bearer" header:
  this._oauth2.useAuthorizationHeaderforGET(true);

  // Override getOAuthAccessToken so we can capture the OAuth2 params and
  // attach them to the accessToken for use in userProfile().
  var origGetToken = this._oauth2.getOAuthAccessToken;
  this._oauth2.getOAuthAccessToken = function() {
    var args = Array.prototype.slice.call(arguments);
    var cb = args.pop();

    args.push(function attachParams(err, accessToken, refreshToken, params) {
      if (accessToken && params) {
        accessToken = new AccessTokenWithParams(params);
      }
      cb(err, accessToken, refreshToken, params);
    });

    origGetToken.apply(this, args);
  };
}
util.inherits(Strategy, OAuth2Strategy);
module.exports = Strategy;

/**
 * Wrap OAuth2 parameters while pretending to be the access token string.
 */
function AccessTokenWithParams(params) {
  this.params = params;
}

AccessTokenWithParams.prototype.toString = function() {
  return this.params.access_token;
};

/**
 * Override the OAuth2Strategy method.
 */
Strategy.prototype.authorizationParams = function(options) {
  var params = {};

  if (options.display)
    params.display = options.display;
    
  if (options.prompt)
    params.prompt = options.prompt;
    
  if (options.login_hint)
    params.login_hint = options.login_hint;

  return params;
};

/**
 * Override the OAuth2Strategy method.
 */
Strategy.prototype.userProfile = function(accessToken, cb) {
  var self = this;
  var params = accessToken.params;
  if (!params) {
    return cb(new Error('AccessToken did not have attached OAuth2 params'));
  }

  var baseUrl = url.parse(params.instance_url);
  var idUrl = url.parse(params.id);
  idUrl.host = baseUrl.host;

  self.getJSON(idUrl, accessToken, function(err, rawProfile) {
    if (err) {
      return cb(err);
    }

    var profile = {
      _raw: rawProfile,
    };

    if (self._skipPhoto) {
      return cb(null, self.coerceProfile(profile));
    }

    var photoUrl = url.parse(rawProfile.urls.users);
    photoUrl.pathname =
      photoUrl.pathname.replace('{version}', '29.0') +
      '/me/photo';

    self.getJSON(photoUrl, accessToken, function(err, photoInfo) {
      err = null; // ignore and proceed regardless
      profile._raw._photo = photoInfo || null;
      cb(null, self.coerceProfile(profile));
    });
  });
};

/**
 * Wrapper for getting JSON with the specified access token.
 */
Strategy.prototype.getJSON = function(theUrl, token, cb) {
  if (typeof theUrl !== 'string') {
    theUrl = url.format(theUrl);
  }

  this._oauth2.get(theUrl, token, function(err, body) {
    if (err) {
      return cb(err);
    }

    var parsed;
    try {
      parsed = JSON.parse(body);
    } catch(e) {
      return cb(e);
    }

    cb(null, parsed);
  });
};

/**
 * Coerce a profile to the standard Passport format.
 */
Strategy.prototype.coerceProfile = function(profile) {
  var raw = profile._raw;
  var photoInfo = raw._photo;

  profile.provider = this.name;
  profile.id = raw.organization_id + '/' + raw.user_id;
  profile.displayName = raw.display_name;
  profile.name = {
    familyName: raw.last_name,
    givenName: raw.first_name
  };
  profile.emails = [
    { value: raw.email }
  ];

  if (photoInfo) {
    profile.photos = [
      { value: photoInfo.standardEmailPhotoUrl }
    ];
  }

  return profile;
};
