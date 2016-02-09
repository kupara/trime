(function() {
  'use strict';

  var passport = require('passport'),
    Users = require('../models').Users,
    jwt = require('jsonwebtoken');

  module.exports = {
    all: function(req, res, next) {
      var q = req.query.q,
        query;

      if (q) {
        query = {
          where: {
            name: {
              $iLike: '%' + q + '%'
            }
          }
        };
      }

      Users.sync().then(function() {
          return Users.findAll(query)
            .then(function(users) {
              return res.json(users);
            });
        })
        .catch(function(err) {
          return next(err);
        });
    },

    signup: function(req, res, next) {
      passport.authenticate('signup', function(err, user) {
        if (err) {
          return res.status(500).send({
            error: err.errors[0] || err.message
          });
        }

        if (!user) {
          return res.status(500).send({
            error: 'Error creating user.'
          });
        }

        user.password = null;
        return res.json(user);
      })(req, res, next);
    },

    // Login middleware handler
    login: function(req, res, next) {
      passport.authenticate('login', function(err, user) {
        if (err) {
          return res.status(401).send({
            error: err
          });
        }
        if (!user) {
          return res.status(500).send({
            error: 'Wrong email password combination'
          });
        }
        // Set user password to null
        var secretKey = req.app.get('superSecret');
        user.password = null;
        var token = jwt.sign(user, secretKey, {
          expireIn: '24h'
        });
        req.session.user = user;
        res.json({
          user: user,
          token: token
        });
      })(req, res, next);
    },

    // session: function(req, res) {
    //   if (req.session.user) {
    //     res.send(req.session.user);
    //   } else {
    //     res.status(401).send({
    //       error: {} // You are not logged in.
    //     });
    //   }
    // },

    authenticate: function(req, res, next) {
      var token = req.headers['x-access-token'];
      if (token) {
        var secretKey = req.app.get('superSecret');
        jwt.verify(token, secretKey, function(err, decoded) {
          if (!err) {
            req.decoded = decoded;
            console.log(decoded)
            next();
          } else {
            return res.status(401).send({
              message: 'Failed to Authenticate'
            });
          }
        });
      } else {
        return res.status(401).send({
          message: 'You are not authenticated'
        });
      }
    },

    superAdmin: function(req, res, next) {
      if (req.user && req.user.role === 1) {
        next();
      } else {
        res.status(403).send({
          error: 'Forbidden'
        });
      }
    },

    orgAdmin: function(req, res, next) {
      if (req.user && req.user.role === 1) {
        next();
      } else {
        res.status(403).send({
          error: 'Forbidden'
        });
      }
    }
  };
})();
