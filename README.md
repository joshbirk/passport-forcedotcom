# passport-forcedotcom

<p align="center">
  <img src="https://raw.github.com/joshbirk/passport-forcedotcom/master/images/sf.png" alt="SalesForce" />
</p>

This is a Strategy for use with [PassportJS](http://passportjs.org) with the
Force.com platform (meaning you can use it with Saleforce CRM, your Force.com
applications and Database.com).

**Please Note** that as of version 0.1.0, successful authentication now results
in a standard [PassportJS User Profile](http://passportjs.org/guide/profile/)
object.

### Usage

1. Download this npm module

```sh
npm install --save passport-forcedotcom
```

2. Import it into your app

```javascript
var passport = require('passport');
var ForceDotComStrategy = require('passport-forcedotcom').Strategy;
```

3. Define the strategy with your application credentials and information

```javascript
passport.use(new ForceDotComStrategy({
  clientID: '{client_id}',
  clientSecret: '{client_secret}',
  scope: ['id','chatter_api'],
  callbackURL: 'https://my.example.com/auth/forcedotcom/callback'
}, function verify(token, refreshToken, profile, done) {
  console.log(profile);
  return done(null, profile);
}));
```

4. And then setup some routes to hande the flow

```javascript
app.get('/auth/forcedotcom', passport.authenticate('forcedotcom'), {
  display: "page", // valid values are: "page", "popup", "touch", "mobile"
  prompt: "", // valid values are: "login", "consent", or "login consent"
  login_hint: ""
});
// this should match the callbackURL parameter above:
app.get('/auth/forcedotcom/callback',
  passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
  function(req, res){
    res.render("index",checkSession(req));
  }
);
```

And as usual with passport, you can update the user serialization/de-serialization.

### Creating a Connected App

In order to use this Strategy, you'll need to have a [Connected
App](https://help.salesforce.com/apex/HTViewHelpDoc?id=connected_app_overview.htm)
inside of Salesforce.  See [this
article](https://help.salesforce.com/apex/HTViewHelpDoc?id=connected_app_create.htm)
for detailed and up-to-date Connected App creation instructions.

Tips:

- Please note that the `client_id` is referred to as "Consumer Key" and the
  `client_secret` is referred to as the "Consumer Secret" in some of the UI and
  documentation.
- Be sure to set the Connected App's callback URL to the same setting you
  provided in the `new ForceDotComStrategy` constructor.  If you're using
  `express`, then the route you attach must also correspond to this URL (e.g.
  `app.get('/auth/forcedotcom/callback', ...)`
- to get a `photos` section in the [User
  Profile](http://passportjs.org/guide/profile/) you need to set up the `api`
  or `chatter_api` scope when creating the Connected App.
  - the URL to the photo lasts for ~30 days
  - if you do not need the photos, supply a `skipPhoto: true` option to the
    `ForceDotComStrategy` constructor and only enable the `id` scope.

### Example

There is an example app called `simple-example` in: `examples/` folder. This shows how to use ForceDotCom-Passport with lots of comments.
To run locally:

1. Open `app.js` in `examples/simple-example`
2. Set `CF_CLIENT_ID`, `CF_CLIENT_SECRET`, `CF_CALLBACK_URL` and optionally, `SF_AUTHORIZE_URL`,  `SF_TOKEN_URL` to match your connected app's settings.
3. Install npm modules by running `npm install`
4. Run: `node app.js`
5. Open `localhost:3000` in the browser and try to login using OAuth.

### Authors

- <a href='https://twitter.com/joshbirk' target='_blank'>Joshua Birk</a>
- <a href='https://twitter.comrajaraodv' target='_blank'> Raja Rao DV </a>
- <a href='https://twitter.com/jaredhanson' target='_blank'>Jared Hanson</a> -
  whose help resolved a previous issue with handling the incoming OAuth
  information so that things like the `instance_url` can be readily available.
- <a href='https://goinstant.com' target='_blank'>GoInstant</a>

### Legal

©2013-2014 salesforce.com, All Rights Reserved.

Use and distribution is licensed under the 3-Clause BSD License.
