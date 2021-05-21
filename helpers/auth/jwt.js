var passport = require('passport');
var passportJWT = require('passport-jwt');
var jwt = require('jsonwebtoken');
var employee = require('../../models/employee');
var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;
var jwtSession = false;
var _ =  require('underscore');
var params = {
  secretOrKey: 'xyz',
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: true
};

passport.serializeUser(function(user, done) {
  // console.log(user)
 return done(null, user);
});

passport.deserializeUser(function(id, done) {
  employee.findById(id, function (err, user) {
   return done(err, user);
  });
});


module.exports = function () {
  var strategy = new Strategy(params, function (payload, done) {
    if (!payload) {
      return done(
          new Error('Missing token'),
            null);
    }

    if (payload.exp < Date.now()/1000) {
      return done(
           new Error('Expired token'),
          null);
    }

    employee.findById(payload.user, function (err, results) {
      // console.log("findById", results)
      if (!_.isArray(results) || results.length == 0) {
        return done(
          new Error('Invalid token'),
          null);
      }
      // console.log("done", results)
      return done(null, results);
    });
  });
  passport.use(strategy);
  return {
    initialize: function () {
      return passport.initialize();
    },
    authenticate: function () {
      return passport.authenticate('jwt');
    }
  };
};