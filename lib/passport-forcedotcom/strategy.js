/*
Copyright (c) 2011, salesforce.com, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, 
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, 
    this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, 
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.
    * Neither the name of the salesforce.com, Inc. nor the names of its contributors 
    may be used to endorse or promote products derived from this software 
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, 
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, 
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE 
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
OF THE POSSIBILITY OF SUCH DAMAGE.

*/


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
