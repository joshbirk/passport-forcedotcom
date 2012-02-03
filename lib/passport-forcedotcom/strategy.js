/**
 * Module dependencies.
 */
var querystring = require('querystring'),
    util = require('util'), 
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://login.salesforce.com/services/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://login.salesforce.com/services/oauth2/token';
  options.scopeSeparator = options.scopeSeparator || ',';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'forcedotcom';

  var self = this; // so we can set `_results` on the strategy instance
  this._oauth2.getOAuthAccessToken = function(code, params, callback) {
    // This form preserves the params sent as arguments, so grant_type and
    // redirect_uri don't need to be re-specified.
    var params= params || {};
    params['client_id'] = this._clientId;
    params['client_secret'] = this._clientSecret;
    params['code']= code;

    var post_data = querystring.stringify( params );
    var post_headers = {
      'Content-Length': post_data.length,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept':'application/jsonrequest',
      'Cache-Control':'no-cache,no-store,must-revalidate'};

    this._request("POST", this._getAccessTokenUrl(), post_headers, post_data, null, function(error, data, response) {
      if( error ) { console.log(error); callback(error); }
      else {
        var results;
        results = JSON.parse( data );
        self._results = results;
        var access_token = results["access_token"];
        callback(null, results["access_token"], results["refresh_token"]);
      }
    });
  }

}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


Strategy.prototype.userProfile = function(token, done) {
  done(null, this._results);
}




/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
