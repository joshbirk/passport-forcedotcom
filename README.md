<h1>passport-forcedotcom</h1>

This is a Strategy for use with http://passportjs.org with the Force.com platform (meaning you can use it with Saleforce CRM, your Force.com applications and Database.com).  With Jared Hanson's help - it properly resolves a previous issue with handling the incoming OAuth information so that things like the instance_url can be readily available.

You'll need to require it:

```
var passport = require('passport')
  , ForceDotComStrategy = require('passport-forcedotcom').Strategy
 ```


 Define the strategy with your application credentials and information:

 ```
 passport.use(new ForceDotComStrategy({
    clientID: '{clientID}',
    clientSecret: '{clientSecret}',
    callbackURL: '{callbackUrl}'
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile);
    return done(null, profile);
  }
));
```

And then setup some routes to hande the flow:

```
app.get('/login', passport.authenticate('forcedotcom'));
app.get('/token', 
  passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
  function(req, res){
    res.render("index",checkSession(req));
  });
  ```

And as usual with passport, you can update the user serialization/de-serialization.


###Example
There is an example app called `simple-example` in: `examples/` folder. This shows how to use ForceDotCom-Passport with lots of comments. 
To run locally:

1. Open `app.js` in `examples/simple-example`
2. Set `CF_CLIENT_ID`, `CF_CLIENT_SECRET`, `CF_CALLBACK_URL` and optionally, `SF_AUTHORIZE_URL`,  `SF_TOKEN_URL` to match your connected app's settings.
3. Install npm modules by running `npm install`
4. Run: `node app.js`
5. Open `localhost:3000` in the browser and try to login using OAuth.

